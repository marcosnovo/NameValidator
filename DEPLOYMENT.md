# Despliegue + recopilación de datos para producción

Esta guía cubre cómo poner el HALO Validator en uso real con un equipo de operarios del Tour, y qué hacer durante los **primeros 30 días** para obtener datos que luego permitan entrenar un modelo ML propio.

---

## 1. Despliegue inicial — Cloudflare Worker (10-15 minutos)

### 1.1 Crear el Worker

**Vía dashboard (zero-CLI, recomendado para empezar):**

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Worker**
2. Nombre: `halo-proxy` (o el que prefieras — quedará en `halo-proxy.<sub>.workers.dev`)
3. Pega el contenido completo de `proxy/cloudflare-worker.js` en el editor
4. **Deploy**

**Vía Wrangler (si prefieres CLI):**

```bash
cd proxy
npm i -g wrangler
wrangler login
wrangler deploy
```

### 1.2 Añadir API key del provider AI

Settings → Variables and Secrets → **Add → Type: Secret**:

| Name | Value | Comentario |
|---|---|---|
| `ANTHROPIC_API_KEY` | tu key `sk-ant-…` | Default (Claude Opus 4.7) |
| `OPENAI_API_KEY` | tu key `sk-…` | Alternativa GPT-4o |
| `GOOGLE_API_KEY` | tu key | Alternativa Gemini 2.5 Pro |

Puedes poner una, dos o las tres. El Worker usa **Anthropic > OpenAI > Google** por defecto. Si quieres forzar uno concreto:

| Name | Value | Type |
|---|---|---|
| `AI_PROVIDER` | `openai` (o `anthropic` o `google`) | Plain text |

### 1.3 KV namespace (cache + aprobaciones globales + métricas)

**Sin KV el Worker funciona** pero pierdes:
- Cache 1h de validaciones (se ahorra ~70% de llamadas a la AI)
- Aprobaciones globales (se quedan en localStorage de cada operario)
- Métricas agregadas (no hay dashboard `/api/metrics`)

Para activarlo:

1. Dashboard → **Storage → KV** → **Create namespace** → name: `halo-cache`
2. Tu Worker → **Settings → Variables → KV Namespace Bindings** → **Add**:
   - Variable name: `KV`
   - Namespace: `halo-cache`

### 1.4 CORS (opcional, recomendado para producción)

Variables and Secrets → **Add → Type: Plain text**:

| Name | Value |
|---|---|
| `CORS_ORIGINS` | `https://<usuario>.github.io` (la URL del frontend) |

Sin esto el Worker permite llamadas desde cualquier origen (`*`). Para producción restríngelo a tu GitHub Pages.

### 1.5 Validar

Abre en navegador:
```
https://halo-proxy.<sub>.workers.dev/api/health
```

Debe responder:
```json
{
  "ok": true,
  "ai_layer": true,
  "kv_layer": true,
  "providers_available": ["anthropic"],
  "provider": "anthropic",
  "model": "claude-opus-4-7",
  "endpoints": ["/api/ai-check", "/api/scan-document", "/api/approve", "/api/metrics"],
  "mode": "cloudflare-worker"
}
```

---

## 2. Despliegue del frontend

### 2.1 Web — GitHub Pages

Ya está deployado automáticamente desde `docs/` cada vez que se hace push a `main`. URL típica: `https://<user>.github.io/NameValidator/`.

Configurar:
1. Abrir el sitio
2. Pulsar el panel "⚙ Configuración AI" arriba
3. Pegar la URL del Worker: `https://halo-proxy.<sub>.workers.dev/api/ai-check`
4. **Probar** → debe mostrar `✓ AI activa · KV activa`

### 2.2 Móvil — Flutter (iOS + Android)

```bash
cd mobile
./scripts/setup.sh
flutter run -d <device-id> \
  --dart-define=WORKER_URL=https://halo-proxy.<sub>.workers.dev \
  --dart-define=OPERATOR_ID=<nombre-operario>
```

Los flags `--dart-define` se persisten en SharedPreferences la primera vez. Sucesivos `flutter run` ya no los necesitan.

---

## 3. Onboarding de operarios

