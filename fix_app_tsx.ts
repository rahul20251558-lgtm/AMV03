import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
  /const localMLT = generateMLTAMVDataForProduct\(activeProduct, codes\.validationBatchNo\); \/\/ \{\n          protocolNo: mltDocNo,\n          reportNo: `\$\{mltDocNo\}\/R`,\n          companyName,\n          reportDate,\n        \} as any\);/g,
  'const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo, { protocolNo: mltDocNo, reportNo: `${mltDocNo}/R`, companyName, reportDate } as any);'
);

app = app.replace(
  /return synchronizeDocumentReportDates\(generateMLTAMVDataForProduct\(productName, batchNo, \{\n      documentNo: mltDoc,\n      protocolNo: mltDoc,\n      reportNo: `\$\{mltDoc\}\/R`,\n      supersedes,\n      companyName,\n      reportDate,\n      effectiveDate: reportDate,\n    \} as any\), reportDate\);/g,
  'return synchronizeDocumentReportDates(generateMLTAMVDataForProduct(productName, batchNo, { documentNo: mltDoc, protocolNo: mltDoc, reportNo: `${mltDoc}/R`, supersedes, companyName, reportDate, effectiveDate: reportDate } as any), reportDate);'
);

fs.writeFileSync('src/App.tsx', app);
