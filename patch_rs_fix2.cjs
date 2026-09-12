const fs = require('fs');

let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

content = content.replace(
  "function adaptMonographToProduct(baseSeed: RSMonographSeed, targetName: string): RSMonographSeed {",
  "function adaptMonographToProduct(baseSeed: RSMonographSeed, targetName: string, targetApi?: string): RSMonographSeed {"
);

content = content.replace(
  "export function getRSMonograph(productName: string): RSMonographSeed {",
  "export function getRSMonograph(productName: string, targetApi?: string): RSMonographSeed {"
);

content = content.replace(
  "return adaptMonographToProduct(found, safeName);",
  "return adaptMonographToProduct(found, safeName, targetApi);"
);

content = content.replace(
  "let seed = getRSMonograph(safeProductName);",
  "let seed = getRSMonograph(safeProductName, options?.targetApi);"
);

content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(productName);",
  "const { strengthNum, unit } = parseProductStrength(productName, targetApi);"
);

fs.writeFileSync('src/services/rsPharmaDatabase.ts', content, 'utf-8');
