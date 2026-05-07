# ML training pipeline — HALO Validator

Scaffold para entrenar un modelo ML propio que reemplace o complemente la capa AI semántica (Claude/GPT/Gemini). Objetivo:

- **Latencia <100 ms** vs 1-3s actuales con providers externos
- **Coste $0/llamada** vs ~$0.005/llamada
- **Offline-capable** (corre on-device en mobile o on-Worker via ONNX)
- **Privacidad** — los nombres no salen del entorno controlado

## Estado actual

⚠️ **Esto es un scaffold**. No se entrena nada hasta tener dataset real (~2.000-5.000 ejemplos etiquetados). Ver `DEPLOYMENT.md` sección 5-6 sobre cómo recopilarlo.

## Cuándo arrancar

Cuando tengas:
- ≥ 30 días de uso real con operarios
- ≥ 2.000 decisiones humanas etiquetadas (mix approvals + rejections + casos auto-clean)
- Distribución razonable: ~60% CLEAN, ~15% REVIEW, ~25% REJECTED

Antes de eso, el modelo será peor que las heurísticas + Claude actuales.

## Plan técnico

### Arquitectura objetivo

**Modelo base**: `distilbert-base-multilingual-cased`
- Tamaño: ~135 MB (manejable on-device)
- 12 idiomas cubiertos out-of-the-box
- 6 capas vs 12 de BERT — 60% más rápido con 97% de la calidad

**Fine-tuning task**: clasificación de 3 clases (`clean` / `review` / `reject`)

**Datasets esperados**:
| Source | Cantidad | Etiqueta automática |
|---|---|---|
| Validaciones reales con verdict de Claude | ~50.000 | confidence_offensive → 3 clases |
| Aprobaciones humanas (operario) | ~500 | `clean` (override) |
| Rechazos humanos (operario) | ~200 | `reject` (override) |
| Golden tests del repo | ~150 | etiqueta del test |
| Adversarial generated | ~500 | etiqueta original |

**Output**: 3 formatos exportados:
- `halo-classifier.onnx` — para el Cloudflare Worker via `@xenova/transformers`
- `halo-classifier.tflite` — para Android via `tflite_flutter`
- `halo-classifier.mlmodel` — para iOS via Core ML

## Estructura del directorio

```
ml-training/
├── README.md              ← este archivo
├── requirements.txt       ← deps Python
├── data/
│   ├── README.md          ← especificación del dataset
│   ├── train.csv          ← (creado tras export del KV)
│   ├── val.csv            ← split estratificado
│   └── test.csv           ← held-out
├── scripts/
│   ├── prepare_dataset.py ← consolidar CSVs del KV en formato de entrenamiento
│   ├── train.py           ← fine-tune DistilBERT-multilingual
│   ├── evaluate.py        ← métricas: accuracy, F1, precision/recall por clase
│   ├── export_onnx.py     ← exportar a ONNX para el Worker
│   ├── export_tflite.py   ← exportar a TFLite para Android
│   └── export_coreml.py   ← exportar a CoreML para iOS
└── models/
    ├── checkpoints/       ← guardado durante entrenamiento
    └── final/             ← modelo exportado final
```

## Pasos para entrenar (cuando llegue el momento)

```bash
# 1. Setup
cd ml-training
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Preparar dataset (tras export desde KV — ver DEPLOYMENT.md §5)
python scripts/prepare_dataset.py \
  --kv-export ../dataset/ \
  --output data/

# 3. Train
python scripts/train.py \
  --model distilbert-base-multilingual-cased \
  --train data/train.csv \
  --val data/val.csv \
  --epochs 5 \
  --batch-size 32 \
  --lr 5e-5 \
  --output models/checkpoints/

# 4. Evaluate
python scripts/evaluate.py \
  --model models/checkpoints/best/ \
  --test data/test.csv

# 5. Export
python scripts/export_onnx.py --model models/checkpoints/best/ --output models/final/halo-classifier.onnx
python scripts/export_tflite.py --model models/checkpoints/best/ --output models/final/halo-classifier.tflite
python scripts/export_coreml.py --model models/checkpoints/best/ --output models/final/halo-classifier.mlmodel
```

## Métricas objetivo

Para que el modelo propio sustituya a Claude/GPT/Gemini:

| Métrica | Mínimo aceptable | Objetivo |
|---|---|---|
| **Accuracy global** | 88% | 92%+ |
| **Recall en REJECTED** | 95% | 98% (no queremos falsos negativos en ofensivos) |
| **Precision en CLEAN** | 90% | 95% (no queremos falsos positivos en limpios) |
| **F1 macro** | 0.85 | 0.90 |
| **Latencia inference** | 100 ms | <50 ms en CPU |
| **Tamaño modelo** | <200 MB | <100 MB tras quantization |

Si NO se alcanza el mínimo aceptable, mantener Claude/GPT/Gemini y volver a entrenar con más datos.

## Active learning loop (futuro)

Tras desplegar el modelo:

1. **Mes 2-3**: el modelo corre en sombra (devuelve predicción pero NO afecta el verdict, sólo se loguea junto con el de Claude)
2. **Mes 4**: A/B test — 50% del tráfico al modelo propio, 50% a Claude. Comparar approvals/rejections del operario.
3. **Mes 5+**: si el modelo propio tiene mismo o mejor performance, sustituir Claude. Quedarse Claude como fallback de emergencia.
4. **Cada 30 días**: re-entrenar con los nuevos approvals/rejections del operario.

## Coste estimado

- Entrenamiento inicial: $0 (en local con MacBook M-series, 2-4 horas) o ~$5 (Google Colab Pro)
- Inferencia en Worker: gratis (Cloudflare Workers Free tier maneja ONNX vía `@xenova/transformers` con WASM)
- Hosting modelo: gratis (Cloudflare R2 free tier — el modelo de 100MB cabe sobrado)

vs Claude/GPT/Gemini: ~$250-500/mes para 50k validaciones.

**ROI**: si se llega al mínimo aceptable, payback < 1 mes.

---

## Referencias

- DistilBERT-multilingual: https://huggingface.co/distilbert-base-multilingual-cased
- Hugging Face fine-tuning guide: https://huggingface.co/docs/transformers/training
- ONNX export: https://onnxruntime.ai/docs/tutorials/transformers.html
- TFLite Flutter: https://pub.dev/packages/tflite_flutter
- @xenova/transformers (Worker WASM): https://huggingface.co/docs/transformers.js
