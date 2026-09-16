const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  /effectiveDate:\s*reportDate,\s*\}, \{ \.\.\.activeOverrides, targetApi \}\);/,
  'effectiveDate: reportDate,\n          ...activeOverrides,\n          targetApi\n        });'
);
fs.writeFileSync('src/App.tsx', content);
