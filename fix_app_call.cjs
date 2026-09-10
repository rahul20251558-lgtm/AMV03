const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const localData = generateAMVDataForProduct\(productName, \{\n\s*documentNo,\n\s*validationBatchNo: batchNo,\n\s*standardLotNo: standardLot,\n\s*companyName,\n\s*\}\);/g,
  "const localData = generateAMVDataForProduct(productName, {\n      documentNo,\n      validationBatchNo: batchNo,\n      standardLotNo: standardLot,\n      companyName,\n    }, fpsOverrides);"
);

fs.writeFileSync(file, code);
