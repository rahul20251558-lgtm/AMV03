const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "setAssayData((prev) => synchronizeDocumentReportDates(prev, newDate));",
  "setAssayData((prev) => synchronizeDocumentReportDates(prev, newDate));\n    setMltData((prev) => synchronizeDocumentReportDates(prev, newDate));"
);

fs.writeFileSync('src/App.tsx', content);
