"""
evaluate.py — evalúa un checkpoint sobre el test split.

Genera reporte detallado con confusion matrix + métricas por clase
+ ejemplos de errores para análisis manual.

Uso:
  python scripts/evaluate.py --model models/checkpoints/best/ --test data/test.csv
"""
import argparse
import json
from pathlib import Path

import pandas as pd
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)


LABEL2ID = {"clean": 0, "review": 1, "reject": 2}
ID2LABEL = {v: k for k, v in LABEL2ID.items()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, help="checkpoint dir")
    parser.add_argument("--test", required=True, help="test.csv")
    parser.add_argument("--output", default="evaluation_report.json")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--max-length", type=int, default=64)
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSequenceClassification.from_pretrained(args.model).to(device)
    model.eval()

    test_df = pd.read_csv(args.test)
    texts = test_df["text"].astype(str).tolist()
    labels = [LABEL2ID[l] for l in test_df["label"]]

    preds = []
    confidences = []
    with torch.no_grad():
        for i in range(0, len(texts), args.batch_size):
            batch = texts[i : i + args.batch_size]
            enc = tokenizer(
                batch,
                padding=True,
                truncation=True,
                max_length=args.max_length,
                return_tensors="pt",
            ).to(device)
            outputs = model(**enc)
            probs = torch.softmax(outputs.logits, dim=-1).cpu().numpy()
            preds.extend(np.argmax(probs, axis=-1).tolist())
            confidences.extend(probs.max(axis=-1).tolist())

    # ── Métricas globales ───────────────────────────────────────────
    accuracy = accuracy_score(labels, preds)
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\n" + classification_report(
        labels, preds,
        target_names=[ID2LABEL[i] for i in range(3)],
        digits=4,
        zero_division=0,
    ))

    # ── Confusion matrix ─────────────────────────────────────────────
    cm = confusion_matrix(labels, preds)
    print("\nConfusion matrix (rows=truth, cols=pred):")
    print("           clean  review  reject")
    for i, label_name in ID2LABEL.items():
        print(f"  {label_name:7s}: {cm[i]}")

    # ── Errores: ejemplos donde la predicción != verdad ──────────────
    errors = []
    for text, truth, pred, conf in zip(texts, labels, preds, confidences):
        if truth != pred:
            errors.append({
                "text": text,
                "truth": ID2LABEL[truth],
                "pred": ID2LABEL[pred],
                "confidence": round(float(conf), 4),
            })
    print(f"\nErrors: {len(errors)}/{len(texts)} ({100*len(errors)/len(texts):.2f}%)")

    # Mostrar los 20 con mayor confidence (errores "seguros" — peores)
    errors_sorted = sorted(errors, key=lambda e: -e["confidence"])[:20]
    print("\nTop 20 errores con mayor confidence (más graves):")
    for e in errors_sorted:
        print(f"  [{e['confidence']:.3f}] {e['truth']:6s} → {e['pred']:6s}  '{e['text']}'")

    # ── Reporte JSON ─────────────────────────────────────────────────
    report = {
        "accuracy": accuracy,
        "confusion_matrix": cm.tolist(),
        "classification_report": classification_report(
            labels, preds,
            target_names=[ID2LABEL[i] for i in range(3)],
            output_dict=True,
            zero_division=0,
        ),
        "n_errors": len(errors),
        "error_rate": len(errors) / len(texts),
        "top_errors": errors_sorted,
    }
    with open(args.output, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Report saved to {args.output}")


if __name__ == "__main__":
    main()
