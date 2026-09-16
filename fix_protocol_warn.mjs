import fs from 'fs';
const files = [
  'src/services/amvDocxGenerator.ts',
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/mltDocxGenerator.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST\.'/, "ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.\\n\\nNOTE TO ANALYST: Linearity, accuracy, and precision parameters must be evaluated strictly based on the defined working concentration range and specification limits.'");
  
  fs.writeFileSync(file, code);
}
