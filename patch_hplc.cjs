const fs = require('fs');
const files = [
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Make sure HPLC-02 is in the equipment list
  const hplc02 = `    {
      srNo: 1.5,
      instrumentName: 'High Performance Liquid Chromatograph (System 2)',
      makeModel: 'Agilent 1260 Infinity II',
      equipmentId: 'HPLC-02',
      calibrationDueDate: '14-Sep-2026',
    },
  ];`;
  
  content = content.replace(/equipmentId: 'HPLC-04'[\s\S]*?\},/, (match) => match + '\n' + `    {
      srNo: 1.5,
      instrumentName: 'High Performance Liquid Chromatograph (System 2)',
      makeModel: 'Agilent 1260 Infinity II',
      equipmentId: 'HPLC-02',
      calibrationDueDate: '14-Sep-2026',
    },`);

  // Ensure dates are correctly ordered in completion Record.
  // We have executionDate, etc. Wait, dates are usually correct.
  
  fs.writeFileSync(file, content, 'utf-8');
}
