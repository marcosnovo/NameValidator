#!/usr/bin/env node
// Tests deterministas para los parsers OCR (MRZ + DNI). Funcionan sin
// browser porque son lógica pura.

import { parseMrz, icaoChecksum } from '../docs/lib/ocr/mrz.js';
import { validateDniNie, dniLetter, findDniNieInText } from '../docs/lib/ocr/dniSpain.js';
import { parseDniSpainFront } from '../docs/lib/ocr/dniSpainFront.js';
import { parsePassportFront } from '../docs/lib/ocr/passportFront.js';
import { parseDrivingLicense } from '../docs/lib/ocr/drivingLicense.js';
import { detectDocumentType } from '../docs/lib/ocr/identityLabels.js';

let pass = 0, fail = 0;
function assert(cond, name) {
  if (cond) { pass++; console.log('✓', name); }
  else { fail++; console.log('✗', name); }
}

// ── ICAO checksum ──────────────────────────────────────────────────────
// Ejemplos del estándar ICAO 9303
// 520727: 5*7+2*3+0*1+7*7+2*3+7*1 = 35+6+0+49+6+7 = 103 → mod 10 = 3
assert(icaoChecksum('520727') === 3, 'ICAO checksum: 520727 → 3');
assert(icaoChecksum('AB2134<') === 5, 'ICAO checksum: AB2134< → 5');
assert(icaoChecksum('L898902C<') === 3, 'ICAO checksum: L898902C< → 3');

// ── DNI español ────────────────────────────────────────────────────────
// Algoritmo: 12345678 mod 23 = 14 → DNI_LETTERS[14] = "Z"
assert(dniLetter(12345678) === 'Z', 'dniLetter(12345678) === Z');
assert(validateDniNie('12345678Z').valid === true, 'DNI válido 12345678Z');
assert(validateDniNie('12345678A').valid === false, 'DNI inválido 12345678A');
assert(validateDniNie('00000000T').valid === true, 'DNI válido 00000000T');

// NIE: X1234567L  (X→0, 01234567 mod 23 = 21 → DNI_LETTERS[21] = K?)
// Voy a calcular: LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"
//                 índices 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
// 1234567 mod 23 = 1234567/23 = 53676*23 = 1234548, 1234567-1234548 = 19 → LETTERS[19] = L
assert(validateDniNie('X1234567L').valid === true, 'NIE válido X1234567L');
// Y1234567: Y→1, 11234567 mod 23 = 10 → LETTERS[10] = X. Así que es VÁLIDO.
assert(validateDniNie('Y1234567X').valid === true, 'NIE válido Y1234567X');
assert(validateDniNie('Y1234567Z').valid === false, 'NIE inválido Y1234567Z (letra mal)');

// ── findDniNieInText ───────────────────────────────────────────────────
const dniText = 'NOMBRE: PEPE\nDNI: 12345678Z\nFECHA: 1990-01-01';
const dniFound = findDniNieInText(dniText);
assert(dniFound?.validation?.valid === true, 'findDniNie en texto');

// ── MRZ TD3 (pasaporte español ejemplo de la ICAO) ─────────────────────
// Ejemplo canónico del estándar ICAO 9303 part 4
const td3 = [
  'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
  'L898902C36UTO7408122F1204159ZE184226B<<<<<10',
].join('\n');
const mrz = parseMrz(td3);
assert(mrz?.type === 'TD3', 'MRZ TD3 detectado');
assert(mrz?.surname === 'ERIKSSON', `MRZ TD3 surname (got: "${mrz?.surname}")`);
assert(mrz?.givenNames === 'ANNA MARIA', `MRZ TD3 givenNames (got: "${mrz?.givenNames}")`);
assert(mrz?.documentNumber === 'L898902C3', `MRZ TD3 docNumber (got: "${mrz?.documentNumber}")`);
assert(mrz?.issuingCountry === 'UTO', 'MRZ TD3 issuingCountry');
assert(mrz?.nationality === 'UTO', 'MRZ TD3 nationality');
assert(mrz?.checksums?.document === true, 'MRZ TD3 checksum doc OK');
assert(mrz?.checksums?.birth === true, 'MRZ TD3 checksum birth OK');
assert(mrz?.checksums?.expiry === true, 'MRZ TD3 checksum expiry OK');

