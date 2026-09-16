import fs from 'fs';
const files = [
  'src/services/mathUtils.ts',
  'src/services/calculations.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\.toFixed\(4\)/g, '.toPrecision(6)');
  content = content.replace(/\.toFixed\(5\)/g, '.toPrecision(6)');
  fs.writeFileSync(file, content);
}
