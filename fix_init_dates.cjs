const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "generateMLTAMVDataForProduct(productName, batchNo, {",
  "synchronizeDocumentReportDates(generateMLTAMVDataForProduct(productName, batchNo, {"
);
content = content.replace(
  "} as any)",
  "} as any), reportDate)"
);

fs.writeFileSync('src/App.tsx', content);
