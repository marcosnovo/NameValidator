# Auditoría de cobertura — Fase 2

> Generada en sesión de exploración (3 sub-agentes paralelos). Antes de
> ejecutar nada se documentaron aquí los hallazgos para tener trazabilidad.

## Resumen ejecutivo

Tres frentes claros de mejora, en orden de relación impacto/esfuerzo:

1. **Hardening de evasión técnica** (Top 5 gaps): zero-width chars,
   homoglifos latinos extendidos no-NFKC, `rn`→`m` / `vv`→`w`, multi-char
   leet (`\/`→v, `()`→o, `|-|`→h), token-skip joins (Aitor *Van Der* Tilla).
   Esfuerzo bajo, riesgo bajo. **Aquí es donde está el mayor agujero hoy.**

2. **Profundización de los blocklists más cojos** (CS, AR, JA, KO, ZH, EN,
   PT). Añadir Hanzi / Hangul / Hebreo / Árabe / Kana nativos (no sólo
   transliteración), modernos slurs incel/groyper en EN, `paneleiro` y
   joke-names BR/PT-EU en PT.

3. **Idiomas nuevos prioritarios**: Hindi+Urdu, Indonesio/Malayo,
   Ucraniano, Serbio/Croata. ~165 entradas combinadas, cubren ~600M de
   hablantes adicionales.

## Hallazgos transversales (lo más importante)

| # | Hallazgo | Impacto |
|---|---|---|
| H1 | **Evasión leet/ortográfica sin cobertura** en todos los idiomas. Sólo casos aislados (`webon`, `biatch`). Una capa transversal en `normalize.js` resolvería 19 idiomas a la vez. | Alto |
| H2 | **Sistemas de escritura no-latinos** (ZH/JA/KO/HE/AR) cubiertos sólo por transliteración. Si un usuario pega 操你妈 o 씨발 al campo, se cuela. | Alto |
| H3 | **Misoginia subrepresentada** en todas las listas — buena cobertura LGBTQ+ pero menos slurs misóginos modernos (femoide/thot/becky y calcos). | Medio |
| H4 | **Tipográfica del LED**: `rn`→`m` y `vv`→`w` son IDÉNTICOS visualmente en pantalla LED del Bernabéu. "Bellingharn" pasa el filtro de jugador y desactiva racism-context. | Alto |

## Gaps técnicos de evasión (Top 5)

Detalle completo del agente 2 (resumen):

### Gap-1: Zero-width / format characters
Atacante puede pegar `Vi​nicius` con U+200B entre i y n → `playerNameTokens.has("vinicius")` falla → racism-context se desactiva → bypass total. **Severidad: alta, esfuerzo: bajo.** Una regex en `unconfuse`: `s.replace(/[­​-‏‪-‮⁠-⁯﻿]/g, '')`.

### Gap-2: Homoglifos latinos no-NFKC
`Đoro Meło` (Đ U+0110, ł U+0142) sobrevive a `stripDiacritics` porque no se descompone, y a `CONFUSABLE_MAP` porque no está mapeado. Falta: ø, đ, ł, ƒ, ʃ, ı, æ, œ, þ, ð, ħ, ŋ, etc. **Severidad: alta, esfuerzo: bajo.** Ampliar `CONFUSABLE_MAP`.

### Gap-3: `rn`→`m` y `vv`→`w` (homoglifos tipográficos)
`Bellingharn` renderizado en LED es visualmente idéntico a `Bellingham`. El detector de jugadores no lo reconoce. **Severidad: alta (afecta racism-context), esfuerzo: bajo.** Vista extra `visualNormalized`.

### Gap-4: Token-skip joins (Aitor Van Der Tilla)
El sistema cubre "Aitor Tilla" pero `Aitor van der Tilla` aplana a `aitorvandertilla` que NO contiene la subcadena `aitortilla`. **Severidad: alta (próxima iteración del meme), esfuerzo: medio.** Generar vista `tokenJoinSkip1`.

### Gap-5: Multi-char leet
`P\/T@`, `M|\|0`, `|>uta` no se decodifican. **Severidad: media-alta, esfuerzo: medio.** Tabla pre-`deLeet` con dígrafos.

Gaps 6-16 (mixed-scripts signal, token-reverse, URL-encoded, padding inocuo) para batch 2.

## Priorización por idioma (gaps de blocklist)

Del agente 3, ordenado por prioridad:

