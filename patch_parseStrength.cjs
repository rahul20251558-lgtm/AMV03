const fs = require('fs');

let content = fs.readFileSync('src/services/pharmaMathEngine.ts', 'utf-8');
content = content.replace(
  "export function parseProductStrength(productName: string): { strengthNum: number; unit: string } {",
  "export function parseProductStrength(productName: string, targetApi?: string): { strengthNum: number; unit: string } {"
);

const newBody = `
  const extracted = extractDynamicLabelClaim(productName, targetApi || '', '', '');
  if (extracted.numericStrength) {
    const matchUnit = productName.match(/(mg|g|mcg|µg|%|iu|u)/i);
    return { strengthNum: extracted.numericStrength, unit: (matchUnit ? matchUnit[1].toLowerCase() : 'mg') };
  }
  const match = productName.match(/(\\d+(?:\\.\\d+)?)\\s*(mg|g|mcg|µg|%|iu|u)/i);
  if (match) {
    return { strengthNum: parseFloat(match[1]), unit: match[2].toLowerCase() };
  }
  return { strengthNum: 50.0, unit: 'mg' };
`;

content = content.replace(
  /export function parseProductStrength[\s\S]*?return { strengthNum: 50\.0, unit: 'mg' };\n\}/,
  "export function parseProductStrength(productName: string, targetApi?: string): { strengthNum: number; unit: string } {\n" + newBody + "\n}"
);

fs.writeFileSync('src/services/pharmaMathEngine.ts', content, 'utf-8');
