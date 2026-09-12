const fs = require('fs');

let content = fs.readFileSync('src/services/dissolutionPharmaDatabase.ts', 'utf-8');

content = content.replace(
  "export function getDissolutionMonograph(productName: string): DissolutionMonographInfo {",
  "export function getDissolutionMonograph(productName: string, targetApi?: string): DissolutionMonographInfo {"
);

content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(productName);",
  "const { strengthNum, unit } = parseProductStrength(productName, targetApi);"
);

content = content.replace(
  "function inferDissolutionMonograph(productName: string): DissolutionMonographInfo {",
  "function inferDissolutionMonograph(productName: string, targetApi?: string): DissolutionMonographInfo {"
);

content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(safeName);",
  "const { strengthNum, unit } = parseProductStrength(safeName, targetApi);"
);

content = content.replace(
  "return inferDissolutionMonograph(productName);",
  "return inferDissolutionMonograph(productName, targetApi);"
);

content = content.replace(
  "let mono = getDissolutionMonograph(safeProductName);",
  "let mono = getDissolutionMonograph(safeProductName, overrides?.targetApi);"
);

fs.writeFileSync('src/services/dissolutionPharmaDatabase.ts', content, 'utf-8');
