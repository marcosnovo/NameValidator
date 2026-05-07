"""
prepare_dataset.py — consolida exports de KV en CSV de entrenamiento.

Espera (en --kv-export):
  ai-checks.csv          — todas las llamadas /api/ai-check
  approvals.csv          — registros de /api/approve
  rejections.csv         — registros de /api/reject (cuando se implemente)

Genera (en --output):
  train.csv  (80% estratificado)
  val.csv    (10%)
  test.csv   (10%)

Anti-leakage: excluye inputs presentes en tests/golden.test.js del train/val,
los manda exclusivamente al test split.

Uso:
  python scripts/prepare_dataset.py --kv-export ../dataset/ --output data/
"""
import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path
from collections import Counter

import pandas as pd
from sklearn.model_selection import train_test_split


def load_golden_inputs(repo_root: Path) -> set:
    """Lee los inputs del golden test suite para excluirlos del train."""
    golden_file = repo_root / "tests" / "golden.test.js"
    if not golden_file.exists():
        return set()
    text = golden_file.read_text(encoding="utf-8")
    # Heurística simple: extrae strings literales que son nombres
    pattern = re.compile(r"\['([^']+)',\s*'(?:ALLOWED|REVIEW|REJECTED)'", re.IGNORECASE)
    return {m.group(1) for m in pattern.finditer(text)}


def label_from_verdict(verdict: str, confidence: int = 0) -> str:
    """Mapea el verdict de la AI al label de 3 clases."""
    v = (verdict or "").upper()
    if v in ("CLEAN", "ALLOWED"):
        return "clean"
    if v in ("REVIEW", "SUSPICIOUS"):
        return "review"
    if v in ("REJECTED", "OFFENSIVE"):
        return "reject"
    return "clean"  # default fallback


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--kv-export", required=True, help="dir with KV CSV exports")
    parser.add_argument("--output", required=True, help="output dir for train/val/test")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--repo-root", default="..", help="path to NameValidator repo root")
    args = parser.parse_args()

    kv_dir = Path(args.kv_export)
    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    # ── Cargar AI checks (mayor volumen, baja confianza) ─────────────────
    ai_checks_path = kv_dir / "ai-checks.csv"
    if not ai_checks_path.exists():
        print(f"⚠ {ai_checks_path} no existe — saltando", file=sys.stderr)
        ai_df = pd.DataFrame(columns=["input", "verdict", "confidence_offensive"])
    else:
        ai_df = pd.read_csv(ai_checks_path)
    ai_records = []
    for _, row in ai_df.iterrows():
        text = str(row.get("input", "")).strip()
        if not text:
            continue
        ai_records.append({
            "text": text,
            "label": label_from_verdict(row.get("verdict")),
            "source": "auto-clean" if row.get("verdict") == "CLEAN" else f"claude-{row.get('verdict', 'unknown').lower()}",
            "confidence": 0.85,
            "language_hint": "",
            "context": "real-madrid",  # default; ajustar si se exporta
        })

    # ── Cargar aprobaciones humanas (high confidence) ────────────────────
    approvals_path = kv_dir / "approvals.csv"
    approvals_records = []
    if approvals_path.exists():
        approvals_df = pd.read_csv(approvals_path)
        for _, row in approvals_df.iterrows():
            text = str(row.get("input", row.get("input_preview", ""))).strip()
            if not text:
                continue
            approvals_records.append({
                "text": text,
                "label": "clean",  # operario aprobó → es CLEAN
                "source": "human-approval",
                "confidence": 1.00,
                "language_hint": "",
                "context": row.get("context", "real-madrid"),
            })

    # ── Cargar rechazos manuales del operario (high confidence) ──────────
    rejections_path = kv_dir / "rejections.csv"
    rejections_records = []
    if rejections_path.exists():
        rejections_df = pd.read_csv(rejections_path)
        for _, row in rejections_df.iterrows():
            text = str(row.get("input", "")).strip()
            if not text:
                continue
            rejections_records.append({
                "text": text,
                "label": "reject",
                "source": "human-rejection-override",
                "confidence": 1.00,
                "language_hint": "",
                "context": row.get("context", "real-madrid"),
            })

    # ── Combinar + dedupe ─────────────────────────────────────────────────
    all_records = ai_records + approvals_records + rejections_records
    df = pd.DataFrame(all_records)
    print(f"Total records: {len(df)}")

    # Si hay conflicto (mismo texto, diferentes labels), preferir
    # human-approval > human-rejection > auto-clean.
    SOURCE_PRIORITY = {
        "human-approval": 3,
        "human-rejection-override": 3,
        "claude-suspicious": 2,
        "claude-rejected": 2,
        "auto-clean": 1,
    }
    df["_priority"] = df["source"].map(lambda s: SOURCE_PRIORITY.get(s, 0))
    df = df.sort_values("_priority", ascending=False).drop_duplicates(subset=["text"]).drop(columns=["_priority"])

    # ── Anti-leakage: excluir golden inputs del train/val ─────────────────
    repo_root = Path(args.repo_root).resolve()
    golden_inputs = load_golden_inputs(repo_root)
    print(f"Golden test inputs found: {len(golden_inputs)} (will be in test split only)")

    is_golden = df["text"].isin(golden_inputs)
    df_test_golden = df[is_golden]
    df_pool = df[~is_golden]

    # ── Split estratificado del pool ──────────────────────────────────────
    train_df, temp_df = train_test_split(
        df_pool,
        test_size=0.2,
        stratify=df_pool["label"],
        random_state=args.seed,
    )
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.5,
        stratify=temp_df["label"],
        random_state=args.seed,
    )
    test_df = pd.concat([test_df, df_test_golden], ignore_index=True)

    # ── Guardar ─────────────────────────────────────────────────────────
    cols = ["text", "label", "source", "confidence", "language_hint", "context"]
    train_df[cols].to_csv(out_dir / "train.csv", index=False)
    val_df[cols].to_csv(out_dir / "val.csv", index=False)
    test_df[cols].to_csv(out_dir / "test.csv", index=False)

    # ── Reporte ─────────────────────────────────────────────────────────
    print("\n=== Distribution de labels ===")
    for split, sdf in [("train", train_df), ("val", val_df), ("test", test_df)]:
        print(f"\n{split} ({len(sdf)}):")
        for label, count in Counter(sdf["label"]).most_common():
            print(f"  {label:8s}: {count:6d}  ({100*count/len(sdf):.1f}%)")


if __name__ == "__main__":
    main()
