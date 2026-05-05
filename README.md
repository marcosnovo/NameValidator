# HALO Name Validator

Sistema de validación de nombres para mostrar en el HALO del Santiago Bernabéu.
Detecta lenguaje soez, slurs, **nombres-broma con doble sentido fonético**,
trampas de re-segmentación / leet / inversión / Unicode-confusables / Zalgo,
y **insultos a jugadores** (racismo, homofobia, físicos) en **español, inglés,
francés y portugués**.

Incluye además **escáner de documentos identificativos por cámara**: lee el
nombre del DNI/NIE español o pasaportes con MRZ (200+ países, ICAO 9303),
detecta falsificaciones por checksums y autocompleta el campo de validación.

> ⚠️ **Crítico**: la pantalla del HALO es vista por 80.000 personas y la prensa.
> El sistema está calibrado para preferir falsos positivos (revisión humana)
> antes que un falso negativo (mostrar algo soez).

---

## Arquitectura — multi-capa, de barata a profunda

```
input ──▶ ① Format ──▶ ② Normalización ──▶ ③ Listas ES/EN/FR/PT ──▶ ④ Concat / leet / Unicode ──▶ ⑤ Claude Opus 4.7 ──▶ Agregador
```

| Capa | Qué hace | Coste |
|---|---|---|
| **① Format** | Longitud, charset Unicode permitido | 0 |
| **② Normalización Unicode** | **NFKC** (fullwidth `Ｖ→V`, Math Alphanumeric `𝐕𝓥𝕍𝖁→V`, ligaduras `ﬁ→fi`) + **strip combining marks** (defensa Zalgo `V̴̢̛̫→V`) + **mapa de confusables** (cirílico/griego: `Аitor→Aitor`, `υ→u`) + lowercase + diacríticos NFD + leet (`0→o`,`@→a`,`7→t`…) + tokens + concatenado-sin-espacios + invertido | 0 |
| **②.b Fonética por idioma** | Vista paralela por idioma: castellano (b↔v, h muda, ll→y, w→gu, seseo), inglés (ph→f, ck→k, doble-cons→cons), francés (qu→k, ç→s), portugués (nh→n, lh→l, h muda, ç→s). Atrapa "devora melo"="deboramelo", "Carlos Gil Hipoyas"="gilipollas", "Warra"="guarra", "Mar Higuan Arica"="marihuana" | 0 |
| **③ Listas estáticas** | ~1.500 entradas: vulgaridades + slurs + ~700 nombres-broma canónicos en ES/EN/FR/PT + jugadores rivales con FULL-NAME matching para evitar bloquear apellidos legítimos como *Guardiola* o *Iniesta* (apellidos del INE protegidos) | 0 |
| **③.b Detector contextual** | Co-ocurrencia [token-jugador] + [slur contextual] → racismo/homofobia/físico. Atrapa "Vinicius mono", "Mbappé macaco", "Bellingham viejo", "Cristiano feo" en los 4 idiomas | 0 |
| **④ Sliding-window / concat** | Busca subcadenas en TODAS las vistas normalizadas (concat, deleeted, invertida, fonética). Atrapa *Aitor Tilla* → `aitortilla` | 0 |
| **⑤ Capa semántica AI** | Claude Opus 4.7 con *adaptive thinking* + *effort:high*. Detecta dobles sentidos NUEVOS, homófonos, re-segmentaciones que las listas no cubren. Output estructurado vía `json_schema`. Prompt con estrategia de re-segmentación de 9 pasos + sección de apellidos legítimos del INE. Modo **proxy** (recomendado) o **direct** según despliegue. | tokens |
| **⑥ Validación humana** | El operador puede aprobar manualmente cualquier nombre que el sistema marque como REVIEW/REJECTED. Las aprobaciones quedan registradas con revisor + timestamp + contador. Persistencia local. | 0 |

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

---

## Escáner de documento por cámara (OCR + MRZ + DNI)

Pulsa el botón **📷** junto al input para abrir la cámara y escanear un
documento identificativo. El sistema extrae automáticamente el nombre
y apellidos, valida el documento y rellena el input principal con el
nombre detectado.

### Cómo funciona

