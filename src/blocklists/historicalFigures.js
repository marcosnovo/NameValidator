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
  {
    names: ['Klaus Barbie'],
    era: '1942-1944',
    why: 'Klaus Barbie — "Carnicero de Lyon", oficial de la Gestapo condenado por crímenes contra la humanidad.',
  },
  {
    names: ['Ernst Kaltenbrunner'],
    era: '1943-1945',
    why: 'Ernst Kaltenbrunner — jefe del RSHA tras Heydrich; ahorcado en Núremberg.',
  },
  {
    names: ['Alfred Rosenberg'],
    era: '1933-1945',
    why: 'Alfred Rosenberg — ideólogo nazi, ahorcado en Núremberg.',
  },
  {
    names: ['Julius Streicher'],
    era: '1923-1945',
    why: 'Julius Streicher — director del periódico antisemita Der Stürmer; ahorcado en Núremberg.',
  },
  {
    names: ['Joachim von Ribbentrop'],
    era: '1938-1945',
    why: 'Joachim von Ribbentrop — ministro de Exteriores nazi; ahorcado en Núremberg.',
  },
  {
    names: ['Wilhelm Keitel'],
    era: '1938-1945',
    why: 'Wilhelm Keitel — jefe del Alto Mando de la Wehrmacht; ahorcado en Núremberg.',
  },
  {
    names: ['Alfred Jodl'],
    era: '1939-1945',
    why: 'Alfred Jodl — general nazi; ahorcado en Núremberg.',
  },
  {
    names: ['Roland Freisler'],
    era: '1942-1945',
    why: 'Roland Freisler — "juez de sangre" del Volksgerichtshof, presidió juicios espectáculo nazis.',
  },
  {
    names: ['Hans Frank'],
    era: '1939-1945',
    why: 'Hans Frank — gobernador general de la Polonia ocupada; ahorcado en Núremberg.',
  },
  {
    names: ['Karl Dönitz'],
    era: '1943-1945',
    why: 'Karl Dönitz — gran almirante nazi, sucesor de Hitler; condenado en Núremberg.',
  },
  {
    names: ['Wilhelm Frick'],
    era: '1933-1945',
    why: 'Wilhelm Frick — ministro del Interior nazi; ahorcado en Núremberg.',
  },
  {
    names: ['Erich Priebke'],
    era: '1944',
    why: 'Erich Priebke — oficial nazi responsable de la masacre de las Fosas Ardeatinas.',
  },
  {
    names: ['Léon Degrelle', 'Leon Degrelle'],
    era: '1936-1945',
    why: 'Léon Degrelle — colaboracionista nazi belga, líder del Rexismo.',
  },
  {
    names: ['Vidkun Quisling'],
    era: '1940-1945',
    why: 'Vidkun Quisling — colaboracionista nazi noruego (su apellido se volvió sinónimo de "traidor").',
  },
  {
    names: ['Ante Pavelić', 'Ante Pavelic'],
    era: '1941-1945',
    why: 'Ante Pavelić — líder de los Ustaše croatas, responsable del genocidio de serbios, judíos y romaníes.',
  },
  {
    names: ['Ion Antonescu'],
    era: '1940-1944',
    why: 'Ion Antonescu — dictador fascista rumano aliado del Eje.',
  },
  {
    names: ['Philippe Pétain', 'Philippe Petain'],
    era: '1940-1944',
    why: 'Philippe Pétain — jefe de la Francia de Vichy colaboracionista con la Alemania nazi.',
  },
  {
    names: ['Pierre Laval'],
    era: '1942-1944',
    why: 'Pierre Laval — primer ministro de Vichy, ejecutado por colaboracionismo.',
  },
  {
    names: ['Oswald Mosley'],
    era: '1932-1940',
    why: 'Oswald Mosley — líder de la British Union of Fascists.',
  },
  {
    names: ['Lavrentiy Beria', 'Lavrenti Beria'],
    era: '1938-1953',
    why: 'Lavrentiy Beria — jefe del NKVD bajo Stalin, responsable de millones de ejecuciones y deportaciones.',
  },

  // ─── Imperialismo japonés (II Guerra Mundial) ──────────────────────────
  {
    names: ['Hideki Tojo'],
    era: '1941-1944',
    why: 'Hideki Tojo — primer ministro de Japón en la II Guerra Mundial; ahorcado por crímenes de guerra.',
  },
  {
    names: ['Shiro Ishii', 'Shirō Ishii'],
    era: '1936-1945',
    why: 'Shiro Ishii — director de la Unidad 731, experimentos biológicos en humanos.',
  },
  {
    names: ['Tomoyuki Yamashita'],
    era: '1941-1945',
    why: 'Tomoyuki Yamashita — general japonés ejecutado por crímenes de guerra ("masacre de Manila").',
  },
  {
    names: ['Iwane Matsui'],
    era: '1937',
    why: 'Iwane Matsui — general responsable de la masacre de Nankín.',
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
  {
    names: ['António Salazar', 'Antonio Salazar', 'Oliveira Salazar'],
    era: '1932-1968',
    why: 'António de Oliveira Salazar — dictador portugués del Estado Novo.',
  },
  {
    names: ['Manuel Noriega'],
    era: '1983-1989',
    why: 'Manuel Noriega — dictador panameño derrocado por la invasión estadounidense.',
  },
  {
    names: ['Rafael Trujillo'],
    era: '1930-1961',
    why: 'Rafael Trujillo — dictador dominicano "El Jefe", responsable de la Masacre del Perejil.',
  },
  {
    names: ['Anastasio Somoza', 'Anastasio Somoza García', 'Anastasio Somoza Debayle'],
    era: '1937-1979',
    why: 'Familia Somoza — dictadura nicaragüense de tres generaciones.',
  },
  {
    names: ['Alfredo Stroessner'],
    era: '1954-1989',
    why: 'Alfredo Stroessner — dictador paraguayo, parte del Plan Cóndor.',
  },
  {
    names: ['Mengistu Haile Mariam'],
    era: '1977-1991',
    why: 'Mengistu Haile Mariam — dictador etíope, "Terror Rojo" con cientos de miles de muertos.',
  },
  {
    names: ['Suharto'],
    era: '1967-1998',
    why: 'Suharto — dictador indonesio, masacres anticomunistas (500.000+ muertes).',
  },
  {
    names: ['Park Chung-hee', 'Park Chung Hee'],
    era: '1961-1979',
    why: 'Park Chung-hee — dictador surcoreano asesinado por su jefe de seguridad.',
  },
  {
    names: ['Robert Mugabe'],
    era: '1980-2017',
    why: 'Robert Mugabe — autócrata zimbabuense, masacre de Gukurahundi (Matabeleland).',
  },
  {
    names: ['Mobutu Sese Seko', 'Mobutu Sese-Seko'],
    era: '1965-1997',
    why: 'Mobutu Sese Seko — dictador kleptócrata de Zaire (RD Congo).',
  },
  {
    names: ['Charles Taylor'],
    era: '1997-2003',
    why: 'Charles Taylor — expresidente de Liberia condenado por crímenes de guerra en Sierra Leona.',
  },
  {
    names: ['Jean-Bédel Bokassa', 'Jean Bedel Bokassa', 'Bokassa'],
    era: '1966-1979',
    why: 'Jean-Bédel Bokassa — dictador autoproclamado emperador de Centroáfrica, acusado de canibalismo.',
  },
  {
    names: ['François Duvalier', 'Francois Duvalier', 'Papa Doc'],
    era: '1957-1971',
    why: 'François Duvalier — "Papa Doc", dictador haitiano con los Tonton Macoute.',
  },
  {
    names: ['Jean-Claude Duvalier', 'Jean Claude Duvalier', 'Baby Doc'],
    era: '1971-1986',
    why: 'Jean-Claude Duvalier — "Baby Doc", continuador de la dictadura haitiana.',
  },
  {
    names: ['Hosni Mubarak'],
    era: '1981-2011',
    why: 'Hosni Mubarak — dictador egipcio derrocado en la Primavera Árabe.',
  },
  {
    names: ['Hafez al-Assad', 'Hafez Assad', 'Hafez al Assad'],
    era: '1971-2000',
    why: 'Háfez al-Ásad — dictador sirio, padre de Bashar; masacre de Hama de 1982.',
  },
  {
    names: ['Saparmurat Niyazov', 'Turkmenbashi'],
    era: '1991-2006',
    why: 'Saparmurat Niyazov — "Turkmenbashi", dictador de Turkmenistán con culto a la personalidad extremo.',
  },
  {
    names: ['Aleksandr Lukashenko', 'Alexander Lukashenko'],
    era: '1994-presente',
    why: 'Aleksandr Lukashenko — autócrata bielorruso aliado de Putin.',
  },
  {
    names: ['Hissène Habré', 'Hissene Habre'],
    era: '1982-1990',
    why: 'Hissène Habré — exdictador chadiano condenado por crímenes contra la humanidad.',
  },
  {
    names: ['Yahya Khan'],
    era: '1969-1971',
    why: 'Yahya Khan — dictador pakistaní responsable del genocidio de Bangladés (1971).',
  },
  {
    names: ['Ne Win'],
    era: '1962-1988',
    why: 'Ne Win — dictador militar birmano.',
  },
  {
    names: ['Hirohito', 'Emperador Hirohito', 'Showa'],
    era: '1926-1989',
    why: 'Emperador Hirohito — emperador de Japón durante la II Guerra Mundial; figura controvertida por las atrocidades del ejército imperial.',
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
    names: ['Mohammed Atta'],
    era: '2001',
    why: 'Mohammed Atta — líder del comando del 11-S, pilotó el primer avión contra el World Trade Center.',
  },
  {
    names: ['Khalid Sheikh Mohammed'],
    era: '1990s-2003',
    why: 'Khalid Sheikh Mohammed — cerebro operativo del 11-S, en custodia en Guantánamo.',
  },
  {
    names: ['Ramzi Yousef'],
    era: '1993',
    why: 'Ramzi Yousef — autor del atentado del World Trade Center de 1993.',
  },
  {
    names: ['Anwar al-Awlaki', 'Anwar al Awlaki'],
    era: '2000s-2011',
    why: 'Anwar al-Awlaki — clérigo y propagandista de Al Qaeda en la Península Arábiga.',
  },
  {
    names: ['Carlos the Jackal', 'Ilich Ramírez Sánchez', 'Ilich Ramirez Sanchez'],
    era: '1973-1994',
    why: 'Ilich Ramírez Sánchez — "Carlos el Chacal", terrorista internacional venezolano.',
  },
  {
    names: ['Abu Nidal'],
    era: '1974-2002',
    why: 'Abu Nidal — terrorista palestino, fundador de la Organización Abu Nidal.',
  },
  {
    names: ['Abimael Guzmán', 'Abimael Guzman'],
    era: '1980-1992',
    why: 'Abimael Guzmán — fundador y líder de Sendero Luminoso (Perú).',
  },
  {
    names: ['Joseph Kony'],
    era: '1987-presente',
    why: 'Joseph Kony — líder del Lord\'s Resistance Army en Uganda; reclutamiento masivo de niños soldado.',
  },
  {
    names: ['Abubakar Shekau'],
    era: '2009-2021',
    why: 'Abubakar Shekau — líder de Boko Haram, secuestros masivos de niñas en Nigeria.',
  },
  {
    names: ['Velupillai Prabhakaran'],
    era: '1976-2009',
    why: 'Velupillai Prabhakaran — fundador de los Tigres Tamiles (LTTE), Sri Lanka.',
  },
  {
    names: ['Tamerlan Tsarnaev'],
    era: '2013',
    why: 'Tamerlan Tsarnaev — autor del atentado de la maratón de Boston.',
  },
  {
    names: ['Dzhokhar Tsarnaev'],
    era: '2013',
    why: 'Dzhokhar Tsarnaev — coautor del atentado de la maratón de Boston.',
  },
  {
    names: ['Salman Abedi'],
    era: '2017',
    why: 'Salman Abedi — autor del atentado del Manchester Arena.',
  },
  {
    names: ['Ramón Mercader', 'Ramon Mercader'],
    era: '1940',
    why: 'Ramón Mercader — agente soviético español que asesinó a León Trotski.',
  },
  {
    names: ['Mohammed Omar', 'Mullah Omar'],
    era: '1996-2001',
    why: 'Mohammed Omar — "Mullah Omar", líder fundador de los talibanes afganos.',
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
  {
    names: ['Harold Shipman'],
    era: '1975-1998',
    why: 'Harold Shipman — médico británico, uno de los mayores asesinos en serie de la historia (250+ víctimas).',
  },
  {
    names: ['Gary Ridgway'],
    era: '1982-2001',
    why: 'Gary Ridgway — "Green River Killer", 49+ víctimas confirmadas en EE. UU.',
  },
  {
    names: ['Robert Pickton'],
    era: '1995-2002',
    why: 'Robert Pickton — granjero canadiense, asesino de mujeres en Vancouver.',
  },
  {
    names: ['Samuel Little'],
    era: '1970-2005',
    why: 'Samuel Little — el asesino en serie más prolífico confirmado en EE. UU. (93 víctimas).',
  },
  {
    names: ['Albert DeSalvo'],
    era: '1962-1964',
    why: 'Albert DeSalvo — "Estrangulador de Boston".',
  },
  {
    names: ['Edmund Kemper', 'Ed Kemper'],
    era: '1964-1973',
    why: 'Edmund Kemper — "The Co-Ed Killer", asesino en serie estadounidense.',
  },
  {
    names: ['Henry Lee Lucas'],
    era: '1960-1983',
    why: 'Henry Lee Lucas — asesino en serie estadounidense con cientos de víctimas reclamadas.',
  },
  {
    names: ['Ottis Toole'],
    era: '1960s-1980s',
    why: 'Ottis Toole — cómplice de Henry Lee Lucas, asesino en serie y caníbal.',
  },
  {
    names: ['Dennis Nilsen'],
    era: '1978-1983',
    why: 'Dennis Nilsen — "Muswell Hill Murderer", asesino en serie británico.',
  },
  {
    names: ['Fred West', 'Frederick West'],
    era: '1967-1987',
    why: 'Fred West — asesino en serie británico junto a su esposa Rosemary.',
  },
  {
    names: ['Rosemary West', 'Rose West'],
    era: '1967-1987',
    why: 'Rosemary West — asesina en serie británica, esposa de Fred West.',
  },
  {
    names: ['Ian Brady'],
    era: '1963-1965',
    why: 'Ian Brady — "Asesino del Páramo", asesino en serie infantil británico.',
  },
  {
    names: ['Myra Hindley'],
    era: '1963-1965',
    why: 'Myra Hindley — cómplice de Ian Brady en los crímenes del Páramo.',
  },
  {
    names: ['Peter Kürten', 'Peter Kurten'],
    era: '1929-1930',
    why: 'Peter Kürten — "Vampiro de Düsseldorf", asesino en serie alemán.',
  },
  {
    names: ['Fritz Haarmann'],
    era: '1918-1924',
    why: 'Fritz Haarmann — "Carnicero de Hannover", asesino en serie alemán.',
  },
  {
    names: ['Tsutomu Miyazaki'],
    era: '1988-1989',
    why: 'Tsutomu Miyazaki — "El asesino otaku", asesino en serie de niñas en Japón.',
  },
  {
    names: ['Issei Sagawa'],
    era: '1981',
    why: 'Issei Sagawa — caníbal japonés célebre por el caso de París.',
  },
  {
    names: ['Charles Sobhraj'],
    era: '1972-1982',
    why: 'Charles Sobhraj — "La Serpiente", asesino en serie internacional.',
  },
  {
    names: ['Dorothea Puente'],
    era: '1982-1988',
    why: 'Dorothea Puente — asesina en serie estadounidense propietaria de una pensión.',
  },
  {
    names: ['Belle Gunness'],
    era: '1900-1908',
    why: 'Belle Gunness — asesina en serie estadounidense de origen noruego.',
  },
  {
    names: ['Anatoly Onoprienko'],
    era: '1989-1996',
    why: 'Anatoly Onoprienko — "El Terminator", asesino en serie ucraniano.',
  },
  {
    names: ['Yang Xinhai'],
    era: '1999-2003',
    why: 'Yang Xinhai — "Monster Killer", asesino en serie chino con 67+ víctimas.',
  },
  {
    names: ['Daniel Camargo Barbosa'],
    era: '1974-1986',
    why: 'Daniel Camargo Barbosa — asesino en serie colombiano-ecuatoriano.',
  },
  {
    names: ['Ahmad Suradji'],
    era: '1986-1997',
    why: 'Ahmad Suradji — asesino en serie indonesio.',
  },
  {
    names: ['Karl Denke'],
    era: '1903-1924',
    why: 'Karl Denke — asesino en serie y caníbal alemán.',
  },
  {
    names: ['Javed Iqbal'],
    era: '1998-1999',
    why: 'Javed Iqbal — asesino en serie paquistaní de niños.',
  },
  {
    names: ['Donald Henry Gaskins', 'Pee Wee Gaskins'],
    era: '1953-1982',
    why: 'Donald Gaskins — "Pee Wee", asesino en serie estadounidense.',
  },
  {
    names: ['Joel Rifkin'],
    era: '1989-1993',
    why: 'Joel Rifkin — asesino en serie estadounidense.',
  },
  {
    names: ['Wayne Williams'],
    era: '1979-1981',
    why: 'Wayne Williams — condenado por los asesinatos infantiles de Atlanta.',
  },
  {
    names: ['Israel Keyes'],
    era: '2001-2012',
    why: 'Israel Keyes — asesino en serie estadounidense.',
  },
  {
    names: ['Dean Corll'],
    era: '1970-1973',
    why: 'Dean Corll — "El Hombre de los Caramelos", asesino en serie de Houston.',
  },
  {
    names: ['Kenneth Bianchi'],
    era: '1977-1979',
    why: 'Kenneth Bianchi — uno de los "Hillside Stranglers".',
  },
  {
    names: ['Angelo Buono'],
    era: '1977-1979',
    why: 'Angelo Buono — uno de los "Hillside Stranglers", primo de Kenneth Bianchi.',
  },
  {
    names: ['Joan Vila', 'Joan Vila Dilmé'],
    era: '2009-2010',
    why: 'Joan Vila — auxiliar de enfermería español, asesino en serie de la residencia La Caritat.',
  },
  {
    names: ['Andrés Aldije Monmejat', 'Erdoiza'],
    era: '1898-1903',
    why: 'Andrés Aldije Monmejat — "Erdoiza", asesino en serie español de finales del siglo XIX.',
  },
  {
    names: ['Gilberto Chamba'],
    era: '1989-2001',
    why: 'Gilberto Chamba — "El Monstruo de Machala", asesino en serie ecuatoriano-español.',
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
  {
    names: ['James Holmes'],
    era: '2012',
    why: 'James Holmes — autor del tiroteo del cine de Aurora (Colorado).',
  },
  {
    names: ['Seung-Hui Cho', 'Seung Hui Cho'],
    era: '2007',
    why: 'Seung-Hui Cho — autor de la masacre de Virginia Tech (32 muertos).',
  },
  {
    names: ['Nikolas Cruz'],
    era: '2018',
    why: 'Nikolas Cruz — autor de la masacre escolar de Parkland (Florida).',
  },
  {
    names: ['Devin Kelley', 'Devin Patrick Kelley'],
    era: '2017',
    why: 'Devin Patrick Kelley — autor del tiroteo de la iglesia de Sutherland Springs.',
  },
  {
    names: ['Omar Mateen'],
    era: '2016',
    why: 'Omar Mateen — autor del tiroteo de Pulse (Orlando), 49 víctimas LGTBI+.',
  },
  {
    names: ['Dylann Roof', 'Dylann Storm Roof'],
    era: '2015',
    why: 'Dylann Roof — supremacista blanco autor de la masacre de la iglesia AME de Charleston.',
  },
  {
    names: ['Robert Bowers'],
    era: '2018',
    why: 'Robert Bowers — autor del tiroteo de la sinagoga Tree of Life (Pittsburgh).',
  },
  {
    names: ['Andreas Lubitz'],
    era: '2015',
    why: 'Andreas Lubitz — copiloto que estrelló deliberadamente el vuelo Germanwings 9525 (150 muertos).',
  },
  {
    names: ['Payton Gendron'],
    era: '2022',
    why: 'Payton Gendron — supremacista blanco autor de la masacre de Buffalo.',
  },
  {
    names: ['Thomas Hamilton'],
    era: '1996',
    why: 'Thomas Hamilton — autor de la masacre escolar de Dunblane (Escocia, 16 niños muertos).',
  },
  {
    names: ['Martin Bryant'],
    era: '1996',
    why: 'Martin Bryant — autor de la masacre de Port Arthur (Australia, 35 muertos).',
  },
  {
    names: ['Tomohiro Kato'],
    era: '2008',
    why: 'Tomohiro Kato — autor de la masacre de Akihabara (Tokio).',
  },
  {
    names: ['José Bretón', 'Jose Breton'],
    era: '2011',
    why: 'José Bretón — condenado por el asesinato de sus dos hijos en Córdoba (España).',
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
  {
    names: ['Lucky Luciano', 'Charles Luciano', 'Salvatore Lucania'],
    era: '1920s-1962',
    why: 'Charles "Lucky" Luciano — fundador de la Cosa Nostra moderna en EE. UU.',
  },
  {
    names: ['Carlo Gambino'],
    era: '1957-1976',
    why: 'Carlo Gambino — jefe de la familia Gambino de la Cosa Nostra.',
  },
  {
    names: ['Frank Costello'],
    era: '1940s-1970s',
    why: 'Frank Costello — "Primer Ministro del bajo mundo", jefe de la familia Luciano.',
  },
  {
    names: ['Vito Genovese'],
    era: '1930s-1969',
    why: 'Vito Genovese — jefe de la familia Genovese de la Cosa Nostra.',
  },
  {
    names: ['Sammy Gravano', 'Salvatore Gravano', 'Sammy the Bull'],
    era: '1970s-1991',
    why: 'Salvatore "Sammy the Bull" Gravano — sicario de la familia Gambino, después delator.',
  },
  {
    names: ['Bernardo Provenzano'],
    era: '1990s-2006',
    why: 'Bernardo Provenzano — jefe de la mafia siciliana tras la captura de Riina.',
  },
  {
    names: ['Matteo Messina Denaro'],
    era: '1990s-2023',
    why: 'Matteo Messina Denaro — jefe de la Cosa Nostra siciliana, capturado en 2023.',
  },
  {
    names: ['Whitey Bulger', 'James Bulger'],
    era: '1970s-2011',
    why: 'James "Whitey" Bulger — jefe mafioso irlandés-americano de Boston.',
  },
  {
    names: ['Ronnie Kray', 'Ronald Kray'],
    era: '1950s-1968',
    why: 'Ronnie Kray — jefe del crimen organizado británico junto a su gemelo Reggie.',
  },
  {
    names: ['Reggie Kray', 'Reginald Kray'],
    era: '1950s-1968',
    why: 'Reggie Kray — jefe del crimen organizado británico junto a su gemelo Ronnie.',
  },
  {
    names: ['Carmine Galante'],
    era: '1960s-1979',
    why: 'Carmine Galante — jefe interino de la familia Bonanno.',
  },
  {
    names: ['Carlos Lehder'],
    era: '1976-1987',
    why: 'Carlos Lehder — fundador del Cártel de Medellín junto a Pablo Escobar.',
  },
  {
    names: ['Gonzalo Rodríguez Gacha', 'El Mexicano'],
    era: '1970s-1989',
    why: 'Gonzalo Rodríguez Gacha — "El Mexicano", lugarteniente de Escobar en Medellín.',
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
  {
    names: ['Bill Cosby'],
    era: '1960s-2010s',
    why: 'Bill Cosby — comediante condenado y luego liberado por agresión sexual; múltiples acusaciones.',
  },
  {
    names: ['Jerry Sandusky'],
    era: '1990s-2011',
    why: 'Jerry Sandusky — entrenador de Penn State condenado por abuso sexual de menores.',
  },
  {
    names: ['Robert Black'],
    era: '1981-1986',
    why: 'Robert Black — pedófilo y asesino en serie de niñas británico.',
  },
  {
    names: ['Gary Glitter', 'Paul Gadd'],
    era: '1990s-2015',
    why: 'Gary Glitter — músico británico condenado por abuso sexual de menores.',
  },

  // ─── Líderes de sectas con muertes o abusos masivos ───────────────────
  // Importante: NO se incluyen figuras religiosas mainstream (Jesús,
  // Mahoma, Buda, etc.) — son nombres legítimos extremadamente comunes.
  // Aquí solo entran líderes de sectas con resultado documentado de
  // muertes masivas, suicidios colectivos o abusos sistemáticos.
  {
    names: ['Jim Jones', 'James Warren Jones'],
    era: '1955-1978',
    why: 'Jim Jones — líder del Templo del Pueblo, suicidio-asesinato masivo de Jonestown (909 muertos).',
  },
  {
    names: ['David Koresh', 'Vernon Howell'],
    era: '1981-1993',
    why: 'David Koresh — líder de los Davidianos en Waco; sitio de 51 días con 76 muertos.',
  },
  {
    names: ['Marshall Applewhite', 'Bo Applewhite'],
    era: '1972-1997',
    why: 'Marshall Applewhite — líder de Heaven\'s Gate, suicidio colectivo de 39 miembros.',
  },
  {
    names: ['Shoko Asahara', 'Chizuo Matsumoto'],
    era: '1984-1995',
    why: 'Shoko Asahara — líder de Aum Shinrikyo, ataque con sarín en el metro de Tokio.',
  },
  {
    names: ['Warren Jeffs'],
    era: '2002-2006',
    why: 'Warren Jeffs — líder de la FLDS, condenado por abuso sexual de menores y matrimonio infantil.',
  },
  {
    names: ['Keith Raniere'],
    era: '1998-2018',
    why: 'Keith Raniere — fundador de NXIVM, condenado por tráfico sexual y crimen organizado.',
  },
  {
    names: ['Bhagwan Shree Rajneesh', 'Osho', 'Rajneesh'],
    era: '1970s-1990',
    why: 'Bhagwan Shree Rajneesh / Osho — líder del Rajneeshpuram; envenenamiento masivo en Oregón (1984).',
  },
  {
    names: ['David Berg'],
    era: '1968-1994',
    why: 'David Berg — fundador de los "Niños de Dios" / "La Familia", abusos sexuales sistemáticos a menores.',
  },
  {
    names: ['Joseph Kibwetere'],
    era: '1989-2000',
    why: 'Joseph Kibwetere — líder ugandés del Movimiento para la Restauración de los Diez Mandamientos; 778 muertos en Kanungu.',
  },
  {
    names: ['Luc Jouret'],
    era: '1984-1994',
    why: 'Luc Jouret — cofundador de la Orden del Templo Solar, suicidios y asesinatos masivos.',
  },
  {
    names: ['Joseph Di Mambro'],
    era: '1984-1995',
    why: 'Joseph Di Mambro — cofundador de la Orden del Templo Solar.',
  },
  {
    names: ['Jeffrey Lundgren'],
    era: '1989',
    why: 'Jeffrey Lundgren — líder de una secta mormona escisionista, asesinato familiar masivo en Kirtland.',
  },
  {
    names: ['Roch Thériault', 'Roch Theriault'],
    era: '1977-1989',
    why: 'Roch Thériault — líder canadiense de una secta apocalíptica con asesinatos y mutilaciones.',
  },
  // (Charles Manson ya está listado como asesino en serie — su rol como
  //  líder de "la Familia Manson" se cubre desde esa entrada).

  // ─── Abusos en contextos religiosos (casos clarísimos y documentados) ─
  // Solo entran condenas firmes o reconocimientos eclesiásticos formales
  // de patrones de abuso sistemático. NO incluimos clérigos por su mero
  // cargo religioso — únicamente quienes están públicamente vinculados a
  // delitos sexuales o encubrimientos a gran escala.
  {
    names: ['Marcial Maciel', 'Marcial Maciel Degollado'],
    era: '1944-2008',
    why: 'Marcial Maciel — fundador de los Legionarios de Cristo; reconocido por la Santa Sede como abusador sexual sistemático.',
  },
  {
    names: ['Fernando Karadima'],
    era: '1980s-2010',
    why: 'Fernando Karadima — sacerdote chileno laicizado tras reconocerse abusos sistemáticos a menores.',
  },
  {
    names: ['Theodore McCarrick'],
    era: '1970s-2018',
    why: 'Theodore McCarrick — excardenal estadounidense, primero en ser laicizado por abusos sexuales.',
  },
  {
    names: ['Jean Vanier'],
    era: '1960s-2010s',
    why: 'Jean Vanier — fundador de L\'Arche; abusos confirmados póstumamente por la propia organización.',
  },
  {
    names: ['George Pell', 'Cardinal Pell'],
    era: '1990s-2010s',
    why: 'George Pell — cardenal australiano condenado y luego absuelto en apelación; figura controvertida.',
  },
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
  ['quisling',   'apellido del colaboracionista nazi noruego Vidkun Quisling.'],
  ['pavelic',    'apellido del líder ustaše Ante Pavelić.'],
  ['pavelić',    'apellido del líder ustaše Ante Pavelić.'],
  ['antonescu',  'apellido del dictador fascista rumano Ion Antonescu.'],
  ['kaltenbrunner', 'apellido del jerarca nazi Ernst Kaltenbrunner.'],
  ['priebke',    'apellido del oficial nazi Erich Priebke.'],
  ['freisler',   'apellido del juez nazi Roland Freisler.'],
  ['streicher',  'apellido del editor antisemita nazi Julius Streicher.'],
  ['ribbentrop', 'apellido del ministro nazi Joachim von Ribbentrop.'],
  // ── Imperialismo japonés WWII
  ['ishii',      'apellido del jefe de la Unidad 731 Shiro Ishii (experimentos biológicos en humanos).'],
  ['yamashita',  'apellido del general japonés condenado por crímenes de guerra Tomoyuki Yamashita.'],
  // ── Dictadores adicionales (sólo apellidos raros — Salazar, Trujillo,
  //    Mubarak NO se incluyen por ser comunes en sus países).
  ['noriega',    'apellido del dictador panameño Manuel Noriega.'],
  ['stroessner', 'apellido del dictador paraguayo Alfredo Stroessner.'],
  ['mengistu',   'apellido del dictador etíope Mengistu Haile Mariam.'],
  ['mobutu',     'apellido del dictador zaireño Mobutu Sese Seko.'],
  ['bokassa',    'apellido del dictador centroafricano Jean-Bédel Bokassa.'],
  ['duvalier',   'apellido de los dictadores haitianos Duvalier ("Papa Doc"/"Baby Doc").'],
  ['niyazov',    'apellido del dictador turcomano Saparmurat Niyazov.'],
  ['lukashenko', 'apellido del autócrata bielorruso Aleksandr Lukashenko.'],
  ['beria',      'apellido del jefe del NKVD Lavrentiy Beria.'],
  // ── Terrorismo
  ['baghdadi',  'apellido del líder del ISIS Abu Bakr al-Baghdadi.'],
  ['breivik',   'apellido del terrorista noruego Anders Breivik.'],
  ['mcveigh',   'apellido del autor del atentado de Oklahoma City Timothy McVeigh.'],
  ['kaczynski', 'apellido del Unabomber Theodore Kaczynski.'],
  ['shekau',    'apellido del líder de Boko Haram Abubakar Shekau.'],
  ['prabhakaran', 'apellido del líder de los Tigres Tamiles Velupillai Prabhakaran.'],
  ['tsarnaev',  'apellido de los autores del atentado de la maratón de Boston (Tamerlan y Dzhokhar Tsarnaev).'],
  ['abedi',     'apellido del autor del atentado de Manchester Arena Salman Abedi.'],
  ['mercader',  'apellido del asesino de Trotski Ramón Mercader.'],
  // ── Asesinos en serie con apellidos extremadamente raros
  ['dahmer',    'apellido del asesino en serie Jeffrey Dahmer.'],
  ['chikatilo', 'apellido del asesino en serie Andrei Chikatilo.'],
  ['garavito',  'apellido del asesino en serie Luis Garavito.'],
  ['gacy',      'apellido del asesino en serie John Wayne Gacy.'],
  ['wuornos',   'apellido de la asesina en serie Aileen Wuornos.'],
  ['arropiero', 'alias del asesino en serie español "El Arropiero".'],
  ['ferrandiz', 'apellido del asesino en serie español Joaquín Ferrándiz.'],
  ['ferrándiz', 'apellido del asesino en serie español Joaquín Ferrándiz.'],
  ['shipman',   'apellido del asesino en serie médico Harold Shipman.'],
  ['ridgway',   'apellido del "Green River Killer" Gary Ridgway.'],
  ['pickton',   'apellido del asesino en serie canadiense Robert Pickton.'],
  ['nilsen',    'apellido del asesino en serie británico Dennis Nilsen.'],
  ['kemper',    'apellido del asesino en serie Edmund Kemper.'],
  ['kürten',    'apellido del "Vampiro de Düsseldorf" Peter Kürten.'],
  ['kurten',    'apellido del "Vampiro de Düsseldorf" Peter Kürten.'],
  ['haarmann',  'apellido del "Carnicero de Hannover" Fritz Haarmann.'],
  ['sobhraj',   'apellido del asesino en serie internacional Charles Sobhraj.'],
  ['onoprienko', 'apellido del asesino en serie ucraniano Anatoly Onoprienko.'],
  ['suradji',   'apellido del asesino en serie indonesio Ahmad Suradji.'],
  ['rifkin',    'apellido del asesino en serie Joel Rifkin.'],
  ['gendron',   'apellido del autor de la masacre de Buffalo Payton Gendron.'],
  ['miyazaki',  'apellido del asesino japonés Tsutomu Miyazaki.'],
  // ── Tiradores de masas con apellidos raros
  ['klebold',   'apellido del tirador de Columbine Dylan Klebold.'],
  ['tarrant',   'apellido del autor de la masacre de Christchurch Brenton Tarrant.'],
  ['crusius',   'apellido del autor de la masacre de El Paso Patrick Crusius.'],
  ['paddock',   'apellido del autor del tiroteo de Las Vegas Stephen Paddock.'],
  ['lubitz',    'apellido del copiloto del Germanwings 9525 Andreas Lubitz.'],
  ['breton',    'apellido del condenado José Bretón (asesinato de sus hijos en Córdoba).'],
  ['bretón',    'apellido del condenado José Bretón.'],
  // ── Mafia con apellidos raros
  ['gotti',     'apellido del jefe mafioso John Gotti.'],
  ['gravano',   'apellido del mafioso delator Sammy "the Bull" Gravano.'],
  ['provenzano', 'apellido del jefe mafioso Bernardo Provenzano.'],
  ['galante',   'apellido del jefe mafioso Carmine Galante.'],
  // ── Abusadores notorios
  ['epstein',   'apellido del condenado por explotación sexual Jeffrey Epstein.'],
  ['weinstein', 'apellido del condenado por agresión sexual Harvey Weinstein.'],
  ['savile',    'apellido del depredador sexual británico Jimmy Savile.'],
  ['nassar',    'apellido del médico abusador Larry Nassar.'],
  ['dutroux',   'apellido del pedófilo y asesino belga Marc Dutroux.'],
  ['sandusky',  'apellido del condenado Jerry Sandusky por abuso sexual de menores.'],
  // ── Líderes de sectas con muertes/abusos masivos
  ['koresh',    'apellido (adoptado) del líder davidiano David Koresh.'],
  ['applewhite', 'apellido del líder de Heaven\'s Gate Marshall Applewhite.'],
  ['asahara',   'apellido (adoptado) del líder de Aum Shinrikyo Shoko Asahara.'],
  ['raniere',   'apellido del fundador de NXIVM Keith Raniere.'],
  ['kibwetere', 'apellido del líder ugandés de los Diez Mandamientos Joseph Kibwetere.'],
  ['theriault', 'apellido del líder de secta canadiense Roch Thériault.'],
  ['thériault', 'apellido del líder de secta canadiense Roch Thériault.'],
  ['lundgren',  'apellido del líder de secta mormona escisionista Jeffrey Lundgren.'],
  // ── Abusadores en contextos religiosos
  ['maciel',    'apellido del fundador de los Legionarios de Cristo Marcial Maciel — abusos reconocidos por la Santa Sede.'],
  ['karadima',  'apellido del sacerdote chileno laicizado Fernando Karadima por abuso de menores.'],
  ['mccarrick', 'apellido del excardenal Theodore McCarrick, primero laicizado por abusos sexuales.'],
  ['vanier',    'apellido del fundador de L\'Arche Jean Vanier — abusos confirmados póstumamente.'],
  // ── NO incluidos por ser apellidos comunes en sus países (sólo se
  //    flagean por match nombre+apellido completo):
  //    Bundy, Manson, Ramirez, Escobar, Capone, Sutcliffe, Gein,
  //    Holmes, Fish, Guzmán, Lanza, Harris, Ramos, Whitman, Galán,
  //    Delgado, Rodríguez, King, Trump, Putin, Castro, Franco, Stalin
  //    (raro pero usado como pseudónimo), Cortés, Pizarro, Salazar,
  //    Trujillo (común en Latinoamérica), Mubarak (árabe común),
  //    Black (común), Glitter (alias), Cosby, Jones (super-común →
  //    nunca flag de apellido suelto, sólo "Jim Jones" entero), Berg,
  //    West (super-común), Brady, Hindley, Cruz, Holmes (James), Cho
  //    (super-común coreano), Mateen, Roof, Bowers, Hamilton,
  //    Bryant (super-común), Kato, Atta, Mohammed (super-común),
  //    Pell, Castro, Castro Ruz, Lubitz (alemán raro pero existe),
  //    Mubarak, Mengistu — añadidos arriba selectivamente.
]);
