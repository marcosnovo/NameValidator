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
| **②.b Fonética por idioma** | Vista paralela por idioma con normalización fonética: castellano (b↔v, h muda, ll→y, w→gu, seseo), inglés (ph→f, ck→k, doble-cons→cons), francés (qu→k, ç→s) y portugués (nh→n, lh→l, h muda, ç→s). Atrapa "devora melo"="deboramelo", "Carlos Gil Hipoyas"="gilipollas", "Warra"="guarra", "Mar Higuan Arica"="marihuana" | 0 |
| **③ Listas estáticas** | ~1.500 entradas: vulgaridades + slurs + ~700 nombres-broma canónicos en ES/EN/FR/PT + jugadores rivales del Real Madrid (Barcelona, Atlético) con FULL-NAME matching para evitar bloquear apellidos legítimos como *Guardiola* o *Iniesta* en personas civiles | 0 |
| **④ Sliding-window / concat** | Busca subcadenas en TODAS las vistas normalizadas (concatenada, deleeted, invertida). Atrapa *Aitor Tilla* → `aitortilla` | 0 |
| **⑤ Capa semántica AI** | Claude Opus 4.7 con *adaptive thinking* + *effort:high*. Detecta dobles sentidos NUEVOS, homófonos, re-segmentaciones que las listas no cubren. Output estructurado vía `json_schema`. Modo **proxy** (recomendado) o **direct** según despliegue. | tokens |

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

## Despliegue

Hay 3 niveles de uso, de menor a mayor coste de setup:

| Nivel | Capa AI | API key | Setup | Cuándo usarlo |
|---|---|---|---|---|
| **A. Sólo GitHub Pages** | ❌ | — | git push + Pages on | Demo / triaje rápido. Las capas estáticas pillan ~80% de los casos sin pagar nada. |
| **B. Pages + browser-direct** | ✅ | en sessionStorage | `+0 min` | Pruebas internas con personas de confianza. La key se expone al navegador. |
| **C. Pages + proxy backend** | ✅ | en el servidor | 5 min en Cloudflare | **Producción HALO**. La key vive sólo en el backend. |

### Nivel A — Activar GitHub Pages

1. Sincroniza `docs/` desde `src/` (sólo si tocas `src/`):
   ```bash
   npm run build:docs
   git add docs/lib && git commit -m "build: sync docs/lib"
   git push origin main
   ```
2. En GitHub: **Settings → Pages → Source: Deploy from a branch →
   Branch: `main`, Folder: `/docs` → Save**.
3. ~1 min después la página queda en `https://<usuario>.github.io/<repo>/`.

### Nivel B — Activar capa AI con API key directa (sólo demos)

En la página: **⚙ Configuración AI → ② API Key Directa → pega tu key →
Guardar**. La key se guarda en `sessionStorage` (se borra al cerrar la
pestaña) y se envía a `api.anthropic.com` desde el navegador.

> ⚠ Cualquier código que se ejecute en esta página puede leer tu key.
> No uses tu key de producción. Para producción → Nivel C.

### Nivel C — Activar capa AI con proxy backend (producción)

Tienes dos opciones documentadas en
[`proxy/README.md`](./proxy/README.md):

1. **Cloudflare Worker** (recomendado) — free tier 100k req/día, sin
   servidor que mantener. Deploy zero-CLI: copy-paste
   [`proxy/cloudflare-worker.js`](./proxy/cloudflare-worker.js) en el
   dashboard, añade `ANTHROPIC_API_KEY` como Secret y `CORS_ORIGINS=https://<usuario>.github.io`.
2. **Express en cualquier Node host** — Render, Railway, Fly, VPS… El
   `server.js` de la raíz ya expone `/api/ai-check` con CORS.

Después, en la página: **⚙ Configuración AI → ① Backend Proxy → pega la
URL del proxy → Guardar → Probar**. Si el test conecta, la capa AI queda
activa para todos los visitantes sin que ninguno vea la key.

### Resumen visual de los 3 modos

```
NIVEL A — sólo estáticas         NIVEL B — browser-direct        NIVEL C — proxy (producción)
                                  (pestaña expone key)
   ┌─────────────┐                   ┌─────────────┐                ┌─────────────┐
   │   Browser   │                   │   Browser   │                │   Browser   │
   │             │                   │  + key⚠️    │                │             │
   └──────┬──────┘                   └──────┬──────┘                └──────┬──────┘
          │                                 │                              │
          ▼                                 ▼                              ▼
   ┌─────────────┐                  ┌──────────────┐                ┌─────────────┐
   │ Listas ES/  │                  │ api.anthropic│                │   PROXY     │
   │ EN/FR + RM  │                  │     .com     │                │  (Worker /  │
   └─────────────┘                  └──────────────┘                │   Express)  │
                                                                    │  + key🔒    │
                                                                    └──────┬──────┘
                                                                           ▼
                                                                    ┌─────────────┐
                                                                    │ api.anthrop │
                                                                    │   ic.com    │
                                                                    └─────────────┘
```

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
├── server.js                   # Express + endpoints (dev local con backend)
├── src/                        # ⭐ Código fuente canónico
│   ├── validator.js            # Orquestador + agregador
│   ├── normalize.js            # NFD, leet, concat, reversión, tokens
│   ├── layers/
│   │   ├── staticCheck.js      # Capas 1–4 (formato, listas, concat)
│   │   └── aiCheck.js          # Capa 5 (Claude Opus 4.7 vía fetch)
│   └── blocklists/
│       ├── spanish.js
│       ├── english.js
│       ├── french.js
│       └── realMadrid.js       # Jugadores rivales (full-name) + chants
├── public/                     # UI del modo backend (npm start → :3000)
├── docs/                       # ⭐ Bundle GitHub Pages (self-contained)
│   ├── index.html              # UI con panel de proxy + API key directa
│   ├── styles.css
│   ├── app.js
│   └── lib/                    # Copia de src/ generada por build:docs
├── proxy/                      # ⭐ Backend proxy (producción)
│   ├── cloudflare-worker.js    # Self-contained, deploy zero-CLI
│   ├── wrangler.toml           # Config opcional para CLI deploy
│   └── README.md               # Pasos para Cloudflare / Render / etc.
└── scripts/
    └── build-docs.mjs          # Sincroniza src/ → docs/lib/
```

> **Caso crítico Real Madrid**: el static blocker NO bloquea apellidos
> rivales sueltos (*Guardiola*, *Iniesta*, *Piqué*, *Puyol*…) — sólo
> combinaciones nombre+apellido completas (*Pep Guardiola*, *Andrés
> Iniesta*…). De este modo "Ángela Guardiola Guardiola" pasa, pero
> "Pep Guardiola" no. Apellidos sueltos los juzga la capa AI con
> contexto.

---

## Limitaciones conocidas

- Las listas no son exhaustivas — la capa AI cubre el resto.
- El sistema acepta letras Unicode (incluido cirílico, chino, árabe) pero la
  capa AI razona principalmente en ES/EN/FR. Si el HALO debe soportar otros
  idiomas, ampliar el system prompt en `src/layers/aiCheck.js`.
- La concatenación cubre re-segmentaciones por espacios, pero NO captura
  homófonos puros como "Susana Oria" → "su zanahoria" sin la entrada en la
  lista de joke-names. Para esos, la capa AI es indispensable.
