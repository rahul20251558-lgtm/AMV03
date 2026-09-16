import fs from 'fs';
const files = [
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/mltPharmaDatabase.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/Weigh "20"/g, 'Weigh 20');
  code = code.replace(/Empty "20"/g, 'Empty 20');
  
  fs.writeFileSync(file, code);
}
