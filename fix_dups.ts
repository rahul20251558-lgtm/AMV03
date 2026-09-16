import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

// There are multiple generateUniqueValidationCodes implementations, we just need one.
// Let's split by "export function getBaseMonograph"
const parts = content.split('export function getBaseMonograph');
let firstPart = parts[0];

// In firstPart, find the FIRST "export function generateUniqueValidationCodes"
const idx1 = firstPart.indexOf('export function generateUniqueValidationCodes');
if (idx1 !== -1) {
  // Find where it ends: the last closing brace before the end of firstPart
  const idx2 = firstPart.lastIndexOf('}');
  // we want to keep only from idx1 to idx2 + 1
  const validCode = firstPart.substring(idx1, idx2 + 1);
  firstPart = firstPart.substring(0, idx1) + validCode + '\n\n';
}

content = firstPart + 'export function getBaseMonograph' + parts[1];
fs.writeFileSync('src/services/pharmaDatabase.ts', content);