Cada operario del Tour debe tener su **operator_id** único — esto traza qué decisiones manuales toma cada persona, lo cual es crítico para auditoría y para el dataset de ML.

### 3.1 Convención de operator_id

Recomendamos: `<nombre>.<apellido>` o `<inicial>.<apellido>` minúsculas.

Ejemplos:
- `marcos.novo`
- `m.lopez`
- `c.garcia`

Mantenlos consistentes — el dashboard de métricas agrupa por operario.

### 3.2 Procedimiento día 1 con cada operario

1. Conectar dispositivo + abrir app HALO
2. Engranaje ⚙ → pegar Worker URL → Probar conexión → Guardar
3. Meter su `operator_id` propio
4. Validar 3-5 nombres de prueba para verificar que todo funciona
5. Hacer una aprobación manual de prueba (input REVIEW → Aprobar manualmente) → ver que la siguiente vez ese mismo nombre vuelve como CLEAN automático

---

## 4. Primeros 30 días — qué medir

El objetivo del primer mes es **recopilar el dataset** para todo lo que viene después. Cada decisión que toma el sistema o el operario es un dato valioso.

### 4.1 KPIs a vigilar (vía `/api/metrics`)

Dashboard accesible en: `https://<usuario>.github.io/NameValidator/metrics.html`

| KPI | Esperado | Qué hacer si fuera del rango |
|---|---|---|
| Cache hit rate | 50-75% | Si <30%: añadir más operarios o revisar dispersión de nombres |
| Latencia media | <300 ms | Si >2 s: probablemente falta KV bindeado |
| Errores | <1% | Investigar logs Cloudflare si sube |
| Verdicts CLEAN/REVIEW/REJECTED | 60/15/25 aprox | Drásticamente distinto = recalibración |
| Aprobaciones manuales | 5-10/día por operario | <2/día = sistema demasiado permisivo |

### 4.2 Logs estructurados

Cada llamada al Worker emite un `console.log` JSON con:

```json
{
  "ts": "2026-05-01T14:32:01.234Z",
  "endpoint": "ai-check",
  "input_len": 18,
  "verdict": "REVIEW",
  "source": "anthropic",
  "elapsed_ms": 1283,
  "error": null
}
```

