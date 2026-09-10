const fs = require('fs');

const compiled = fs.readFileSync('dist/server.cjs', 'utf8');
const lines = compiled.split('\n');

const start = lines.findIndex(l => l.includes('function getBaseMonograph(productName)'));
const end = lines.findIndex(l => l.includes('// src/services/rsPharmaDatabase.ts'));

const implementation = lines.slice(start, end).join('\n');

const original = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf8');

// The implementation has "exports.getBaseMonograph = getBaseMonograph;" etc at the end, we can replace them with export
let tsCode = implementation
  .replace(/exports\..*? = .*?;/g, '')
  .replace(/function getBaseMonograph/g, 'export function getBaseMonograph')
  .replace(/function buildFullAMVDataFromMonograph/g, 'export function buildFullAMVDataFromMonograph')
  .replace(/function generateAMVDataForProduct/g, 'export function generateAMVDataForProduct');

// some methods from pharmaMathEngine might be called like "import_pharmaMathEngine.extractDynamicLabelClaim"
tsCode = tsCode.replace(/import_[\w]+\./g, '');

fs.writeFileSync('src/services/pharmaDatabase.ts', original + '\n' + tsCode);
