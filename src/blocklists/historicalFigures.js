// ──────────────────────────────────────────────────────────────────────────
//  Figuras históricas polémicas (dictadores, genocidas, conquistadores…)
// ──────────────────────────────────────────────────────────────────────────
//
// Política del HALO:
//
//   ▸ NO bloqueamos automáticamente nombres que casualmente coinciden con
//     un dictador. "Francisco Franco García" puede ser perfectamente un
//     ciudadano legítimo (Franco es uno de los apellidos más comunes de
//     España; según INE hay >50.000 personas).
//
//   ▸ SÍ bajamos la confianza y mandamos a REVIEW HUMANO los matches de
//     NOMBRE+APELLIDO completos coincidentes con figuras controversiales
//     globalmente reconocidas. El operador del Tour confirma con DNI si
//     es persona real o broma/provocación.
//
//   ▸ Si una figura ya está en una blocklist de profanidad/extremismo
//     (Hitler, Stalin, Putin, Goebbels…), demotamos su match high → medium
//     cuando aquí también dispara. El motivo: queremos REVIEW con
//     explicación, no REJECT silencioso.
//
//   ▸ El veredicto siempre incluye el motivo concreto ("comparte nombre
//     completo con X, dictador del país Y entre fechas Z") para que la
//     decisión humana sea informada.
//
// Estructura: lista de objetos con `names` (variantes con espacios y
// acentos), `era` y `why`. La normalización a formas concat-sin-espacios
// + permutaciones token-invertidas ocurren en `historicalFiguresAcEntries()`.

