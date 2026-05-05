# Proxy backend para HALO Name Validator

Este directorio contiene **dos opciones** para montar el proxy entre el
frontend (GitHub Pages) y la API de Anthropic. La API key vive **siempre
en el servidor**, nunca en el navegador.

| Opción | Coste | Setup | Ideal para |
|---|---|---|---|
| **A. Cloudflare Worker** | Free tier 100k req/día | 5 min, sin servidor que mantener | Producción HALO. Latencia edge global. |
| **B. Express en cualquier Node host** | Render/Railway/Fly tienen tier gratis | 10 min, requiere servidor 24/7 | Cuando ya tienes infra Node. |

Ambas opciones exponen el endpoint **`POST /api/ai-check`** que el
frontend usa cuando "Backend URL" está configurada.

---

## Opción A — Cloudflare Worker (recomendada)

### A.1 — Deploy zero-CLI desde el dashboard

1. Crea cuenta gratis en <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Worker**.
   - Nombre sugerido: `halo-name-validator-proxy`.
3. En el editor que aparece, **borra el código por defecto y pega entero
   el contenido de [`cloudflare-worker.js`](./cloudflare-worker.js)**.
4. Pulsa **Deploy**.
5. Ve a **Settings → Variables and Secrets → Add variable**:
   - **Type: Secret** · Name: `ANTHROPIC_API_KEY` · Value: `sk-ant-api03-...`
6. (Recomendado) añade otra variable, esta vez **Type: Plain text**:
   - Name: `CORS_ORIGINS`
   - Value: `https://<tu-usuario>.github.io`
   - Sin esto el Worker permite llamadas desde cualquier origen, lo cual
     funciona pero abre tu API key a uso por terceros que descubran la URL.
7. Copia la URL pública (algo como `halo-name-validator-proxy.<sub>.workers.dev`)
   y añade `/api/ai-check` al final. Pega esa URL completa en el panel
   "⚙ Configuración AI" del frontend, campo "Backend URL":
   ```
   https://halo-name-validator-proxy.<sub>.workers.dev/api/ai-check
   ```

### A.2 — Deploy con `wrangler` (CLI)

```bash
cd proxy
npm i -g wrangler            # sólo la primera vez
wrangler login               # sólo la primera vez
wrangler secret put ANTHROPIC_API_KEY   # pega tu key cuando te lo pida
wrangler deploy
```

Para limitar CORS al dominio de Pages:

```bash
wrangler deploy --var CORS_ORIGINS:https://<tu-usuario>.github.io
```

### Verificar que el Worker funciona

```bash
# Health-check (sin payload)
curl https://halo-name-validator-proxy.<sub>.workers.dev/api/health

# Validación real
curl -X POST https://halo-name-validator-proxy.<sub>.workers.dev/api/ai-check \
  -H 'Content-Type: application/json' \
  -d '{"input":"Aitor Tilla"}'
```

### Coste estimado

- Cloudflare Workers free tier: **100.000 requests/día**.
- Anthropic: cada llamada cuesta unos pocos céntimos (Opus 4.7 con prompt
  caching de 1h hace que el system prompt se pague una sola vez por hora).
- Ejemplo: un Tour del Bernabéu con 1.000 visitantes/día generando 1
  request cada uno → ~$1-3 USD/día en Anthropic, $0 en Cloudflare.

---

## Opción B — Express server en cualquier Node host

El `server.js` de la raíz **ya tiene CORS** y expone `/api/ai-check`.
Cualquier Node host con Node 20+ funciona.

### B.1 — Render.com (free tier, ~5 min)

1. <https://render.com> → New → Web Service → Connect repo
2. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node 20
3. **Environment Variables**:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
   - `CORS_ORIGINS` = `https://<tu-usuario>.github.io`
4. Deploy. Render te da una URL `https://halo-validator.onrender.com`.
5. En el frontend, pega `https://halo-validator.onrender.com/api/ai-check`
   en el campo "Backend URL".

> ⚠ El free tier de Render se duerme tras 15 min sin tráfico. La primera
> request tras el sleep tarda ~30 s. Para producción usa el tier de pago
> ($7/mes) o Cloudflare Workers (sin sleep).

### B.2 — Railway / Fly.io / Vercel

Mismo principio: detectar Node, exponer puerto, configurar las dos env
vars (`ANTHROPIC_API_KEY` y `CORS_ORIGINS`).

### B.3 — Self-hosted (VPS, Docker, etc.)

```bash
git clone <repo>
cd NameValidator
npm install
ANTHROPIC_API_KEY=sk-ant-... \
CORS_ORIGINS=https://<tu-usuario>.github.io \
PORT=3000 \
node server.js
```

Detrás de un nginx con TLS (Let's Encrypt) y listo.

---

## Cómo funciona el proxy

```
                     ┌──────────────────────────┐
                     │  Frontend (GitHub Pages) │
                     │  - capas estáticas       │
                     │  - aiCheck en proxy mode │
                     └──────────────┬───────────┘
                                    │ POST {input}
                                    │ (sin API key)
                                    ▼
                     ┌──────────────────────────┐
                     │  Proxy (Worker o Node)   │
                     │  - guarda ANTHROPIC_KEY  │
                     │  - aplica system prompt  │
                     │  - CORS al origin Pages  │
                     └──────────────┬───────────┘
                                    │ POST con x-api-key
                                    ▼
                     ┌──────────────────────────┐
                     │  api.anthropic.com       │
                     │  Claude Opus 4.7         │
                     └──────────────────────────┘
```

El frontend ejecuta las capas 1-4 (formato, normalización, listas
estáticas, concat) localmente. Sólo si todo eso pasa y skipAI no está
activo, llama al proxy para la capa semántica. Esto minimiza el tráfico:
sólo los inputs ambiguos llegan al proxy.

---

## Seguridad

- **API key**: vive como Secret en el Worker o como env var en el Node host.
  Nunca aparece en código, en frontend, ni en logs (los Secrets no se imprimen).
- **CORS**: configurar `CORS_ORIGINS=https://<tu-usuario>.github.io` impide
  que otros dominios usen tu proxy/API key. Sin restringir, cualquiera con
  la URL puede llamarlo.
- **Rate limiting**: el free tier de Cloudflare Workers ya tiene límites
  globales. Para protección adicional contra abuso, considera añadir un
  middleware de rate limiting (el Worker puede usar Cloudflare KV; el
  Express puede usar `express-rate-limit`).
- **Origen del input**: el proxy NO valida nada del input — simplemente lo
  reenvía a Claude con el system prompt. Las capas estáticas (en el
  cliente) ya filtran lo más obvio antes de llegar al proxy.