```
Cámara → captura JPEG → Tesseract.js (OCR) → Pipeline:
  1. OCR general (spa+eng) — texto crudo
  2. Detección MRZ ICAO 9303 (TD1/TD2/TD3) → 200+ países
  3. Si no hay MRZ → búsqueda DNI/NIE español por regex
  4. Si no hay nada → heurística de extracción de nombre
  5. Score de autenticidad (0-100) combinando todas las señales
```

**Cobertura**:
- 🛂 **Pasaportes con MRZ** (TD3, 44 chars × 2) — 200+ países, estándar ICAO
- 🪪 **DNI español 3.0/4.0** (TD1, 30 chars × 3) — desde 2015
- 🪪 **DNI/NIE visible** — algoritmo de letra mod 23 (independiente del MRZ)
- 📋 **Otros documentos** — heurística genérica de extracción de nombre

### Detección de falsificación (score 0-100)

| Check | Puntos | Qué valida |
|---|---:|---|
| Checksums MRZ | 40 | Algoritmo ICAO 9303 con pesos [7,3,1] sobre número, fecha nac, fecha expir, número personal y compuesto |
| Letra DNI/NIE | 30 | Algoritmo mod 23 con tabla `TRWAGMYFPDXBNJZSQVHLCKE` |
| Coherencia fechas | 15 | No expirado, edad razonable (0-130 años) |
| Confianza OCR | 10 | Sólo si OCR > 70% (filtra fotos malas) |
| Coherencia MRZ↔DNI | 5 | El número MRZ contiene los dígitos del DNI visible |

Score umbral:
- `≥ 60` → ✅ Aparenta auténtico
- `30-59` → ⚠ Resultado parcial (revisar)
- `< 30` con MRZ/DNI presente → 🚨 Sospechoso de falsificación

> **Limitación**: sin acceso a UV/NFC chip del documento físico, esto es
> un primer filtro razonable, NO una certificación profesional. Para
> verificación legal usar lectura del chip del DNI 3.0/4.0 o del NFC del
> pasaporte (requiere hardware adicional).

### Privacidad

🔒 **100% en el navegador**. La imagen se procesa con Tesseract.js (WASM)
localmente. **Nada se envía a servidores externos**. Los datos extraídos
se quedan en este dispositivo. Si configuras el proxy AI (Cloudflare
Worker), sólo se envía el TEXTO del nombre, nunca la imagen del documento.

### Estructura

```
docs/lib/ocr/
├── camera.js              — getUserMedia + captura
├── tesseractOcr.js        — wrapper Tesseract.js v5 vía CDN
├── mrz.js                 — parser MRZ ICAO 9303 (TD1/TD2/TD3 + checksums)
├── dniSpain.js            — DNI/NIE español + algoritmo letra
└── documentScanner.js     — orquestador: detecta tipo, extrae, valida
```

### Tests

`scripts/test-ocr-parsers.mjs` ejecuta 27 tests deterministas (MRZ + DNI).
La cámara y Tesseract requieren browser real para tests E2E.

```bash
node scripts/test-ocr-parsers.mjs
# 27/27
```

---

## Comparación con el ecosistema (auditoría de los top 15 repos GitHub)