export const historicalFigures = [
  // ─── III Reich y régimen nazi ─────────────────────────────────────────
  {
    names: ['Adolf Hitler', 'Adolfo Hitler'],
    era: '1933-1945',
    why: 'Adolf Hitler — dictador alemán, líder del régimen nazi y responsable del Holocausto.',
  },
  {
    names: ['Heinrich Himmler'],
    era: '1929-1945',
    why: 'Heinrich Himmler — Reichsführer de las SS, uno de los principales arquitectos del Holocausto.',
  },
  {
    names: ['Joseph Goebbels', 'Josef Goebbels'],
    era: '1933-1945',
    why: 'Joseph Goebbels — ministro de propaganda nazi.',
  },
  {
    names: ['Hermann Göring', 'Hermann Goering'],
    era: '1933-1945',
    why: 'Hermann Göring — alto cargo nazi, condenado en Núremberg.',
  },
  {
    names: ['Adolf Eichmann'],
    era: '1934-1945',
    why: 'Adolf Eichmann — organizador de la "Solución Final", ejecutado en Israel en 1962.',
  },
  {
    names: ['Josef Mengele', 'Joseph Mengele'],
    era: '1943-1945',
    why: 'Josef Mengele — médico de las SS en Auschwitz, conocido como "Ángel de la Muerte".',
  },
  {
    names: ['Reinhard Heydrich'],
    era: '1934-1942',
    why: 'Reinhard Heydrich — arquitecto de la Conferencia de Wannsee, Holocausto.',
  },
  {
    names: ['Rudolf Höss', 'Rudolf Hoess', 'Rudolf Hoss'],
    era: '1933-1945',
    why: 'Rudolf Höss — comandante del campo de exterminio de Auschwitz.',
  },

  // ─── Otros dictadores siglo XX ─────────────────────────────────────────
  {
    names: ['Iósif Stalin', 'Joseph Stalin', 'Josef Stalin', 'Iosif Stalin'],
    era: '1924-1953',
    why: 'Iósif Stalin — dictador soviético; gulag, purgas y hambruna ucraniana.',
  },
  {
    names: ['Benito Mussolini'],
    era: '1922-1945',
    why: 'Benito Mussolini — dictador fascista italiano y aliado de Hitler.',
  },
  {
    names: ['Francisco Franco', 'Paquito Franco'],
    era: '1939-1975',
    why: 'Francisco Franco — dictador español tras la Guerra Civil. Apellido común en España; comprueba si es persona real con DNI.',
  },
  {
    names: ['Mao Zedong', 'Mao Tse-tung', 'Mao Tsetung'],
    era: '1949-1976',
    why: 'Mao Zedong — líder chino; Gran Salto Adelante y Revolución Cultural (decenas de millones de muertes).',
  },
  {
    names: ['Pol Pot', 'Saloth Sar'],
    era: '1975-1979',
    why: 'Pol Pot — líder de los Jemeres Rojos, genocidio camboyano.',
  },
  {
    names: ['Augusto Pinochet'],
    era: '1973-1990',
    why: 'Augusto Pinochet — dictador chileno tras el golpe de 1973.',
  },
  {
    names: ['Jorge Videla', 'Rafael Videla', 'Jorge Rafael Videla'],
    era: '1976-1981',
    why: 'Jorge Rafael Videla — dictador argentino, Proceso de Reorganización Nacional.',
  },
  {
    names: ['Idi Amin', 'Idi Amin Dada'],
    era: '1971-1979',
    why: 'Idi Amin — dictador ugandés conocido por crímenes contra la humanidad.',
  },
  {
    names: ['Saddam Hussein', 'Sadam Hussein'],
    era: '1979-2003',
    why: 'Saddam Hussein — dictador iraquí ejecutado tras la guerra de 2003.',
  },
  {
    names: ['Muammar Gaddafi', 'Muamar Gadafi', 'Muammar Gadhafi'],
    era: '1969-2011',
    why: 'Muammar Gadafi — dictador libio derrocado y muerto en 2011.',
  },
  {
    names: ['Bashar al-Assad', 'Bashar Assad', 'Bashar al Assad'],
    era: '2000-presente',
    why: 'Bashar al-Ásad — dictador sirio, guerra civil con cientos de miles de muertos.',
  },
  {
    names: ['Kim Il-sung', 'Kim Il Sung'],
    era: '1948-1994',
    why: 'Kim Il-sung — fundador del régimen totalitario norcoreano.',
  },
  {
    names: ['Kim Jong-il', 'Kim Jong Il'],
    era: '1994-2011',
    why: 'Kim Jong-il — dictador norcoreano.',
  },
  {
    names: ['Kim Jong-un', 'Kim Jong Un'],
    era: '2011-presente',
    why: 'Kim Jong-un — actual dictador de Corea del Norte.',
  },
  {
    names: ['Nicolae Ceaușescu', 'Nicolae Ceausescu'],
    era: '1965-1989',
    why: 'Nicolae Ceaușescu — dictador comunista rumano.',
  },
  {
    names: ['Slobodan Milošević', 'Slobodan Milosevic'],
    era: '1989-2000',
    why: 'Slobodan Milošević — presidente serbio juzgado por crímenes de guerra en La Haya.',
  },
  {
    names: ['Radovan Karadžić', 'Radovan Karadzic'],
    era: '1992-1996',
    why: 'Radovan Karadžić — condenado por genocidio en Srebrenica.',
  },
  {
    names: ['Ratko Mladić', 'Ratko Mladic'],
    era: '1992-1996',
    why: 'Ratko Mladić — general serbobosnio condenado por genocidio.',
  },
  {
    names: ['Fidel Castro'],
    era: '1959-2008',
    why: 'Fidel Castro — líder cubano. Figura polarizante; revisión humana recomendada.',
  },
  {
    names: ['Hugo Chávez', 'Hugo Chavez'],
    era: '1999-2013',
    why: 'Hugo Chávez — presidente venezolano. Figura polarizante.',
  },
  {
    names: ['Nicolás Maduro', 'Nicolas Maduro'],
    era: '2013-presente',
    why: 'Nicolás Maduro — presidente venezolano polémico, sanciones internacionales.',
  },

  // ─── Terrorismo y violencia política contemporánea ────────────────────
  {
    names: ['Osama bin Laden', 'Usama bin Laden'],
    era: '1988-2011',
    why: 'Osama bin Laden — fundador de Al Qaeda, atentados del 11-S.',
  },
  {
    names: ['Abu Bakr al-Baghdadi', 'Abu Bakr al Baghdadi'],
    era: '2010-2019',
    why: 'Abu Bakr al-Baghdadi — autoproclamado califa del ISIS.',
  },
  {
    names: ['Ayman al-Zawahiri', 'Ayman al Zawahiri'],
    era: '2011-2022',
    why: 'Ayman al-Zawahiri — sucesor de Bin Laden al frente de Al Qaeda.',
  },
  {
    names: ['Anders Breivik', 'Anders Behring Breivik'],
    era: '2011',
    why: 'Anders Breivik — autor del atentado de Utøya (Noruega).',
  },

  // ─── Conquistadores y colonialismo ───────────────────────────────────
  {
    names: ['Hernán Cortés', 'Hernan Cortes'],
    era: '1519-1521',
    why: 'Hernán Cortés — conquistador del Imperio Azteca; figura controvertida del colonialismo español.',
  },
  {
    names: ['Francisco Pizarro'],
    era: '1532-1541',
    why: 'Francisco Pizarro — conquistador del Imperio Inca; figura controvertida.',
  },
  {
    names: ['Pedro de Alvarado'],
    era: '1519-1541',
    why: 'Pedro de Alvarado — conquistador español, masacres en Mesoamérica.',
  },
  {
    names: ['Diego de Almagro'],
    era: '1532-1538',
    why: 'Diego de Almagro — conquistador del Perú.',
  },
  {
    names: ['Cristóbal Colón', 'Cristobal Colon', 'Christopher Columbus'],
    era: '1492-1506',
    why: 'Cristóbal Colón — figura polarizante del descubrimiento/colonización de América.',
  },

  // ─── Figuras revolucionarias polarizantes ─────────────────────────────
  {
    names: ['Vladímir Lenin', 'Vladimir Lenin'],
    era: '1917-1924',
    why: 'Vladímir Lenin — fundador de la URSS. Figura polarizante.',
  },
  {
    names: ['León Trotski', 'Leon Trotski', 'Leon Trotsky'],
    era: '1917-1929',
    why: 'León Trotski — revolucionario soviético, asesinado por Stalin.',
  },
  {
    names: ['Che Guevara', 'Ernesto Guevara', 'Ernesto Che Guevara'],
    era: '1956-1967',
    why: 'Che Guevara — revolucionario argentino-cubano. Figura icónica y polarizante.',
  },

  // ─── Apartheid y supremacismo ─────────────────────────────────────────
  {
    names: ['Hendrik Verwoerd'],
    era: '1958-1966',
    why: 'Hendrik Verwoerd — arquitecto del apartheid sudafricano.',
  },

  // ─── Apología ETA / terrorismo nacional español ───────────────────────
  {
    names: ['Iñaki de Juana Chaos', 'De Juana Chaos'],
    era: '1980s-2000s',
    why: 'Miembro de ETA con condenas por asesinato; nombre asociado a apología del terrorismo.',
  },

  // ─── Líderes contemporáneos extremadamente polarizantes ───────────────
  {
    names: ['Donald Trump'],
    era: '2017-presente',
    why: 'Donald Trump — presidente de EE. UU. Figura extremadamente polarizante; revisión recomendada.',
  },
  {
    names: ['Vladímir Putin', 'Vladimir Putin'],
    era: '1999-presente',
    why: 'Vladímir Putin — presidente ruso; sanciones internacionales por la guerra en Ucrania.',
  },
  {
    names: ['Benjamin Netanyahu'],
    era: '1996-presente',
    why: 'Benjamin Netanyahu — primer ministro israelí; orden de arresto de la CPI (2024).',
  },
  {
    names: ['Jair Bolsonaro'],
    era: '2019-2022',
    why: 'Jair Bolsonaro — expresidente brasileño polarizante.',
  },
];

