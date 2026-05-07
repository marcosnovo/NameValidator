"""
train.py — fine-tune DistilBERT-multilingual para clasificación de nombres.

Tarea: clasificación de 3 clases (clean / review / reject).

Uso:
  python scripts/train.py \\
    --train data/train.csv --val data/val.csv \\
    --epochs 5 --batch-size 32 --lr 5e-5 \\
    --output models/checkpoints/

Salida: directorio con `best/` (mejor checkpoint) y `last/` (último checkpoint).
"""
import argparse
import os
import json
from pathlib import Path

import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support


LABEL2ID = {"clean": 0, "review": 1, "reject": 2}
ID2LABEL = {v: k for k, v in LABEL2ID.items()}


class HaloDataset(Dataset):
    def __init__(self, df, tokenizer, max_length=64):
        self.texts = df["text"].astype(str).tolist()
        self.labels = [LABEL2ID[l] for l in df["label"]]
        self.confidences = df.get(
            "confidence", pd.Series([1.0] * len(df))
        ).astype(float).tolist()
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(
            self.texts[idx],
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )
        return {
            "input_ids": enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


def compute_metrics(eval_pred):
    """Métricas: accuracy, F1 macro, precision/recall por clase."""
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    accuracy = accuracy_score(labels, preds)
    f1_macro = f1_score(labels, preds, average="macro", zero_division=0)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average=None, zero_division=0,
    )
    metrics = {
        "accuracy": accuracy,
        "f1_macro": f1_macro,
    }
    for i, label_name in ID2LABEL.items():
        if i < len(precision):
            metrics[f"precision_{label_name}"] = precision[i]
            metrics[f"recall_{label_name}"] = recall[i]
            metrics[f"f1_{label_name}"] = f1[i]
    return metrics


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model", default="distilbert-base-multilingual-cased",
        help="HuggingFace model id (default: distilbert-base-multilingual-cased)",
    )
    parser.add_argument("--train", required=True, help="train.csv")
    parser.add_argument("--val", required=True, help="val.csv")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=5e-5)
    parser.add_argument("--max-length", type=int, default=64)
    parser.add_argument("--output", required=True, help="output dir for checkpoints")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    # ── Setup ──────────────────────────────────────────────────────────
    torch.manual_seed(args.seed)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    train_df = pd.read_csv(args.train)
    val_df = pd.read_csv(args.val)
    print(f"Train: {len(train_df)} | Val: {len(val_df)}")

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSequenceClassification.from_pretrained(
        args.model,
        num_labels=3,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    train_dataset = HaloDataset(train_df, tokenizer, max_length=args.max_length)
    val_dataset = HaloDataset(val_df, tokenizer, max_length=args.max_length)

    # ── Class weights para desbalance ──────────────────────────────────
    label_counts = train_df["label"].value_counts()
    total = len(train_df)
    weights = torch.tensor([
        total / (3 * label_counts.get("clean", 1)),
        total / (3 * label_counts.get("review", 1)),
        total / (3 * label_counts.get("reject", 1)),
    ], dtype=torch.float)
    print(f"Class weights: {weights.tolist()}")

    # ── TrainingArguments ──────────────────────────────────────────────
    training_args = TrainingArguments(
        output_dir=str(output_dir / "checkpoints"),
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size * 2,
        learning_rate=args.lr,
        warmup_ratio=0.1,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="f1_macro",
        greater_is_better=True,
        logging_dir=str(output_dir / "logs"),
        logging_steps=50,
        report_to="none",
        seed=args.seed,
    )

    # ── Custom Trainer con weighted loss ───────────────────────────────
    class WeightedTrainer(Trainer):
        def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
            labels = inputs.pop("labels")
            outputs = model(**inputs)
            logits = outputs.get("logits")
            loss_fct = torch.nn.CrossEntropyLoss(weight=weights.to(logits.device))
            loss = loss_fct(logits.view(-1, 3), labels.view(-1))
            return (loss, outputs) if return_outputs else loss

    trainer = WeightedTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        tokenizer=tokenizer,
    )

    # ── Train ─────────────────────────────────────────────────────────
    trainer.train()
    final_metrics = trainer.evaluate()
    print("\n=== Final eval ===")
    print(json.dumps(final_metrics, indent=2))

    # ── Save best ─────────────────────────────────────────────────────
    best_dir = output_dir / "best"
    trainer.save_model(str(best_dir))
    tokenizer.save_pretrained(str(best_dir))
    with open(best_dir / "metrics.json", "w") as f:
        json.dump(final_metrics, f, indent=2)
    print(f"\n✓ Best model saved to {best_dir}")


if __name__ == "__main__":
    main()
