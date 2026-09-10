const fs = require('fs');
const file = 'src/services/pharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/function generateAMVDataForProduct/g, 'export function generateAMVDataForProduct');
code = code.replace(/function generateUniqueValidationCodes/g, 'export function generateUniqueValidationCodes');

// In JS transpiled code, there might be variables instead of functions. Let's check for 'generateAMVDataForProduct'.