/**
 * Normaliza un string a forma concat-sin-espacios, lowercase, sin acentos.
 */
function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Devuelve `historicalFigures` aplanado para alimentar un Aho-Corasick:
 * cada variante de cada figura como una entrada [pattern, meta]. Para
 * cada nombre se generan:
 *   ▸ orden natural concat-sin-espacios:  "iosifstalin"
 *   ▸ orden invertido (apellido+nombre):  "staliniosif"
 *   ▸ con 3 tokens, dos permutaciones razonables más
 *
 * El meta incluye `tokens` (los tokens individuales normalizados de la
 * forma canónica) — staticCheck lo usa para identificar qué patrones de
 * profanidad/extremismo provienen de figuras conocidas y demotarlos.
 */
export function historicalFiguresAcEntries() {
  const out = [];
  const seen = new Set();

  const push = (pattern, meta) => {
    if (!pattern || pattern.length < 4) return; // descarta patrones cortos peligrosos
    if (seen.has(pattern)) return;
    seen.add(pattern);
    out.push([pattern, meta]);
  };

  for (const fig of historicalFigures) {
    const canonical = fig.names[0];
    const tokens = canonical.trim().split(/\s+/).map(normalize).filter(Boolean);
    const meta = {
      why: fig.why,
      era: fig.era,
      canonical,
      tokens, // tokens normalizados del nombre canónico
    };

    for (const name of fig.names) {
      const parts = name.trim().split(/\s+/).map(normalize).filter(Boolean);
      if (parts.length < 2) {
        // Nombre de una sola palabra (raro) — sólo añadimos como está
        push(parts[0], meta);
        continue;
      }
      // Orden natural
      push(parts.join(''), meta);
      // Orden invertido para 2 tokens
      if (parts.length === 2) {
        push(parts[1] + parts[0], meta);
      } else if (parts.length === 3) {
        // 3 permutaciones útiles para nombres con apellido al final:
        // last+first+middle, last+middle+first
        push(parts[2] + parts[0] + parts[1], meta);
        push(parts[2] + parts[1] + parts[0], meta);
      }
    }
  }
  return out;
}

