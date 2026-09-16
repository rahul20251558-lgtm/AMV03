import fs from 'fs';
const files = [
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/mltPharmaDatabase.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/""0\.02/g, '"0.02');
  code = code.replace(/""0\.2/g, '"0.2');
  
  fs.writeFileSync(file, code);
}
