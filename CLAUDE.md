# NameValidator — instrucciones para Claude

## Regla de merge automático

Si CI pasa en una PR que he creado y no hay review-comments pendientes que
requieran cambios, **mergeo por defecto** (squash) sin preguntar. Aplica a
PRs míos sobre cualquier base.

Excepciones — pregunto antes de mergear cuando:
- CI falla o está rojo
- Hay review-comments sin resolver
- La PR toca `main` con cambios destructivos (deleciones masivas, breaking
  changes en API pública, migraciones de datos)
- La base de la PR es otra rama mía aún sin mergear (caso PR-stack: espero
  a que se resuelva la base primero)

## Estructura del repo

- `src/` — código canónico (validator, capas, blocklists, contextos)
- `docs/` — bundle estático para GitHub Pages. `docs/lib/` se regenera
  desde `src/` con `npm run build:docs`. Los 3 ficheros frontend de
  `docs/` (`app.js`, `index.html`, `styles.css`) son canónicos en `docs/`
  y deben copiarse a `public/` cuando cambien.
- `public/` — sirve el `npm start` local (Express). **Tiene que estar
  sincronizado con `docs/`** para que probar local funcione igual que
  GitHub Pages.
- `tests/` — suite golden + adversarial. `npm test` debe quedar en verde
  antes de cualquier commit.

## Convenciones

- Mensajes de commit y descripciones de PR en español, con secciones
  `## Contexto`, `## ...`, `## Test plan`. Footer
  `https://claude.ai/code/<session-url>`.
- Branches: `claude/<short-kebab-slug>`.
- Si toco `src/lib/*` o `src/*.js`, ejecuto `npm run build:docs` antes del
  commit para mantener `docs/lib/` al día.
- Si toco `docs/{app.js,index.html,styles.css}`, copio a `public/` para
  no desincronizar.
