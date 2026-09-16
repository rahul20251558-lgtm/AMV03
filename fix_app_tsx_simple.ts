import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
  'const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo); // {',
  'const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo, {'
);

fs.writeFileSync('src/App.tsx', app);
