import fs from 'fs';
let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');
content = content.replace(
  'const blankField = "__________ [ENTER RAW DATA]";',
  `const cleanDrug = productName.replace(/tablets?|capsules?|injections?|gastro-resistant|delayed-release|\\d+\\s*mg|\\d+\\s*g/gi, '').trim() || "Active Pharmaceutical Ingredient";\n  const blankField = "__________ [ENTER RAW DATA]";`
);
fs.writeFileSync('src/services/rsPharmaDatabase.ts', content);
