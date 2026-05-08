// Orquestador. Combina las capas y devuelve un veredicto agregado con
// porcentaje de duda y desglose de razones.

import { buildVariants } from './normalize.js';
import { staticCheck } from './layers/staticCheck.js';
import { aiCheck } from './layers/aiCheck.js';

// Lo que el sistema acepta como input válido en formato (no en contenido).
const FORMAT = {
  MIN_LEN: 1,
  MAX_LEN: 30,                 // típico para HALO de estadio
  ALLOWED_CHARS: /^[\p{L}\p{M} '\-.·]+$/u, // letras Unicode, espacios, ' - .
};

function formatCheck(raw) {
  const issues = [];
  if (typeof raw !== 'string') {
    issues.push({ layer: 'format', code: 'not-string', severity: 'high' });
    return issues;
  }
  const trimmed = raw.trim();
  if (trimmed.length < FORMAT.MIN_LEN) {
    issues.push({ layer: 'format', code: 'too-short', severity: 'high' });
  }
  if (trimmed.length > FORMAT.MAX_LEN) {
    issues.push({
      layer: 'format',
      code: 'too-long',
      severity: 'high',
      detail: `máx ${FORMAT.MAX_LEN} caracteres`,
    });
  }
  if (trimmed && !FORMAT.ALLOWED_CHARS.test(trimmed)) {
    issues.push({
      layer: 'format',
      code: 'invalid-chars',
      severity: 'medium',
      detail: 'sólo letras, espacios, apóstrofes, guiones y puntos',
    });
  }
  return issues;
}

// Combina las señales de todas las capas en un veredicto final + % de duda.
//
// Reglas de agregación:
//   - Cualquier hit estático con severity:high  → REJECTED, duda 100%.
//   - AI dice OFFENSIVE                          → REJECTED, duda = AI conf.
//   - AI dice SUSPICIOUS                         → REVIEW,   duda = AI conf.
//   - Format-issue 'invalid-chars'               → REVIEW.
//   - Si no hay ninguna señal                    → ALLOWED.
//
// El campo `doubt_percent` representa "% de probabilidad de que sea
// inapropiado". El operador del Tour puede elegir umbrales propios:
//   ≥ 70 → bloquear automático
//   30-70 → revisión humana
//   < 30 → aceptar
function aggregate({ formatIssues, staticIssues, ai }) {
  let verdict = 'ALLOWED';
  let doubt = 0;
  const reasons = [];

  // Format
  for (const i of formatIssues) {
    reasons.push({
      source: 'format',
      severity: i.severity,
      message: i.detail || i.code,
    });
    if (i.code === 'invalid-chars') {
      verdict = worst(verdict, 'REVIEW');
      doubt = Math.max(doubt, 50);
    } else {
      verdict = worst(verdict, 'REJECTED');
      doubt = Math.max(doubt, 100);
    }
  }

  // Static — respetamos severity: high bloquea (REJECTED), medium pide
  // revisión humana (REVIEW). El motor no se salta la AI cuando todo lo que
  // hay es medium, así que la IA puede vetar un falso positivo.
  for (const i of staticIssues) {
    reasons.push({
      source: `static.${i.lang}.${i.category}`,
      severity: i.severity,
      message: i.reason
        ? `Coincide con "${i.match}" — ${i.reason}`
        : `Subcadena prohibida "${i.match}" detectada en "${i.view}"`,
    });
    if (i.severity === 'medium') {
      verdict = worst(verdict, 'REVIEW');
      doubt = Math.max(doubt, 60);
    } else {
      verdict = worst(verdict, 'REJECTED');
      doubt = Math.max(doubt, 100);
    }
  }

  // AI
  if (ai && ai.enabled) {
    if (ai.error) {
      reasons.push({
        source: 'ai.error',
        severity: 'low',
        message: `Capa AI no disponible: ${ai.error}`,
      });
    } else {
      const conf = ai.confidence_offensive ?? 0;
      reasons.push({
        source: 'ai.semantic',
        severity:
          ai.verdict === 'OFFENSIVE'
            ? 'high'
            : ai.verdict === 'SUSPICIOUS'
              ? 'medium'
              : 'low',
        message: `[AI ${ai.verdict} · ${conf}%] ${ai.rationale ?? ''}${
          ai.phonetic_reading ? ` (lectura: "${ai.phonetic_reading}")` : ''
        }`,
        ai_categories: ai.categories,
        ai_languages: ai.languages_with_issue,
      });
      if (ai.verdict === 'OFFENSIVE') {
        verdict = worst(verdict, 'REJECTED');
        doubt = Math.max(doubt, conf);
      } else if (ai.verdict === 'SUSPICIOUS') {
        verdict = worst(verdict, 'REVIEW');
        doubt = Math.max(doubt, conf);
      } else {
        // CLEAN: la confianza de OFENSIVO sigue siendo informativa.
        doubt = Math.max(doubt, conf);
      }
    }
  } else if (ai && ai.enabled === false) {
    reasons.push({
      source: 'ai.disabled',
      severity: 'low',
      message: ai.reason ?? 'Capa AI deshabilitada',
    });
  }

  return { verdict, doubt_percent: doubt, reasons };
}

const ORDER = { ALLOWED: 0, REVIEW: 1, REJECTED: 2 };
function worst(a, b) {
  return ORDER[a] >= ORDER[b] ? a : b;
}

export async function validateName(
  rawInput,
  { skipAI = false, apiKey = null, proxyUrl = null, context = null } = {},
) {
  const t0 = Date.now();
  const formatIssues = formatCheck(rawInput);

  // Si el formato es claramente inválido (vacío o tipo erróneo), abortamos
  // pronto sin gastar capa AI.
  if (formatIssues.some((i) => i.code === 'not-string' || i.code === 'too-short')) {
    return aggregate({ formatIssues, staticIssues: [], ai: null });
  }

  const variants = buildVariants(rawInput);
  // `context` selecciona qué módulo de cliente aplicar (Real Madrid por
  // defecto, FC Barcelona, NBA Lakers, etc.). Acepta string-id u objeto.
  const staticIssues = staticCheck(variants, { context });

  // Si la capa estática ya encontró algo HIGH (REJECT seguro), nos
  // saltamos la IA — ahorro de tokens y latencia. Si sólo hay MEDIUM
  // (REVIEW dudoso, p.ej. apellido rival común), SÍ llamamos a la IA
  // para que pueda confirmar/refutar el sospechoso.
  const staticBlocks = staticIssues.some((i) => i.severity === 'high');
  let ai = null;
  if (!skipAI && !staticBlocks) {
    ai = await aiCheck(rawInput, { apiKey, proxyUrl });
  }

  const result = aggregate({ formatIssues, staticIssues, ai });
  result.elapsed_ms = Date.now() - t0;
  result.input = rawInput;
  result.normalized = {
    concatNoSpaces: variants.concatNoSpaces,
    deLeeted: variants.deLeeted,
  };
  result.layer_summary = {
    format_issues: formatIssues.length,
    static_issues: staticIssues.length,
    ai_run: !!ai && ai.enabled !== false && !ai.error,
    ai_skipped_due_to_static_block: staticBlocks,
  };
  return result;
}
