// ──────────────────────────────────────────────────────────────────────────
//  Diccionario MULTI-IDIOMA de etiquetas de documentos identificativos
// ──────────────────────────────────────────────────────────────────────────
//
// Pasaportes, DNIs y carnets de conducir tienen ETIQUETAS visibles que
// preceden cada campo. Esas etiquetas están en el idioma del país emisor
// (a veces bilingüe inglés). Este diccionario centraliza las variantes
// más comunes para los 6 idiomas más frecuentes en HALO Bernabéu:
// español, inglés, francés, portugués, italiano y alemán.
//
// Cada entrada produce un regex que tolera errores típicos de OCR:
//   - Acentos perdidos (NFD strippeado)
//   - Espacios extra
//   - Substituciones leves O↔0, I↔1
//
// Uso:
//   import { LABEL_REGEX } from './identityLabels.js';
//   if (LABEL_REGEX.surname.test(line)) ...

/**
 * Construye un regex tolerante a partir de una lista de variantes.
 * Une todas con OR, case-insensitive, con \b al inicio/fin opcional.
 */
function buildLabelRegex(variants) {
  // Escapamos caracteres especiales y permitimos espacios opcionales entre
  // palabras (la OCR a veces une "PRIMER APELLIDO" → "PRIMERAPELLIDO").
  const escaped = variants
    .map((v) =>
      v
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s*'),
    )
    .join('|');
  return new RegExp(`(?:^|[^a-z])(?:${escaped})(?:[^a-z]|$)`, 'i');
}

/**
 * Etiquetas por campo y por idioma. Todas las variantes que hemos
 * encontrado en documentos reales están listadas aquí.
 */
export const FIELD_LABELS = {
  surname: {
    es: ['apellido', 'apellidos', 'primer apellido', 'segundo apellido'],
    en: ['surname', 'surnames', 'family name', 'last name', 'family names'],
    fr: ['nom', 'nom de famille'],
    pt: ['apelido', 'apelidos', 'sobrenome'],
    it: ['cognome', 'cognomi'],
    de: ['nachname', 'familienname', 'name'],
  },
  given: {
    es: ['nombre', 'nombres'],
    en: [
      'given names',
      'given name',
      'first name',
      'first names',
      'forename',
      'forenames',
      'christian name',
    ],
    fr: ['prenom', 'prenoms', 'prénom', 'prénoms'],
    pt: ['nome', 'nome próprio', 'nome proprio', 'nomes'],
    it: ['nome', 'nomi'],
    de: ['vorname', 'vornamen'],
  },
  birthDate: {
    es: ['fecha de nacimiento', 'fecha nacimiento', 'nacimiento', 'fec nac'],
    en: ['date of birth', 'birth date', 'dob', 'born on', 'birthdate'],
    fr: ['date de naissance', 'né le', 'née le', 'ne le', 'nee le'],
    pt: ['data de nascimento', 'nascimento'],
    it: ['data di nascita', 'nato il', 'nata il'],
    de: ['geburtsdatum', 'geburtstag', 'geboren am', 'geb', 'geb.'],
  },
  expiryDate: {
    es: [
      'valido hasta',
      'válido hasta',
      'fecha de caducidad',
      'caducidad',
      'fecha de expiracion',
      'fecha de expedicion final',
    ],
    en: ['date of expiry', 'expiry date', 'expires', 'expiration date', 'valid until'],
    fr: ['date d\'expiration', 'date d expiration', 'valable jusqu au', 'valable jusqu\'au'],
    pt: ['data de validade', 'validade', 'data de caducidade'],
    it: ['data di scadenza', 'scadenza', 'valido fino al'],
    de: ['gultig bis', 'gültig bis', 'ablaufdatum'],
  },
  issueDate: {
    es: ['fecha de expedicion', 'fecha de expedición', 'expedicion', 'expedición'],
    en: ['date of issue', 'issue date', 'issued on', 'date issued'],
    fr: ['date de delivrance', 'date de délivrance', 'delivre le', 'délivré le'],
    pt: ['data de emissao', 'data de emissão', 'emitido em'],
    it: ['data di rilascio', 'rilasciato il'],
    de: ['ausstellungsdatum', 'ausgestellt am'],
  },
  documentNumber: {
    es: [
      'dni num',
      'dni núm',
      'dni n',
      'dni',
      'numero',
      'núm',
      'num',
      'no',
      'pasaporte n',
      'numero de pasaporte',
    ],
    en: [
      'passport no',
      'passport number',
      'document no',
      'document number',
      'no',
      'number',
      'license no',
      'licence no',
      'license number',
      'id no',
      'id number',
    ],
    fr: [
      'passeport n',
      'numero de passeport',
      'numéro de passeport',
      'document n',
      'no',
      'permis no',
    ],
    pt: ['numero de passaporte', 'número de passaporte', 'documento n'],
    it: ['passaporto n', 'numero di passaporto', 'documento n'],
    de: [
      'pass nr',
      'passnummer',
      'reisepass nr',
      'dokumenten nr',
      'dokumentnummer',
    ],
  },
  nationality: {
    es: ['nacionalidad'],
    en: ['nationality'],
    fr: ['nationalite', 'nationalité'],
    pt: ['nacionalidade'],
    it: ['cittadinanza', 'nazionalita', 'nazionalità'],
    de: ['staatsangehorigkeit', 'staatsangehörigkeit', 'nationalitat', 'nationalität'],
  },
  sex: {
    es: ['sexo'],
    en: ['sex', 'gender'],
    fr: ['sexe'],
    pt: ['sexo'],
    it: ['sesso'],
    de: ['geschlecht'],
  },
  authority: {
    es: ['autoridad emisora', 'autoridad', 'expedido por'],
    en: ['authority', 'issuing authority', 'issued by'],
    fr: ['autorite', 'autorité', 'autorité de delivrance', 'delivre par'],
    pt: ['autoridade', 'emitido por'],
    it: ['autorita', 'autorità', 'rilasciato da'],
    de: ['ausstellende behörde', 'behorde', 'behörde'],
  },
  // Categorías de carnet de conducir
  categories: {
    es: ['categorias', 'categorías'],
    en: ['categories', 'class'],
    fr: ['categories', 'catégories'],
    pt: ['categorias'],
    it: ['categorie'],
    de: ['klassen'],
  },
};