**Pipeline recomendado**:
1. Cloudflare → Workers & Pages → tu Worker → **Logs**
2. Activar **Logpush** (Free tier 100k logs/día)
3. Destino: [Logflare](https://logflare.app/) (free 12 meses) o [Grafana Loki](https://grafana.com/oss/loki/) (self-hosted)
4. Crear dashboards: latencia p50/p95, distribución de verdicts por hora, errores por provider

### 4.3 Dataset de aprobaciones humanas

KV guarda en `approve:<hash>` cada aprobación con:
- `approver_id`
- `timestamp`
- `note` (opcional)
- `input_preview` (primeros 60 chars)

Estos datos **son el dataset más valioso** para entrenar el modelo ML propio. Se exportan al final del mes (ver sección 5).

---

## 5. Exportar el dataset al final de mes 1

### 5.1 Método A — copiar de KV manualmente

```bash
# Lista de claves de aprobaciones
wrangler kv key list --namespace-id <id> --prefix "approve:" > approvals.json

# Lista de claves de cache (con verdicts)
wrangler kv key list --namespace-id <id> --prefix "aicheck:" > cache.json

# Exportar valor por valor (script bash)
mkdir -p dataset
for key in $(jq -r '.[].name' approvals.json); do
  hash="${key#approve:}"
  wrangler kv key get "$key" --namespace-id <id> > "dataset/approve-$hash.json"
done
```

### 5.2 Método B — endpoint de export (a implementar)

**Pendiente** — feature request: `GET /api/metrics/export.csv?token=<secret>` que devuelve un CSV consolidado con:

```csv
hash,date,input_preview,verdict,source,elapsed_ms,approver_id,approval_timestamp
```

Cuando se implemente, será el método preferido (un solo HTTP call, no requiere wrangler).

### 5.3 Estructura del dataset esperado al final de mes 1

```
dataset/
├── ai-checks.csv           # ~50.000 entradas (todas las llamadas)
├── approvals.csv           # ~500 aprobaciones manuales
├── rejections-manual.csv   # OJO: ahora no se capturan rechazos manuales
│                           #      del operario; ver sección 6 (active learning)
└── metrics-daily.csv       # 30 días × 6 KPIs cada uno
```

---

## 6. Active learning — qué falta capturar

Actualmente el sistema captura sólo **aprobaciones** humanas (cuando el operario revisa un REVIEW y lo aprueba). **NO captura los rechazos manuales** del operario (cuando ve un nombre marcado como CLEAN/REVIEW pero decide rechazarlo manualmente).

Para el modelo ML necesitamos AMBAS señales. Roadmap:

### 6.1 Endpoint `/api/reject` (próxima PR)

Body:
```json
{
  "input": "<nombre>",
  "operator_id": "<id>",
  "rejected_by_human_decision": true,
  "system_verdict": "CLEAN",     // qué dijo el sistema
  "reason": "Detalle del operario, libre"
}
```

Worker lo guarda en `reject:<hash>` con TTL 30 días, igual que approvals. La frontend (web + mobile) debe ofrecer un botón "Rechazar manualmente" cuando el operario discrepa con el sistema.

### 6.2 UI cambios necesarios

- Pantalla Result añade botón "✗ Rechazar (override)" además del de "✓ Aprobar"
- Settings añade "modo entrenamiento": pide al operario justificar cada override

---

## 7. Pipeline de entrenamiento ML (mes 2)

Ver `ml-training/` en este repo. Cuando tengas ≥2.000 ejemplos etiquetados (mix de approvals + rejections + casos automáticos), arranca el entrenamiento.

Entrada esperada por el script:
```csv
text,label,source
"Carlos García López","clean","auto-clean"
"Adolf Hitler","review","historical-figure"
"Pep Guardiola","reject","rival-player"
"Pablo Escobar","review","historical-figure"
"Mike Hunt","reject","joke-name"
"Francisco Franco García","clean","human-approval"   # operario aprobó
"José Bretón","reject","human-rejection"             # operario rechazó (override)
```

Salida: modelo `halo-classifier.tflite` (Android) + `halo-classifier.mlmodel` (iOS) + `halo-classifier.onnx` (Worker).

---

## 8. Checklist de despliegue

Para no olvidar nada — copia y marca:

```
□ Cloudflare Worker creado y deployado
□ ANTHROPIC_API_KEY (u OPENAI/GOOGLE) configurada como Secret
□ KV namespace 'halo-cache' creado y bindeado como variable 'KV'
□ CORS_ORIGINS limitado al dominio de producción
□ /api/health responde ai_layer:true + kv_layer:true
□ Frontend GitHub Pages desplegado y configurado con la URL del Worker
□ Mobile app instalada en dispositivo de cada operario con dart-define
□ Cada operario configurado con su operator_id único
□ 5 nombres de prueba validados por cada operario
□ Logpush activado a Logflare/Grafana
□ Dashboard /api/metrics accesible
□ Calendario marcado para revisar KPIs después del primer día / primera semana / mes 1
□ Plan de export de KV preparado para fin de mes
```

---

## 9. Preguntas frecuentes

**¿Cuánto cuesta?**
- Anthropic Claude Opus 4.7: ~$0.005 por validación (~50.000/mes ≈ $250)
- Con cache 70% hit rate: ~$75/mes
- Worker Cloudflare: gratis (free tier 100k requests/día)
- KV: gratis (free tier 100k reads/día + 1k writes/día)

**¿Y si una API key se queda sin créditos?**
El Worker devuelve error 502 con `detail`. Configurar las 3 (Anthropic+OpenAI+Google) con fallback a través de `AI_PROVIDER` a mano cuando una se agote.

**¿GDPR?**
- Los nombres son datos personales. Necesitas:
  - Aviso de privacidad explícito antes de pulsar "Validar"
  - Retención: KV se borra automáticamente con TTL (1h cache, 30d aprobaciones, 90d métricas)
  - DPA firmado con Anthropic / OpenAI / Google según provider
  - Right-to-be-forgotten: añadir endpoint `/api/forget` (próxima PR)

**¿Cómo aprobar/rechazar masivamente al final del día?**
Pendiente — pantalla de "Bandeja del operario" que liste todos los REVIEWs pendientes. Próxima PR.
