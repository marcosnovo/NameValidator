// ──────────────────────────────────────────────────────────────────────────
//  Contexto Real Madrid C.F. — HALO del Santiago Bernabéu
// ──────────────────────────────────────────────────────────────────────────
//
// Este es el contexto original del proyecto. Empaqueta las blocklists
// específicas del Madrid en la nueva forma plug-and-play.
//
// Para mantener compatibilidad hacia atrás, las listas siguen viviendo en
// `src/blocklists/realMadrid.js` y `src/blocklists/sensitiveContexts.js` —
// aquí simplemente las re-exportamos en el shape estándar de "contexto".

import {
  rivalPlayerFullNames,
  antiMadridChants,
  uniqueAloneSurnames,
  commonAloneSurnames,
} from '../blocklists/realMadrid.js';
import { playerNameTokens } from '../blocklists/sensitiveContexts.js';

export const realMadridContext = {
  id: 'real-madrid',
  displayName: 'Real Madrid C.F. — HALO Bernabéu',
  description:
    'Validador de nombres a mostrar en el anillo LED del Santiago Bernabéu. ' +
    'Bloquea identidades de jugadores rivales (Barça, Atleti, ex-Madrid en otros ' +
    'clubes), cánticos antimadridistas y combinaciones de slur+jugador propio.',
  rivalPlayerFullNames,
  uniqueAloneSurnames,
  commonAloneSurnames,
  antiClubChants: antiMadridChants,   // alias: cada contexto los llama distinto
  ownPlayerTokens: playerNameTokens,  // tokens para detectar racismo a jugadores propios
};