// ── MRZ TD3 con un dígito mal (debe fallar checksum) ───────────────────
const td3Fake = [
  'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
  'L898902C36UTO7408122F1204158ZE184226B<<<<<10',  // F1204158 en lugar de F1204159
].join('\n');
const mrzFake = parseMrz(td3Fake);
assert(mrzFake?.checksums?.expiry === false, 'MRZ TD3 falsificado: checksum expiry FALLA');

// ── MRZ TD1 (DNI español) ──────────────────────────────────────────────
// Ejemplo válido construido a mano. Para que los checksums cuadren los
// calculo con el algoritmo:
// l1: I<ESPABCD12345<<<<<<<<<<<<<<< — número ABCD12345, sin checksum aún
// Calculamos: icaoChecksum('ABCD12345') = ?
const td1l1number = 'ABCD12345';
const td1l1cs = icaoChecksum(td1l1number);
const td1l2birth = '900115';
const td1l2birthCs = icaoChecksum(td1l2birth);
const td1l2expiry = '301231';
const td1l2expiryCs = icaoChecksum(td1l2expiry);

const td1l1 = `I<ESP${td1l1number}${td1l1cs}<<<<<<<<<<<<<<<`.padEnd(30, '<').slice(0, 30);
const td1l2composite = `${td1l2birth}${td1l2birthCs}M${td1l2expiry}${td1l2expiryCs}ESP<<<<<<<<<<<`.padEnd(29, '<').slice(0, 29);
// Calcula checksum compuesto sobre l1[5..29] + l2[0..7] + l2[8..15] + l2[18..29]
const compositeStr = td1l1.substring(5, 30) + td1l2composite.substring(0, 7) + td1l2composite.substring(8, 15) + td1l2composite.substring(18, 29);
const td1l2cs = icaoChecksum(compositeStr);
const td1l2 = (td1l2composite + td1l2cs).slice(0, 30);
const td1l3 = 'GARCIA<LOPEZ<<JUAN<MIGUEL<<<<<'.padEnd(30, '<').slice(0, 30);
const td1mrz = `${td1l1}\n${td1l2}\n${td1l3}`;
const td1Result = parseMrz(td1mrz);
assert(td1Result?.type === 'TD1', `MRZ TD1 detectado (got: ${td1Result?.type})`);
assert(td1Result?.surname === 'GARCIA LOPEZ', `MRZ TD1 surname (got: "${td1Result?.surname}")`);
assert(td1Result?.givenNames === 'JUAN MIGUEL', `MRZ TD1 givenNames`);
assert(td1Result?.checksums?.document === true, 'MRZ TD1 checksum doc');
assert(td1Result?.checksums?.birth === true, 'MRZ TD1 checksum birth');
assert(td1Result?.checksums?.expiry === true, 'MRZ TD1 checksum expiry');

// ── DNI ESPAÑOL FRONT (parser por labels — el caso que fallaba al usuario)
// OCR sintético basado en el DNI de muestra "JUAN ESPAÑOL ESPAÑOL"
// (DNI 65004204V, IDESP AAA023112, nacido 10/01/1950, válido hasta 17/04/2018)
const dniFrontText = `DOCUMENTO NACIONAL DE IDENTIDAD
ESPAÑA
PRIMER APELLIDO
ESPAÑOL
SEGUNDO APELLIDO
ESPAÑOL
NOMBRE
JUAN
SEXO    NACIONALIDAD
M       ESP
FECHA DE NACIMIENTO
10 01 1950
IDESP
AAA023112
VALIDO HASTA
17 04 2018
Juan Español
DNI NUM.
65004204V`;
const front = parseDniSpainFront(dniFrontText);
assert(!!front, 'DNI Front: detectado como DNI español');
assert(front?.surname1 === 'ESPAÑOL', `DNI Front primer apellido (got: "${front?.surname1}")`);
assert(front?.surname2 === 'ESPAÑOL', `DNI Front segundo apellido (got: "${front?.surname2}")`);
assert(front?.given === 'JUAN', `DNI Front nombre (got: "${front?.given}")`);
assert(front?.fullName === 'JUAN ESPAÑOL ESPAÑOL', `DNI Front fullName (got: "${front?.fullName}")`);
assert(front?.dniNumber === '65004204V', `DNI Front número (got: "${front?.dniNumber}")`);
assert(front?.valid === true, 'DNI Front letra válida');
assert(front?.birthDate?.iso === '1950-01-10', `DNI Front fecha nac (got: "${front?.birthDate?.iso}")`);
assert(front?.expiryDate?.iso === '2018-04-17', `DNI Front fecha expir (got: "${front?.expiryDate?.iso}")`);
assert(front?.idesp === 'AAA023112', `DNI Front IDESP (got: "${front?.idesp}")`);

