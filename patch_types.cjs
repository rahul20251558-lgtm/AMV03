const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

// Add potencyDecimal and saltFactor to AMVDocumentData, DissolutionAMVDocumentData, RSAMVDocumentData
const toAdd = `
  potencyDecimal?: number;
  saltFactor?: number;
`;
if (!content.includes('potencyDecimal')) {
  content = content.replace(/export interface AMVDocumentData \{/, 'export interface AMVDocumentData {' + toAdd);
  content = content.replace(/export interface DissolutionAMVDocumentData \{/, 'export interface DissolutionAMVDocumentData {' + toAdd);
  content = content.replace(/export interface RSAMVDocumentData \{/, 'export interface RSAMVDocumentData {' + toAdd);
  
  // also Linearity table needs "stockConc" "aliquot" "finalVolume" instead of "nominalWeightMg"
  content = content.replace(/nominalWeightMg: number;/g, 'stockConc: number;\n  aliquot: number;\n  finalVolume: number;');

  fs.writeFileSync('src/types.ts', content, 'utf-8');
}