Auditados los ~130 repos de [github.com/topics/profanity-filter](https://github.com/topics/profanity-filter)
para confirmar que cubrimos las técnicas estado-del-arte. Resumen:

### Lo que YA hacemos como las mejores librerías

| Técnica | Nosotros | Top repos |
|---|---|---|
| Word lists multi-idioma | ✅ ES/EN/FR/PT (~1.500 entradas) | LDNOOBW (28 idiomas), bad-words |
| Unicode NFKC + Zalgo strip | ✅ desde commit reciente | obscenity, glin-profanity |
| Confusables (cirílico/griego) | ✅ tabla explícita 70+ chars | obscenity, confusable-homoglyphs |
| Fullwidth + Math Alphanumeric | ✅ vía NFKC | obscenity, glin-profanity |
| Sustituciones leet | ✅ 16 mapeos | bad-words, better-profanity |
| Token vs substring matching | ✅ exactOnly Set por idioma | obscenity (word-boundary opt-in) |
| Normalización fonética por idioma | ✅ ES/EN/FR/PT custom | rominf/profanity-filter (Hunspell) |
| ML / LLM como red de seguridad | ✅ Claude Opus 4.7 | detoxify (XLM-RoBERTa), profanity-check (SVM) |
| Whitelist de apellidos legítimos | ✅ INE awareness en prompt + estructura | nadie hace esto explícitamente |

### Lo que hacemos MEJOR que el ecosistema

- **Detector contextual jugador+slur**: ningún repo público tiene un sistema dedicado a detectar insultos a jugadores específicos por co-ocurrencia. Crítico para HALO de un club de fútbol.
- **Apellidos legítimos del INE protegidos**: la lista de "Gay", "Mearín", "Guardiola", "Iniesta", "Piqué", "Puyol" como apellidos legítimos no aparece en ningún filtro genérico — es una decisión de producto específica del HALO.
- **Re-segmentación generativa**: los formantes inequívocos (`pajote`, `unpajote`, `necesitomear`…) cubren patrones que las listas multilingües genéricas omiten.
- **Validación humana con persistencia**: ninguna lib pública tiene este flujo integrado.
- **Calibración severity → REVIEW vs REJECTED**: la mayoría sólo bloquea o pasa.

### Mejoras futuras (ROI ordenado, ver informe completo)

1. **Aho-Corasick / Trie matching**: para escalar a listas de 10.000+ entradas. Ahora con ~1.500 entradas, nuestro substring O(n·m) es <1ms — no urgente.
2. **Fuzzy matching / Levenshtein ≤1**: para "f.uck", "fuuck", "fück". Parcialmente cubierto por leet + dedupedConcat.
3. **LDNOOBW merge**: integrar la lista oficial de Shutterstock (CC-BY 4.0) para los 4 idiomas como fuente adicional. Actualmente nuestras listas son curadas a mano.
4. **Whitelist Scunthorpe**: lista de palabras legítimas que contienen substrings ofensivos (`Cumbria`, `classic`, `cockpit`). Nuestro `exactOnly` para palabras cortas mitiga el 80% del problema.
5. **Double Metaphone / Beider-Morse**: algoritmos fonéticos clásicos. Nuestra fonética por idioma ya es más fina que Soundex; actualizar exigiría rebenchmark.
6. **Detoxify multilingüe (XLM-RoBERTa)** como segunda opinión opt-in para casos borderline. Nuestra capa Claude ya cumple ese rol.

Las técnicas críticas (confusables, fullwidth, Zalgo, fonética, contextual)
ya están integradas. El resto son optimizaciones de rendimiento o cobertura
de cola larga, no defensas críticas.

### Top 15 librerías auditadas

| # | Librería | Lenguaje | Idiomas | URL |
|---|---|---|---|---|
| 1 | obscenity | TS | EN+ext | github.com/jo3-l/obscenity |
| 2 | bad-words | TS/JS | EN | github.com/web-mech/badwords |
| 3 | better_profanity | Python | EN+leet | github.com/snguyenthanh/better_profanity |
| 4 | detoxify | Python | EN/FR/ES/PT/IT/RU/TR | github.com/unitaryai/detoxify |
| 5 | profanity-check | Python (SVM) | EN | github.com/vzhou842/profanity-check |
| 6 | LDNOOBW | dataset | 28 idiomas | github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words |
| 7 | leo-profanity | JS/TS | EN/FR/RU | github.com/jojoee/leo-profanity |
| 8 | dsojevic/profanity-list | dataset | Multi (severidad/tags) | github.com/dsojevic/profanity-list |
| 9 | glin-profanity | TS+Python | 23 idiomas | github.com/GLINCKER/glin-profanity |
| 10 | google-profanity-words | JS | Multi | github.com/coffee-and-fun/google-profanity-words |
| 11 | profanity-filter (rominf) | Python (spaCy+Hunspell) | EN/RU | github.com/rominf/profanity-filter |
| 12 | alt-profanity-check | Python | EN | github.com/dimitrismistriotis/alt-profanity-check |
| 13 | @2toad/profanity | TS | Multi | github.com/2Toad/Profanity |
| 14 | AllProfanity | TS | Multi | github.com/ayush-jadaun/AllProfanity |
| 15 | Blasp (Laravel) | PHP | EN | packagist Blasp |
