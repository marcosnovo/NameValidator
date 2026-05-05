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

  // ─── Asesinos en serie ─────────────────────────────────────────────────
  {
    names: ['Ted Bundy', 'Theodore Bundy', 'Theodore Robert Bundy'],
    era: '1974-1978',
    why: 'Ted Bundy — asesino en serie estadounidense, 30+ víctimas confirmadas.',
  },
  {
    names: ['Jeffrey Dahmer', 'Jeff Dahmer'],
    era: '1978-1991',
    why: 'Jeffrey Dahmer — asesino en serie y caníbal estadounidense ("Carnicero de Milwaukee").',
  },
  {
    names: ['John Wayne Gacy'],
    era: '1972-1978',
    why: 'John Wayne Gacy — asesino en serie estadounidense ("Killer Clown"), 33 víctimas.',
  },
  {
    names: ['Charles Manson', 'Charlie Manson'],
    era: '1969',
    why: 'Charles Manson — líder de la "Familia Manson", responsable de los crímenes de Cielo Drive.',
  },
  {
    names: ['Richard Ramirez'],
    era: '1984-1985',
    why: 'Richard Ramírez — "Night Stalker"; asesino en serie satánico estadounidense.',
  },
  {
    names: ['Aileen Wuornos'],
    era: '1989-1990',
    why: 'Aileen Wuornos — asesina en serie estadounidense ejecutada en 2002.',
  },
  {
    names: ['Andrei Chikatilo'],
    era: '1978-1990',
    why: 'Andrei Chikatilo — "Carnicero de Rostov", 50+ víctimas en la URSS.',
  },
  {
    names: ['Pedro Alonso López', 'Pedro Lopez'],
    era: '1969-1980',
    why: 'Pedro Alonso López — "Monstruo de los Andes", 100+ víctimas en Colombia, Ecuador, Perú.',
  },
  {
    names: ['Luis Garavito', 'Luis Alfredo Garavito'],
    era: '1992-1999',
    why: 'Luis Garavito — "La Bestia", uno de los asesinos en serie más prolíficos de la historia.',
  },
  {
    names: ['Dennis Rader', 'BTK Killer'],
    era: '1974-1991',
    why: 'Dennis Rader — asesino "BTK" (Bind, Torture, Kill).',
  },
  {
    names: ['Peter Sutcliffe'],
    era: '1975-1980',
    why: 'Peter Sutcliffe — "Yorkshire Ripper", 13 mujeres asesinadas en Reino Unido.',
  },
  {
    names: ['Albert Fish'],
    era: '1924-1932',
    why: 'Albert Fish — asesino en serie estadounidense conocido por canibalismo.',
  },
  {
    names: ['Ed Gein', 'Edward Gein'],
    era: '1954-1957',
    why: 'Ed Gein — "Carnicero de Plainfield", inspiración para Psicosis y La matanza de Texas.',
  },
  {
    names: ['Manuel Delgado Villegas', 'El Arropiero'],
    era: '1964-1971',
    why: 'Manuel Delgado Villegas — "El Arropiero", asesino en serie español.',
  },
  {
    names: ['José Antonio Rodríguez Vega'],
    era: '1987-1988',
    why: 'José Antonio Rodríguez Vega — "El Mataviejas", asesino en serie español.',
  },
  {
    names: ['Joaquín Ferrándiz', 'Joaquín Ferrándiz Ventura'],
    era: '1995-1996',
    why: 'Joaquín Ferrándiz — asesino en serie español de la zona de Castellón.',
  },
  {
    names: ['Alfredo Galán', 'Asesino de la Baraja'],
    era: '2003',
    why: 'Alfredo Galán — "Asesino de la Baraja", militar español condenado por 6 asesinatos.',
  },
  {
    names: ['Tony King', 'Tony Alexander King'],
    era: '2003',
    why: 'Tony Alexander King — asesino en serie británico activo en la Costa del Sol.',
  },

  // ─── Tiradores de masas ────────────────────────────────────────────────
  {
    names: ['Adam Lanza'],
    era: '2012',
    why: 'Adam Lanza — autor de la masacre de Sandy Hook (Newtown, EE. UU.).',
  },
  {
    names: ['Eric Harris'],
    era: '1999',
    why: 'Eric Harris — coautor de la masacre del Instituto Columbine.',
  },
  {
    names: ['Dylan Klebold'],
    era: '1999',
    why: 'Dylan Klebold — coautor de la masacre del Instituto Columbine.',
  },
  {
    names: ['Stephen Paddock'],
    era: '2017',
    why: 'Stephen Paddock — autor del tiroteo masivo de Las Vegas (60 muertos, 411 heridos).',
  },
  {
    names: ['Brenton Tarrant'],
    era: '2019',
    why: 'Brenton Tarrant — autor de la masacre de Christchurch (Nueva Zelanda).',
  },
  {
    names: ['Patrick Crusius'],
    era: '2019',
    why: 'Patrick Crusius — autor del tiroteo masivo de El Paso (Texas).',
  },
  {
    names: ['Salvador Ramos'],
    era: '2022',
    why: 'Salvador Ramos — autor de la masacre escolar de Uvalde (Texas).',
  },
  {
    names: ['Anders Breivik', 'Anders Behring Breivik'],
    era: '2011',
    why: 'Anders Breivik — autor del atentado y matanza de Utøya (Noruega), 77 muertos.',
  },

  // ─── Otros terroristas / criminales notorios ───────────────────────────
  {
    names: ['Timothy McVeigh'],
    era: '1995',
    why: 'Timothy McVeigh — autor del atentado de Oklahoma City (168 muertos).',
  },
  {
    names: ['Theodore Kaczynski', 'Ted Kaczynski', 'Unabomber'],
    era: '1978-1995',
    why: 'Theodore Kaczynski — "Unabomber", terrorista estadounidense.',
  },
  {
    names: ['Charles Whitman'],
    era: '1966',
    why: 'Charles Whitman — autor de la masacre de la Universidad de Texas.',
  },
  {
    names: ['Marc Dutroux'],
    era: '1995-1996',
    why: 'Marc Dutroux — pedófilo y asesino belga.',
  },

  // ─── Narcotraficantes notorios ─────────────────────────────────────────
  {
    names: ['Pablo Escobar'],
    era: '1976-1993',
    why: 'Pablo Escobar — narcotraficante colombiano del Cártel de Medellín.',
  },
  {
    names: ['El Chapo', 'Joaquín Guzmán', 'Joaquin Guzman', 'Joaquín El Chapo Guzmán'],
    era: '1980s-2017',
    why: 'Joaquín "El Chapo" Guzmán — narcotraficante mexicano del Cártel de Sinaloa.',
  },
  {
    names: ['Amado Carrillo Fuentes'],
    era: '1980s-1997',
    why: 'Amado Carrillo Fuentes — "Señor de los Cielos", narcotraficante mexicano.',
  },
  {
    names: ['Al Capone', 'Alphonse Capone'],
    era: '1925-1931',
    why: 'Al Capone — gánster estadounidense del Chicago de la Ley Seca.',
  },
  {
    names: ['John Gotti'],
    era: '1985-1992',
    why: 'John Gotti — jefe de la familia Gambino (Cosa Nostra).',
  },
  {
    names: ['Toto Riina', 'Salvatore Riina'],
    era: '1969-1993',
    why: 'Salvatore "Totò" Riina — jefe de la mafia siciliana, ordenó los asesinatos de Falcone y Borsellino.',
  },

  // ─── Abusadores y depredadores famosos ─────────────────────────────────
  {
    names: ['Jeffrey Epstein'],
    era: '2002-2019',
    why: 'Jeffrey Epstein — financiero condenado por explotación sexual de menores.',
  },
  {
    names: ['Jimmy Savile'],
    era: '1960s-2010s',
    why: 'Jimmy Savile — locutor de la BBC, abusador sexual sistemático destapado tras su muerte.',
  },
  {
    names: ['Larry Nassar', 'Lawrence Nassar'],
    era: '1990s-2017',
    why: 'Larry Nassar — médico de USA Gymnastics condenado por abuso sexual de cientos de gimnastas.',
  },
  {
    names: ['Harvey Weinstein'],
    era: '1980s-2017',
    why: 'Harvey Weinstein — productor de Hollywood condenado por agresiones sexuales (caso #MeToo).',
  },
  {
    names: ['R. Kelly', 'Robert Kelly'],
    era: '1990s-2019',
    why: 'R. Kelly — cantante condenado por delitos sexuales y tráfico de personas.',
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
  // ── Régimen nazi
  ['hitler',    'apellido del dictador alemán Adolf Hitler — excepcionalmente raro como apellido civil.'],
  ['goebbels',  'apellido del ministro de propaganda nazi Joseph Goebbels.'],
  ['goering',   'apellido del jerarca nazi Hermann Göring.'],
  ['göring',    'apellido del jerarca nazi Hermann Göring.'],
  ['himmler',   'apellido del Reichsführer SS Heinrich Himmler.'],
  ['mengele',   'apellido del médico nazi Josef Mengele.'],
  ['eichmann',  'apellido del organizador del Holocausto Adolf Eichmann.'],
  ['heydrich',  'apellido del jerarca nazi Reinhard Heydrich.'],
  // ── Dictadores
  ['mussolini', 'apellido del dictador fascista italiano Benito Mussolini.'],
  ['gadafi',    'apellido del dictador libio Muammar Gadafi.'],
  ['gaddafi',   'apellido del dictador libio Muammar Gadafi.'],
  ['gadhafi',   'apellido del dictador libio Muammar Gadafi.'],
  ['ceausescu', 'apellido del dictador rumano Nicolae Ceaușescu.'],
  ['ceaușescu', 'apellido del dictador rumano Nicolae Ceaușescu.'],
  ['pinochet',  'apellido del dictador chileno Augusto Pinochet.'],
  ['videla',    'apellido del dictador argentino Jorge Rafael Videla.'],
  ['verwoerd',  'apellido del arquitecto del apartheid Hendrik Verwoerd.'],
  // ── Crímenes de guerra
  ['milosevic', 'apellido del condenado por crímenes de guerra Slobodan Milošević.'],
  ['milošević', 'apellido del condenado por crímenes de guerra Slobodan Milošević.'],
  ['karadzic',  'apellido del condenado por genocidio Radovan Karadžić.'],
  ['karadžić',  'apellido del condenado por genocidio Radovan Karadžić.'],
  ['mladic',    'apellido del condenado por genocidio Ratko Mladić.'],
  ['mladić',    'apellido del condenado por genocidio Ratko Mladić.'],
  // ── Terrorismo
  ['baghdadi',  'apellido del líder del ISIS Abu Bakr al-Baghdadi.'],
  ['breivik',   'apellido del terrorista noruego Anders Breivik.'],
  ['mcveigh',   'apellido del autor del atentado de Oklahoma City Timothy McVeigh.'],
  ['kaczynski', 'apellido del Unabomber Theodore Kaczynski.'],
  // ── Asesinos en serie con apellidos extremadamente raros
  ['dahmer',    'apellido del asesino en serie Jeffrey Dahmer.'],
  ['chikatilo', 'apellido del asesino en serie Andrei Chikatilo.'],
  ['garavito',  'apellido del asesino en serie Luis Garavito.'],
  ['gacy',      'apellido del asesino en serie John Wayne Gacy.'],
  ['wuornos',   'apellido de la asesina en serie Aileen Wuornos.'],
  ['arropiero', 'alias del asesino en serie español "El Arropiero".'],
  ['ferrandiz', 'apellido del asesino en serie español Joaquín Ferrándiz.'],
  ['ferrándiz', 'apellido del asesino en serie español Joaquín Ferrándiz.'],
  // ── Tiradores de masas con apellidos raros
  ['klebold',   'apellido del tirador de Columbine Dylan Klebold.'],
  ['tarrant',   'apellido del autor de la masacre de Christchurch Brenton Tarrant.'],
  ['crusius',   'apellido del autor de la masacre de El Paso Patrick Crusius.'],
  ['paddock',   'apellido del autor del tiroteo de Las Vegas Stephen Paddock.'],
  // ── Mafia con apellidos raros
  ['gotti',     'apellido del jefe mafioso John Gotti.'],
  // ── Abusadores notorios
  ['epstein',   'apellido del condenado por explotación sexual Jeffrey Epstein.'],
  ['weinstein', 'apellido del condenado por agresión sexual Harvey Weinstein.'],
  ['savile',    'apellido del depredador sexual británico Jimmy Savile.'],
  ['nassar',    'apellido del médico abusador Larry Nassar.'],
  ['dutroux',   'apellido del pedófilo y asesino belga Marc Dutroux.'],
  // ── NO incluidos por ser apellidos comunes en sus países (sólo se
  //    flagean por match nombre+apellido completo):
  //    Bundy, Manson, Ramirez, Escobar, Capone, Sutcliffe, Gein,
  //    Holmes, Fish, McGuzmán/Guzmán, Lanza, Harris, Ramos, Whitman,
  //    Galán, Delgado, Rodríguez, King, Trump, Putin, Castro, Franco,
  //    Stalin (raro pero usado como pseudónimo), Cortés, Pizarro.
]);
