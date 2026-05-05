#!/usr/bin/env node
// Tests deterministas para los parsers OCR (MRZ + DNI). Funcionan sin
// browser porque son lógica pura.

import { parseMrz, icaoChecksum } from '../docs/lib/ocr/mrz.js';
import { validateDniNie, dniLetter, findDniNieInText } from '../docs/lib/ocr/dniSpain.js';

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

console.log(`\n${pass}/${pass+fail}`);
if (fail) process.exit(1);
