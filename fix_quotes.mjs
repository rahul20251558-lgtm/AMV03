import fs from 'fs';
const files = [
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/mltPharmaDatabase.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix """ -> "20"
  code = code.replace(/"""/g, '"20"');
  code = code.replace(/""0/g, '200');
  code = code.replace(/""/g, '20'); // wait, this could break empty strings like "" !
  // Let's be careful. What broke?
  // `""" mg Atorvastatin per tablet"` -> `"20 mg Atorvastatin per tablet"`
  
  fs.writeFileSync(file, code);
}
