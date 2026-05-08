// ──────────────────────────────────────────────────────────────────────────
//  Contextos plug-and-play del HALO Name Validator
// ──────────────────────────────────────────────────────────────────────────
//
// Cada cliente (estadio, club, marca) tiene un "contexto" propio que define:
//   ▸ rivalPlayerFullNames — combinaciones nombre+apellido a bloquear
//   ▸ uniqueAloneSurnames  — apellidos únicos rechazables sueltos
//   ▸ commonAloneSurnames  — apellidos comunes que disparan REVIEW
//   ▸ antiClubChants       — cánticos contra ESTE club
//   ▸ ownPlayerTokens      — tokens de jugadores propios (para detección
//                            de slur+jugador en racism-context)
//
// Para añadir un nuevo cliente:
//   1. Crear src/contexts/<id>.js exportando un objeto con la misma forma
//      que `realMadridContext`.
//   2. Importarlo aquí y registrarlo en `ALL_CONTEXTS`.
//   3. El frontend o el SDK pueden seleccionarlo con `{ context: '<id>' }`
//      al llamar `validateName()`.
//
// Compatibilidad: si no se pasa contexto explícito, se usa Real Madrid
// (es el caso de uso original — sin breaking changes).

import { realMadridContext } from './realMadrid.js';
import { fcBarcelonaContext } from './fcBarcelona.js';

export const ALL_CONTEXTS = {
  'real-madrid': realMadridContext,
  'fc-barcelona': fcBarcelonaContext,
};

/**
 * Devuelve el contexto pedido. Si no existe, devuelve el default
 * (Real Madrid) para mantener compatibilidad hacia atrás.
 */
export function getContext(id) {
  if (!id) return realMadridContext;
  return ALL_CONTEXTS[id] || realMadridContext;
}

export const DEFAULT_CONTEXT_ID = 'real-madrid';
export const DEFAULT_CONTEXT = realMadridContext;

/**
 * Lista metadatos de todos los contextos disponibles. Útil para que la UI
 * o el SDK muestren un selector.
 */
export function listContexts() {
  return Object.values(ALL_CONTEXTS).map((ctx) => ({
    id: ctx.id,
    displayName: ctx.displayName,
    description: ctx.description,
    rivals: ctx.rivalPlayerFullNames.length,
    chants: ctx.antiClubChants.length,
  }));
}