| Idioma | Gap est. | Áreas principales |
|---|---|---|
| **Checo (cs)** | 50-70 | Slurs étnicos (negr, žid), apología nazi básica, misóginos |
| **Chino (zh)** | 50-80 | **Cantonés** (diu, puk-gai), **Hanzi directos** (操你妈, 傻屄), tonos numéricos |
| **Árabe (ar)** | 60-80 | **Arabizi numérico completo** (7=ح, 5=خ, 2=ء), magrebí, iraquí |
| **Japonés (ja)** | 40-60 | **Kana/Kanji directos** (バカ, クソ, 死ね), 2ch slang, okama |
| **Coreano (ko)** | 30-50 | **Hangul directo** (씨발, 개새끼), post-Megalia misógino |
| **Inglés (en)** | 70-100 | **Incel/groyper** (simp, cuck, troon, glowie, jogger), TERF, leet |
| **Portugués (pt)** | 80-120 | **`paneleiro` PT-EU**, joke-names BR (faltan), Gen-Z BR |
| Francés (fr) | 40-60 | Québécois (tabarnak, câlisse), verlan, extrema derecha |
| Hebreo (he) | 30-50 | Hebreo directo (כוס, זין), yiddish ampliado |
| Italiano (it) | 40-60 | Bestemmie completas, leghista, dialectos |
| Alemán (de) | 30-50 | Anti-musulmán moderno, AfD-slang |
| Húngaro (hu) | 25-40 | Anti-romaní explícito, anti-LGBTQ era-Orbán |
| Ruso (ru) | 30-50 | Translit alterna, anti-LGBTQ 2022+ |
| Polaco (pl) | 25-40 | PiS/Konfederacja, anti-ucraniano fino |
| Turco (tr) | 25-40 | Erdoganismo coded, anti-armenios moderno |
| Rumano (ro) | 25-40 | Anti-húngaro fino, Ceaușescu-fan |
| Neerlandés (nl) | 25-40 | `kopvod`, PVV-aligned slang |
| Español (es) | 60-80 | Chingadazos mexicanos, lunfardo argentino |
| Griego (el) | 20-35 | Greeklish numérico, anti-albanés |

## Idiomas nuevos prioritarios (top 7)

Del agente 1:

| # | Idioma(s) | Entradas | Justificación |
|---|---|---|---|
| 1 | **Hindi + Urdu** (hi/ur) | ~70 | Mercado masivo, fanbase Madridista creciente, romanización resuelta. Urdu sale casi gratis. |
| 2 | **Indonesio/Malayo** (id/ms) | ~50 | 300M hablantes, latín nativo, patrón "Bambang" documentado. |
| 3 | **Ucraniano** (uk) | ~15 | Diáspora europea masiva, distinción RU vs UK políticamente sensible. |
| 4 | **Serbio/Croata** (sr/hr) | ~30 | Cubre BCMS entero (sr+hr+bs+me), cultura ultra-futbolera. |
| 5 | **Persa** (fa) | ~35 | Fanbase iraní, diáspora europea. |
| 6 | **Escandinavos** (sv/no/da) | ~40 | Turismo sostenido. Ojo con "hora"/"fan" → scope estricto. |
| 7 | **Tagalo** (tl) | ~20 | Diáspora filipina, mucho ya en ES/EN. |

## Plan de PRs propuestas

### PR-A — **Hardening de evasión** (quick win)
- Gap-1: zero-width regex
- Gap-2: extender `CONFUSABLE_MAP` con ~30 entradas latinas
- Gap-3: vista `visualNormalized` con `rn→m`, `vv→w`, `cl→d`
- Gap-5: tabla multi-char leet pre-`deLeet`
- **Impacto**: cierra 4 bypass que afectan a los 19 idiomas a la vez. Estimación: ~80 líneas en normalize.js + 5-8 tests adversariales nuevos.

### PR-B — **Multi-script nativo** (Hanzi/Hangul/Kana/Hebreo/Árabe)
- Añadir bloques de caracteres nativos a las blocklists existentes ZH/JA/KO/HE/AR
- Mantener compatibilidad con transliteración
- **Impacto**: cierra H2. ~200 entradas en script nativo.

### PR-C — **Idiomas nuevos batch 1** (Hindi+Urdu, ID/MS, UK, SR/HR)
- 4 idiomas nuevos en una sola PR (~165 entradas)
- Refactor `staticCheck.js` para reconocer las nuevas listas
- **Impacto**: 600M+ hablantes adicionales cubiertos.

### PR-D — **Profundización EN/PT/CS** (prioridad ALTA según agente 3)
- EN: incel/groyper/TERF (~80 entradas)
- PT: paneleiro y joke-names BR (~100 entradas)
- CS: 50+ entradas (es la blocklist más coja del repo)
- **Impacto**: blocklists EN/PT/CS pasan de "OK" a "robustos".

### PR-E — **Profundización resto** (FR/HE/IT/JA/KO/ZH/AR)
- Cada idioma +30-60 entradas con áreas identificadas
- Modernos slurs misóginos (H3)

### PR-F — **Tabla resumen de joke-names extended** (Gap-4)
- `tokenJoinSkip1` para "Aitor Van Der Tilla"
- Re-tests los 1.372 joke names actuales contra esta nueva vista

## Recomendación operativa

Ejecutar en este orden: **A → D → B → C → E → F**.

- A primero: quick win, cierra 4 bypass globales.
- D segundo: ataca el idioma más coja (CS) y los dos más relevantes
  (EN/PT) en una sola PR.
- B tercero: multi-script nativo. Es el cambio más estructural — mejor
  hacerlo cuando la base de blocklists ya esté hardenizada.
- C cuarto: idiomas nuevos. Mejor cuando los 19 actuales están sólidos.
- E quinto: profundización resto. Iterativo.
- F sexto: token-skip joke names. Cambio sutil que requiere medir FPs.