/**
 * Set de tokens individuales que pertenecen a CANÓNICOS de figuras
 * históricas. Sirve a staticCheck para detectar si un match de profanidad
 * (ej. "hitler" del extremism list) coincide con un token de figura
 * histórica → se demota severity high → medium para que el flujo emita
 * REVIEW con explicación en lugar de REJECT silencioso.
 */
export function historicalFigureTokens() {
  const set = new Set();
  for (const fig of historicalFigures) {
    for (const name of fig.names) {
      const parts = name.trim().split(/\s+/).map(normalize).filter(Boolean);
      for (const p of parts) if (p.length >= 4) set.add(p);
    }
  }
  return set;
}

/**
 * Apellidos UNAMBIGUAMENTE polémicos donde la mera coincidencia (incluso
 * con un nombre civil normal delante) justifica REVIEW HUMANO.
 *
 * REGLA: sólo añadimos aquí apellidos extremadamente raros en la población
 * civil. NO incluimos Franco, Castro, Stalin, Putin, Cortés, Pizarro, Trump
 * porque son apellidos legítimos relativamente comunes en algunos países
 * (Franco/Cortés/Pizarro en España, Castro en Latinoamérica, Trump en
 * Alemania/EE.UU., etc.). Para ésos sólo flageamos el match nombre+apellido
 * completo (vía Aho-Corasick principal).
 *
 * Cada entrada: surname (lowercase, sin acentos) → motivo.
 */
export const HISTORICAL_RARE_SURNAMES = new Map([
  ['hitler',    'apellido del dictador alemán Adolf Hitler — excepcionalmente raro como apellido civil.'],
  ['goebbels',  'apellido del ministro de propaganda nazi Joseph Goebbels.'],
  ['goering',   'apellido del jerarca nazi Hermann Göring.'],
  ['göring',    'apellido del jerarca nazi Hermann Göring.'],
  ['himmler',   'apellido del Reichsführer SS Heinrich Himmler.'],
  ['mengele',   'apellido del médico nazi Josef Mengele.'],
  ['eichmann',  'apellido del organizador del Holocausto Adolf Eichmann.'],
  ['heydrich',  'apellido del jerarca nazi Reinhard Heydrich.'],
  ['mussolini', 'apellido del dictador fascista italiano Benito Mussolini.'],
  ['gadafi',    'apellido del dictador libio Muammar Gadafi.'],
  ['gaddafi',   'apellido del dictador libio Muammar Gadafi.'],
  ['gadhafi',   'apellido del dictador libio Muammar Gadafi.'],
  ['baghdadi',  'apellido del líder del ISIS Abu Bakr al-Baghdadi.'],
  ['breivik',   'apellido del terrorista noruego Anders Breivik.'],
  ['ceausescu', 'apellido del dictador rumano Nicolae Ceaușescu.'],
  ['ceaușescu', 'apellido del dictador rumano Nicolae Ceaușescu.'],
  ['milosevic', 'apellido del condenado por crímenes de guerra Slobodan Milošević.'],
  ['milošević', 'apellido del condenado por crímenes de guerra Slobodan Milošević.'],
  ['karadzic',  'apellido del condenado por genocidio Radovan Karadžić.'],
  ['karadžić',  'apellido del condenado por genocidio Radovan Karadžić.'],
  ['mladic',    'apellido del condenado por genocidio Ratko Mladić.'],
  ['mladić',    'apellido del condenado por genocidio Ratko Mladić.'],
  ['verwoerd',  'apellido del arquitecto del apartheid Hendrik Verwoerd.'],
  ['pinochet',  'apellido del dictador chileno Augusto Pinochet.'],
  ['videla',    'apellido del dictador argentino Jorge Rafael Videla.'],
]);
