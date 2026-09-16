import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

// Remove the second generateUniqueValidationCodes
content = content.replace(
  /export function generateUniqueValidationCodes.*?\}\n(?=export function getBaseMonograph)/s,
  ''
);

// Remove everything from the second getMethodDocumentNumber onwards
const idx = content.indexOf('export function getMethodDocumentNumber', content.indexOf('export function getMethodDocumentNumber') + 1);
if (idx !== -1) {
  content = content.slice(0, idx);
}

fs.writeFileSync('src/services/pharmaDatabase.ts', content);