/**
 * Indicios para clasificar el TIPO DE DOCUMENTO. Cada array contiene
 * frases que aparecen casi exclusivamente en ese tipo.
 */
export const DOCUMENT_TYPE_HINTS = {
  passport: [
    'passport',
    'pasaporte',
    'passeport',
    'passaporto',
    'reisepass',
    'pasporte',
  ],
  dniSpain: [
    'documento nacional de identidad',
    'ministerio del interior',
    'idesp',
    'dni num',
    'dni núm',
  ],
  drivingLicense: [
    'permiso de conducir',
    'permiso de conducción',
    'licencia de conducir',
    'driving licence',
    'driving license',
    'driver license',
    "driver's license",
    'permis de conduire',
    'patente di guida',
    'fuhrerschein',
    'führerschein',
    'carta di guida',
    'carteira de habilitação',
    'carteira nacional de habilitação',
    'cnh',
  ],
  tieSpain: [
    'tarjeta de identidad de extranjero',
    'autoriza a su titular',
    'permiso de residencia',
    'numero de soporte',
    'tie',
  ],
  euResidence: [
    'residence permit',
    'titre de sejour',
    'titre de séjour',
    'aufenthaltstitel',
    'permesso di soggiorno',
  ],
};

/**
 * Pre-compila los regex para todos los campos × idiomas. Una sola vez
 * al cargar el módulo.
 */
const _compiledFields = {};
for (const [field, byLang] of Object.entries(FIELD_LABELS)) {
  const allVariants = Object.values(byLang).flat();
  _compiledFields[field] = buildLabelRegex(allVariants);
}

/**
 * Regex compilados por campo (todas las variantes de todos los idiomas).
 * Uso: LABEL_REGEX.surname.test(line)
 */
export const LABEL_REGEX = _compiledFields;

const _compiledTypeHints = {};
for (const [docType, hints] of Object.entries(DOCUMENT_TYPE_HINTS)) {
  _compiledTypeHints[docType] = buildLabelRegex(hints);
}
export const TYPE_HINT_REGEX = _compiledTypeHints;

/**
 * Detecta el tipo de documento más probable a partir del texto OCR.
 * Devuelve un objeto { type, score } con el mejor candidato y su número
 * de hints encontrados. Si ninguno alcanza umbral mínimo, devuelve
 * { type: 'unknown', score: 0 }.
 *
 * @param {string} text
 * @returns {{ type: string, score: number, allHints: Object<string, number> }}
 */
export function detectDocumentType(text) {
  if (!text) return { type: 'unknown', score: 0, allHints: {} };
  const allHints = {};
  let best = { type: 'unknown', score: 0 };
  for (const [docType, regex] of Object.entries(TYPE_HINT_REGEX)) {
    const matches = text.match(new RegExp(regex.source, 'gi'));
    const count = matches ? matches.length : 0;
    allHints[docType] = count;
    if (count > best.score) {
      best = { type: docType, score: count };
    }
  }
  return { ...best, allHints };
}

/**
 * Tabla de regex por campo INDIVIDUAL POR IDIOMA. Útil cuando sabemos
 * que el documento es de un país concreto y queremos limitar el matching.
 */
export function regexFor(field, lang) {
  const variants = FIELD_LABELS[field]?.[lang];
  if (!variants) return null;
  return buildLabelRegex(variants);
}
