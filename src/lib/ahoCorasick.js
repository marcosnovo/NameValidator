// ──────────────────────────────────────────────────────────────────────────
//  Aho-Corasick — multi-pattern string matching en tiempo lineal
// ──────────────────────────────────────────────────────────────────────────
//
// Construye un autómata finito a partir de un set de patrones. Buscar
// múltiples patrones en un texto pasa de O(n × Σ|m|) (substring naive)
// a O(n + Σ|m| + matches), que escala a 10.000+ patrones sin penalización.
//
// Para nuestro caso (~1.500 entradas), la construcción es <10ms y cada
// búsqueda <100µs. Pre-construimos el autómata UNA VEZ al cargar el
// módulo.
//
// Implementación clásica con goto + failure + output. Sin dependencias.

/**
 * @typedef {Object} ACNode
 * @property {Map<string, number>} children — char → nodeIdx
 * @property {number} fail — failure link
 * @property {Array<{ pattern: string, meta: any }>} output — matches
 */

export class AhoCorasick {
  constructor() {
    /** @type {ACNode[]} */
    this.nodes = [{ children: new Map(), fail: 0, output: [] }];
    this.built = false;
  }

  /**
   * Añade un patrón al autómata. `meta` es opcional (puede ser cualquier
   * objeto que se devuelve en cada match, p.ej. la razón).
   * Llamar antes de `build()`.
   * @param {string} pattern
   * @param {any} meta
   */
  add(pattern, meta = null) {
    if (!pattern) return;
    if (this.built) {
      throw new Error('AhoCorasick: build() ya se ha llamado, no se puede añadir más');
    }
    let cur = 0;
    for (const ch of pattern) {
      let next = this.nodes[cur].children.get(ch);
      if (next === undefined) {
        next = this.nodes.length;
        this.nodes.push({ children: new Map(), fail: 0, output: [] });
        this.nodes[cur].children.set(ch, next);
      }
      cur = next;
    }
    this.nodes[cur].output.push({ pattern, meta });
  }

  /**
   * Construye los failure links y output links. Llamar una sola vez tras
   * añadir todos los patrones.
   */
  build() {
    if (this.built) return;
    /** @type {number[]} */
    const queue = [];
    // Nivel 1: failure → 0
    for (const [, child] of this.nodes[0].children) {
      this.nodes[child].fail = 0;
      queue.push(child);
    }
    // BFS
    while (queue.length) {
      const u = queue.shift();
      for (const [ch, v] of this.nodes[u].children) {
        queue.push(v);
        // Encuentra el fail link más largo
        let f = this.nodes[u].fail;
        while (f !== 0 && !this.nodes[f].children.has(ch)) {
          f = this.nodes[f].fail;
        }
        const child = this.nodes[f].children.get(ch);
        this.nodes[v].fail = (child !== undefined && child !== v) ? child : 0;
        // Hereda el output del fail link
        for (const out of this.nodes[this.nodes[v].fail].output) {
          this.nodes[v].output.push(out);
        }
      }
    }
    this.built = true;
  }

  /**
   * Busca todas las apariciones de TODOS los patrones en `text`.
   * Devuelve un array de matches: { pattern, meta, end }.
   * Si sólo necesitas saber "¿hay algún match?", para en el primero.
   *
   * @param {string} text
   * @returns {Array<{pattern: string, meta: any, end: number}>}
   */
  search(text) {
    if (!this.built) throw new Error('AhoCorasick: llama build() antes de search()');
    const matches = [];
    let cur = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      // Sigue failure links hasta encontrar transición o llegar a raíz
      while (cur !== 0 && !this.nodes[cur].children.has(ch)) {
        cur = this.nodes[cur].fail;
      }
      const next = this.nodes[cur].children.get(ch);
      cur = next !== undefined ? next : 0;
      if (this.nodes[cur].output.length) {
        for (const out of this.nodes[cur].output) {
          matches.push({ pattern: out.pattern, meta: out.meta, end: i });
        }
      }
    }
    return matches;
  }

  /**
   * Variante que retorna en el primer match encontrado. Más rápido cuando
   * sólo te interesa "¿hay alguna coincidencia?".
   * @param {string} text
   * @returns {{pattern: string, meta: any, end: number} | null}
   */
  firstMatch(text) {
    if (!this.built) throw new Error('AhoCorasick: llama build() antes de firstMatch()');
    let cur = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      while (cur !== 0 && !this.nodes[cur].children.has(ch)) {
        cur = this.nodes[cur].fail;
      }
      const next = this.nodes[cur].children.get(ch);
      cur = next !== undefined ? next : 0;
      if (this.nodes[cur].output.length) {
        const out = this.nodes[cur].output[0];
        return { pattern: out.pattern, meta: out.meta, end: i };
      }
    }
    return null;
  }
}

/**
 * Construye un AhoCorasick a partir de un array de patrones (strings o
 * tuplas [pattern, meta]). Llama build() automáticamente.
 */
export function buildAhoCorasick(patterns) {
  const ac = new AhoCorasick();
  for (const p of patterns) {
    if (typeof p === 'string') {
      ac.add(p, null);
    } else if (Array.isArray(p)) {
      ac.add(p[0], p[1] ?? null);
    } else if (p && typeof p === 'object' && p.pattern) {
      ac.add(p.pattern, p.meta ?? null);
    }
  }
  ac.build();
  return ac;
}
