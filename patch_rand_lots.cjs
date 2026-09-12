const fs = require('fs');

const files = [
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/Math\.floor\(rand\(\) \* 1000\)/g, "Math.floor(Math.random() * 1000)");
  // Or even better, just leave it as Math.random for reagent lots, or define rand at the top of the function.
  // We'll just define const randGlobal = createSeededRandom(...) at the top of the functions!
  content = content.replace(/Math\.floor\(rand\(\) \* 1000\)/g, "Math.floor(createSeededRandom(mono?.productName || seed?.productName || productName)() * 1000)");
  
  fs.writeFileSync(file, content, 'utf-8');
}
