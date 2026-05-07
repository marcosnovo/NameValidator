# Dataset spec — HALO Validator training data

## Formato

CSV con columnas:

| Columna | Tipo | Descripción |
|---|---|---|
| `text` | string | el nombre tal como lo escribió el visitante (ej. "Pep Guardiola") |
| `label` | enum | una de: `clean` / `review` / `reject` |
| `source` | enum | de dónde viene la etiqueta (ver abajo) |
| `confidence` | float (0-1) | confianza de la etiqueta — 1.0 si humano, <1 si automática |
| `language_hint` | string opcional | `es` / `en` / `mixed` / etc. — sólo si conocido |
| `context` | enum | `real-madrid` / `fc-barcelona` / etc. |

Ejemplo:
```csv
text,label,source,confidence,language_hint,context
"Carlos García López",clean,auto-clean,0.95,es,real-madrid
"Adolf Hitler",reject,historical-figure-rare,1.00,de,real-madrid
"Pep Guardiola",reject,rival-player-full-match,1.00,es,real-madrid
"Pablo Escobar",review,historical-figure-fullname,1.00,es,real-madrid
"Mike Hunt",reject,joke-name-phonetic,1.00,en,real-madrid
"Francisco Franco García",clean,human-approval,1.00,es,real-madrid
"José Bretón",reject,human-rejection-override,1.00,es,real-madrid
"María Pizarro",clean,human-approval,1.00,es,real-madrid
"Christos Georgiou",clean,whitelist-greek-name,0.95,el,real-madrid
"Yannis Papadopoulos",review,historical-junta-greek,1.00,el,real-madrid
"Park Min-jun",clean,whitelist-korean-name,0.95,ko,real-madrid
```

## Sources reconocidas

### High confidence (1.0) — etiqueta humana

- `human-approval` — operario aprobó manualmente algo que el sistema marcó REVIEW/SUSPICIOUS
- `human-rejection-override` — operario rechazó algo que el sistema marcó CLEAN/REVIEW
- `golden-test` — caso del corpus de tests del repo

### Medium confidence (0.85-0.95) — heurística determinista

- `rival-player-full-match` — match exacto de nombre+apellido en blocklist Real Madrid
- `historical-figure-rare` — match de surname raro en HISTORICAL_RARE_SURNAMES
- `historical-figure-fullname` — match completo de figura histórica
- `joke-name-phonetic` — match de joke names en cualquier idioma
- `whitelist-*` — pasó por scunthorpe whitelist (alta confianza de CLEAN)
- `auto-clean` — superó todas las capas estáticas + AI dijo CLEAN con confidence ≥80

### Low confidence (0.5-0.85) — AI semántica solo

- `claude-suspicious` — Claude dijo SUSPICIOUS con confidence ≥50
- `gpt-suspicious` — idem GPT
- `gemini-suspicious` — idem Gemini

## Splits recomendados

- **Train**: 80% — estratificado por `label` para mantener distribución
- **Val**: 10% — para early stopping
- **Test**: 10% — held-out estricto, NUNCA mirado durante entrenamiento

## Balanceo

Si el dataset es muy desbalanceado (típico: 60% CLEAN, 15% REVIEW, 25% REJECTED):

1. **Class weights** en la loss (preferido, mantiene todos los datos)
2. **Oversampling** de la minority class (REVIEW)
3. **Undersampling** de CLEAN si hay >10x del REJECTED

## Augmentation

Útil para REJECTED cuando es minority class:

- Substitutions: `o`→`0`, `i`→`1`, `e`→`3` (leet)
- Spacing: meter espacios entre letras
- Unicode confusables: `a` (latín) ↔ `а` (cyrillic)
- Reverso: `puta` → `atup`
- Concatenación / re-segmentación: "Aitor Tilla" ↔ "AitorTilla"

## Anti-test-leakage

Antes de entrenar, **excluir cualquier input que aparezca en `tests/golden.test.js`** del train/val. Sólo van al test split. Esto asegura que el accuracy en test refleja generalización real, no memorización de los casos de test.

```python
# En prepare_dataset.py
GOLDEN_INPUTS = load_golden_test_inputs()
df = df[~df.text.isin(GOLDEN_INPUTS)]
```
