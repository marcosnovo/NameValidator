# HALO Name Validator

Sistema de validación de nombres para mostrar en el HALO del Santiago Bernabéu.
Detecta lenguaje soez, slurs, **nombres-broma con doble sentido fonético** y
trampas de re-segmentación / leet / inversión en **español, inglés y francés**.

> ⚠️ **Crítico**: la pantalla del HALO es vista por 80.000 personas y la prensa.
> El sistema está calibrado para preferir falsos positivos (revisión humana)
> antes que un falso negativo (mostrar algo soez).

---

## Arquitectura — multi-capa, de barata a profunda

```
input ──▶ ① Format ──▶ ② Normalización ──▶ ③ Listas ES/EN/FR ──▶ ④ Concat / leet / reversion ──▶ ⑤ Claude Opus 4.7 ──▶ Agregador
```

| Capa | Qué hace | Coste |
|---|---|---|
| **① Format** | Longitud, charset Unicode permitido | 0 |
| **② Normalización** | NFD (sin acentos), lowercase, leet (`0→o`,`@→a`,`7→t`…), tokens, concatenado-sin-espacios, invertido | 0 |
| **③ Listas estáticas** | ~600 entradas: vulgaridades + slurs + nombres-broma canónicos en ES/EN/FR | 0 |
| **④ Sliding-window / concat** | Busca subcadenas en TODAS las vistas normalizadas (concatenada, deleeted, invertida). Atrapa *Aitor Tilla* → `aitortilla` | 0 |
| **⑤ Capa semántica AI** | Claude Opus 4.7 con *adaptive thinking* + *effort:high*. Detecta dobles sentidos NUEVOS, homófonos, re-segmentaciones que las listas no cubren. Output estructurado vía `json_schema`. | tokens |

El **agregador** combina las señales y devuelve:

```jsonc
{
  "verdict": "ALLOWED | REVIEW | REJECTED",
  "doubt_percent": 0–100,           // % estimado de probabilidad de ser inapropiado
  "reasons": [ … ],                  // desglose por capa con severity y mensaje
  "elapsed_ms": 1234,
  "normalized": { "concatNoSpaces": "aitortilla", "deLeeted": "aitor tilla" },
  "layer_summary": { "format_issues": 0, "static_issues": 1, "ai_run": false, … }
}
```

### Reglas del agregador

- Cualquier hit estático *high* → **REJECTED**, duda 100%.
- AI dice `OFFENSIVE` → **REJECTED**, duda = `confidence_offensive`.
- AI dice `SUSPICIOUS` → **REVIEW**, duda = `confidence_offensive`.
- Caracteres no permitidos → **REVIEW** con duda 50%.
- Sin señales → **ALLOWED**, duda 0%.

### Optimizaciones de coste

- La capa AI **se salta** si la capa estática ya marcó *high*.
- El system prompt (largo, con la guía de moderación + ejemplos) se cachea
  con `cache_control: ephemeral` TTL 1h → la 2ª request en adelante paga
  ~10% del coste de input.
- Se piden `max_tokens: 1024` con output estructurado, no chat libre.

---

## Setup

```bash
git clone <repo>
cd NameValidator
npm install
cp .env.example .env
# edita .env y añade tu ANTHROPIC_API_KEY
npm start
```

Luego abre [http://localhost:3000](http://localhost:3000).

> Sin `ANTHROPIC_API_KEY` el sistema arranca igualmente, pero **sólo con las
> capas estáticas** — no recomendado en producción porque los nombres-broma
> novedosos se le escaparán.

---

## API

### `GET /api/health`
```json
{ "ok": true, "ai_layer": true, "model": "claude-opus-4-7" }
```

### `POST /api/validate`
```jsonc
// request
{ "name": "Aitor Tilla", "skipAI": false }

// response
{
  "verdict": "REJECTED",
  "doubt_percent": 100,
  "reasons": [
    {
      "source": "static.es.joke-name",
      "severity": "high",
      "message": "Coincide con \"aitortilla\" — Aitor Tilla → \"a tortilla\""
    }
  ],
  "elapsed_ms": 4,
  "input": "Aitor Tilla",
  "normalized": { "concatNoSpaces": "aitortilla", "deLeeted": "aitor tilla" },
  "layer_summary": { "format_issues": 0, "static_issues": 1, "ai_run": false, "ai_skipped_due_to_static_block": true }
}
```

`skipAI: true` fuerza la decisión sólo con capas estáticas (útil para
benchmarks rápidos).

---

## Calibración / umbrales

El cliente puede mapear `doubt_percent` a la política que quiera:

| Rango | Acción sugerida |
|---|---|
| 0–29 | Aceptar automático |
| 30–69 | Cola de revisión humana |
| 70–100 | Rechazar automático |

---

## Probar la cobertura

La UI incluye un panel de **Casos de prueba sugeridos** con:

- ✓ Nombres válidos: *Vinicius Jr.*, *María Hernández*, *Jude Bellingham*
- ✗ Nombres-broma ES: *Aitor Tilla*, *Susana Oria*, *Elena Nito*, *Mario Neta*
- ✗ Nombres-broma EN: *Mike Hunt*, *Hugh Jass*, *Ben Dover*
- ✗ Nombres-broma FR: *Jean Bon*, *Paul Ochon*
- ✗ Trampas: *P u t a*, *F.U.C.K*, *pu7@*, *atup* (puta al revés)
- ? Casos límite: *Helio Cóptero*, *Lola Mento*

Pulsa cualquiera para validarlo.

---

## Estructura del proyecto

```
NameValidator/
├── server.js                   # Express + endpoints
├── src/
│   ├── validator.js            # Orquestador + agregador
│   ├── normalize.js            # NFD, leet, concat, reversión, tokens
│   ├── layers/
│   │   ├── staticCheck.js      # Capas 1–4 (formato, listas, concat)
│   │   └── aiCheck.js          # Capa 5 (Claude Opus 4.7)
│   └── blocklists/
│       ├── spanish.js
│       ├── english.js
│       └── french.js
└── public/                     # UI HTML/CSS/JS
```

---

## Limitaciones conocidas

- Las listas no son exhaustivas — la capa AI cubre el resto.
- El sistema acepta letras Unicode (incluido cirílico, chino, árabe) pero la
  capa AI razona principalmente en ES/EN/FR. Si el HALO debe soportar otros
  idiomas, ampliar el system prompt en `src/layers/aiCheck.js`.
- La concatenación cubre re-segmentaciones por espacios, pero NO captura
  homófonos puros como "Susana Oria" → "su zanahoria" sin la entrada en la
  lista de joke-names. Para esos, la capa AI es indispensable.
