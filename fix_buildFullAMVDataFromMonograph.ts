import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

const additional = `
export function buildFullAMVDataFromMonograph(productName: string, mono: MonographDefinition, overrides?: any): any {
  return generateAMVDataForProduct(productName, overrides);
}
`;

content = content + additional;
fs.writeFileSync('src/services/pharmaDatabase.ts', content);
