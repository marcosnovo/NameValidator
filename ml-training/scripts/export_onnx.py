"""
export_onnx.py — exporta el modelo fine-tuned a ONNX para servirlo desde el
Cloudflare Worker via @xenova/transformers (WASM).

Uso:
  python scripts/export_onnx.py --model models/checkpoints/best/ \\
                                --output models/final/halo-classifier.onnx
"""
import argparse
from pathlib import Path

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, help="checkpoint dir")
    parser.add_argument("--output", required=True, help="output .onnx file")
    parser.add_argument("--max-length", type=int, default=64)
    parser.add_argument("--opset", type=int, default=14)
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSequenceClassification.from_pretrained(args.model)
    model.eval()

    # Input dummy con batch=1, longitud max
    dummy_input = tokenizer(
        "Carlos García López",
        return_tensors="pt",
        padding="max_length",
        max_length=args.max_length,
        truncation=True,
    )

    torch.onnx.export(
        model,
        (dummy_input["input_ids"], dummy_input["attention_mask"]),
        str(output_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "attention_mask": {0: "batch_size", 1: "sequence_length"},
            "logits": {0: "batch_size"},
        },
        opset_version=args.opset,
        do_constant_folding=True,
    )

    # Guardar también el tokenizer en el mismo dir para que @xenova lo cargue
    tokenizer.save_pretrained(str(output_path.parent / "tokenizer"))

    size_mb = output_path.stat().st_size / 1024 / 1024
    print(f"✓ ONNX model saved: {output_path} ({size_mb:.1f} MB)")
    print(f"✓ Tokenizer saved:  {output_path.parent / 'tokenizer'}")


if __name__ == "__main__":
    main()