// ── DNI Front con OCR PARCIAL (faltan algunos labels — que aún funcione)
const partialText = `DOCUMENTO NACIONAL DE IDENTIDAD
PRIMER APELLIDO
GARCIA
SEGUNDO APELLIDO
LOPEZ
NOMBRE
MARIA
12345678Z`;
const partial = parseDniSpainFront(partialText);
assert(partial?.fullName === 'MARIA GARCIA LOPEZ', `DNI Front parcial (got: "${partial?.fullName}")`);

// ── No es DNI (texto random) → null
const notDni = parseDniSpainFront('Hola que tal\nMe llamo Juan\nEsto es texto random');
assert(notDni === null, 'Texto random no es DNI → null');

// ─────────────────────────────────────────────────────────────────────
// PASAPORTE FRONTAL (multi-idioma)
// ─────────────────────────────────────────────────────────────────────

// Pasaporte español típico (etiquetas bilingües ES + EN)
const passportEsText = `PASAPORTE / PASSPORT
ESPAÑA / SPAIN
Tipo / Type   Código / Code
P             ESP
Pasaporte N° / Passport No.
PAB123456
Apellidos / Surname
GARCIA LOPEZ
Nombre / Given names
MARIA ELENA
Nacionalidad / Nationality
ESPAÑOLA / ESP
Fecha de nacimiento / Date of birth
15 03 1985
Sexo / Sex
F
Lugar de nacimiento / Place of birth
MADRID
Fecha de expedición / Date of issue
01 06 2020
Fecha de caducidad / Date of expiry
01 06 2030`;
const pp = parsePassportFront(passportEsText);
assert(!!pp, 'Pasaporte ES detectado');
assert(pp?.surname === 'GARCIA LOPEZ', `Pasaporte surname (got: "${pp?.surname}")`);
assert(pp?.given === 'MARIA ELENA', `Pasaporte given (got: "${pp?.given}")`);
assert(pp?.fullName === 'MARIA ELENA GARCIA LOPEZ', `Pasaporte fullName`);
assert(pp?.documentNumber === 'PAB123456', `Pasaporte docNum (got: "${pp?.documentNumber}")`);
assert(pp?.nationality === 'ESP', `Pasaporte nationality (got: "${pp?.nationality}")`);
assert(pp?.birthDate?.iso === '1985-03-15', `Pasaporte birthDate`);
assert(pp?.expiryDate?.iso === '2030-06-01', `Pasaporte expiryDate`);
assert(pp?.sex === 'F', `Pasaporte sex (got: "${pp?.sex}")`);

// Pasaporte UK (sólo inglés)
const passportUkText = `PASSPORT
UNITED KINGDOM OF GREAT BRITAIN
Type    Code   Passport No.
P       GBR    123456789
Surname
SMITH
Given names
JOHN ROBERT
Nationality
BRITISH CITIZEN
Date of birth
12 NOV 1980
Sex
M
Place of birth
LONDON
Date of issue
05 04 2018
Date of expiry
05 04 2028`;
const ppUk = parsePassportFront(passportUkText);
assert(!!ppUk, 'Pasaporte UK detectado');
assert(ppUk?.fullName === 'JOHN ROBERT SMITH', `Pasaporte UK fullName (got: "${ppUk?.fullName}")`);
assert(ppUk?.documentNumber === '123456789', `Pasaporte UK docNum`);
assert(ppUk?.birthDate?.iso === '1980-11-12', `Pasaporte UK birthDate (DD MMM YYYY)`);

