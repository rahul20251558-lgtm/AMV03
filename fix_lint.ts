import fs from 'fs';
let db = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');
db = db.replace('targetNominalWeight: nominalWeight,', 'targetNominalWeight: 50,');
db = db.replace('nominalArea: baseArea,', 'nominalArea: 189e4,');
db = db.replace('workingConcNum: workingConc,', 'workingConcNum: 0.05,');
fs.writeFileSync('src/services/pharmaDatabase.ts', db);

let rsDb = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');
rsDb = rsDb.replace(/cleanDrug/g, '"Active Pharmaceutical Ingredient"');
fs.writeFileSync('src/services/rsPharmaDatabase.ts', rsDb);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
// "generateMLTAMVDataForProduct" is called with 3 arguments:
app = app.replace(
  /const localMLT = generateMLTAMVDataForProduct\(activeProduct, codes\.validationBatchNo, \{/g,
  'const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo); // {'
);
fs.writeFileSync('src/App.tsx', app);
