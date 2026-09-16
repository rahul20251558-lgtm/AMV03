import fs from 'fs';
const files = [
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/mltPharmaDatabase.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/injectionVolume: 20 \\xB5L",/g, 'injectionVolume: "20 \\xB5L",');
  code = code.replace(/Weigh 20 enteric-coated tablets/g, 'Weigh "20" enteric-coated tablets');
  code = code.replace(/Weigh 20 dosage/g, 'Weigh "20" dosage');
  code = code.replace(/Weigh 20 tablets/g, 'Weigh "20" tablets');
  code = code.replace(/Empty 20 capsules/g, 'Empty "20" capsules');
  code = code.replace(/0\.02 mg\/mL \(20 \\xB5g\/mL\)",/g, '"0.02 mg/mL (20 \\xB5g/mL)",');
  code = code.replace(/: 20 mg/g, ': "20 mg');
  
  fs.writeFileSync(file, code);
}