// Texto random no es pasaporte
assert(parsePassportFront('hola que tal\nesto es random') === null, 'Texto random ≠ pasaporte');

// ─────────────────────────────────────────────────────────────────────
// CARNET DE CONDUCIR (UE armonizado + USA)
// ─────────────────────────────────────────────────────────────────────

// Carnet de conducir español (formato UE armonizado)
const licenseEsText = `PERMISO DE CONDUCCIÓN
ESPAÑA
1. PEREZ MARTINEZ
2. CARLOS
3. 22-05-1990 SEVILLA
4a. 10-01-2018
4b. 10-01-2028
4c. JEFATURA DE TRAFICO
5. 12345678A
9. AM A1 A2 A B
JEFATURA PROVINCIAL DE TRAFICO`;
const licEs = parseDrivingLicense(licenseEsText);
assert(!!licEs, 'Carnet ES detectado');
assert(licEs?.surname === 'PEREZ MARTINEZ', `Carnet surname (got: "${licEs?.surname}")`);
assert(licEs?.given === 'CARLOS', `Carnet given (got: "${licEs?.given}")`);
assert(licEs?.fullName === 'CARLOS PEREZ MARTINEZ', `Carnet fullName`);
assert(licEs?.documentNumber === '12345678A', `Carnet docNum (got: "${licEs?.documentNumber}")`);
assert(licEs?.birthDate?.iso === '1990-05-22', `Carnet birthDate`);
assert(licEs?.expiryDate?.iso === '2028-01-10', `Carnet expiryDate`);
assert(licEs?.categories.includes('B'), 'Carnet incluye categoría B');
assert(licEs?.categories.includes('A'), 'Carnet incluye categoría A');

// Carnet francés (UE armonizado en francés)
const licenseFrText = `PERMIS DE CONDUIRE
RÉPUBLIQUE FRANÇAISE
1. DUPONT
2. JEAN-MARIE
3. 15.07.1978 PARIS
4a. 03.05.2015
4b. 03.05.2025
4c. PREFECTURE DE POLICE PARIS
5. 78AB12345
9. B BE`;
const licFr = parseDrivingLicense(licenseFrText);
assert(!!licFr, 'Carnet FR detectado');
assert(licFr?.fullName === 'JEAN-MARIE DUPONT', `Carnet FR fullName (got: "${licFr?.fullName}")`);
assert(licFr?.documentNumber === '78AB12345', `Carnet FR docNum`);

// Carnet USA (no UE — labels específicos)
const licenseUsText = `DRIVER LICENSE
CALIFORNIA USA
DL: A1234567
LN: SMITH
FN: JOHN MICHAEL
DOB: 03/15/1985
EXP: 03/15/2030
SEX: M
CLASS: C`;
const licUs = parseDrivingLicense(licenseUsText);
// Para USA el matcher de labels puede o no funcionar — al menos detecta el tipo
assert(!!licUs, 'Carnet USA detectado al menos como license');

// ─────────────────────────────────────────────────────────────────────
// DETECTOR DE TIPO DE DOCUMENTO
// ─────────────────────────────────────────────────────────────────────
const tDni = detectDocumentType('DOCUMENTO NACIONAL DE IDENTIDAD\nMINISTERIO DEL INTERIOR\nIDESP');
assert(tDni.type === 'dniSpain', `Tipo detectado dniSpain (got: ${tDni.type})`);

const tPp = detectDocumentType('PASSPORT\nUNITED KINGDOM');
assert(tPp.type === 'passport', `Tipo detectado passport (got: ${tPp.type})`);

const tLic = detectDocumentType('PERMISO DE CONDUCCIÓN ESPAÑA categorías');
assert(tLic.type === 'drivingLicense', `Tipo detectado license (got: ${tLic.type})`);

const tNone = detectDocumentType('hola que tal');
assert(tNone.type === 'unknown', 'Tipo unknown para texto random');

console.log(`\n${pass}/${pass+fail}`);
if (fail) process.exit(1);
