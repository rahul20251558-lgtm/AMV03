const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "const cleanDocNo = codes.documentNo.replace('WC/QC/AMV', prefix);",
  "const cleanDocNo = activeDocumentNo;"
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
