const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "reportNo: codes.documentNo.replace('/AMV/', '/AMVR/'),",
  "reportNo: codes.documentNo.includes('AMV-') ? codes.documentNo.replace('AMV-', 'AMVR-') : codes.documentNo + '-R',"
);

content = content.replace(
  "setMltData(localMLT);",
  "setMltData(synchronizeDocumentReportDates(localMLT, reportDate) as any);"
);

fs.writeFileSync('src/App.tsx', content);
