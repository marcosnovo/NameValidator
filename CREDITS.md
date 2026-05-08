# Atribuciones

Fuentes externas consultadas y/o derivadas para construir las blocklists
multi-idioma del HALO Name Validator. Todas las entradas se han **curado
manualmente** (filtrado, deduplicado, escogiendo top 100-150 por idioma) —
**no se importa la fuente sin filtrar**.

## Open Source — sin obligación de atribución (CC0 / dominio público)

- **[LDNOOBWV2 / List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words](https://github.com/LDNOOBWV2/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words_V2)** — CC0 1.0
  Origen del fork: Shutterstock (CC BY-SA 4.0). Usado como referencia en:
  NL, PL, RU, HU, EL, TR, RO, AR, HE, ZH, JA, KO.

## Open Source — MIT (atribución amigable, no obligatoria)

- **[coldner/wulgaryzmy](https://github.com/coldner/wulgaryzmy)** — MIT
  Profanity polacas en JSON limpio. Inspiración para el bloque PL.
- **[oranmor/russian_obscenity](https://github.com/oranmor/russian_obscenity)** — MIT
  Mat ruso con transliteraciones latinas (clave: kh / h / x).
- **[viddexa/safetext](https://github.com/viddexa/safetext)** — MIT
  Datos para chino mandarín (Pinyin).
- **[Tanat05/korean-profanity-resources](https://github.com/Tanat05/korean-profanity-resources)** — MIT
  El repo de referencia para coreano (욕설 + 비속어 + 혐오 표현).
- **[doublems/korean-bad-words](https://github.com/doublems/korean-bad-words)** — MIT
  JSON simple de palabras coreanas, complemento al anterior.
- **[uxbertlabs/arabic_bad_dirty_word_filter_list](https://github.com/uxbertlabs/arabic_bad_dirty_word_filter_list)**
  Lista árabe con variantes dialectales (egipcio, levantino, golfo).

## CC BY-SA 4.0 — atribución obligatoria

- **[ooguz/turkce-kufur-karaliste](https://github.com/ooguz/turkce-kufur-karaliste)** — CC BY-SA 4.0
  El estándar de facto turco. Usado en `src/blocklists/turkish.js`.
  > "Lista negra de küfür turcas. © ooguz et al. — CC BY-SA 4.0"
  >
  > Las entradas que se han derivado de esta lista están marcadas en el
  > comentario de cabecera de `src/blocklists/turkish.js`. Si redistribuyes
  > el dataset modificado, mantén esta atribución y la misma licencia
  > (ShareAlike).

## No usados (descartados por licencia)

- **[valeriobasile/hurtlex](https://github.com/valeriobasile/hurtlex)** — CC BY-NC-SA 4.0
  Cobertura amplia con 17 categorías para ~50 idiomas, pero la cláusula
  "NonCommercial" (NC) bloquea el uso para Real Madrid (uso comercial).

## Curación manual

Las siguientes secciones de las blocklists son **100% curación manual**
(no derivadas de ningún repo público):

- **Joke names fonéticos** (Aitor Tilla, Mike Hunt, Ben Dover…) — ningún
  repo público los cataloga; la curación es propia.
- **Apología fascista / nazi / terrorista** — referencias específicas a
  figuras históricas, organizaciones designadas, chants nacionalistas.
  Construido a partir de listas oficiales (UE, ONU) + revisión manual.
- **Slurs étnicos / religiosos** sectarios específicos a cada idioma.
- **Whitelist Scunthorpe** (`src/blocklists/scunthorpeWhitelist.js`) —
  apellidos legítimos que el sistema aprende a permitir cuando contienen
  cadenas que coinciden con palabras vulgares en otros idiomas.

---

Si crees que falta una atribución, abre un issue en
[github.com/marcosnovo/NameValidator/issues](https://github.com/marcosnovo/NameValidator/issues).
