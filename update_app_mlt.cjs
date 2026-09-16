const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { generateAndDownloadDissolutionDocx } from './services/dissolutionDocxGenerator';",
  `import { generateAndDownloadDissolutionDocx } from './services/dissolutionDocxGenerator';
import { generateAndDownloadMLTDocx } from './services/mltDocxGenerator';`
);

content = content.replace(
  /\} else if \(validationMethod === 'microbial_limit_test'\) \{\s*console\.log\('Download MLT docx not implemented yet'\);\s*\}/g,
  `} else if (validationMethod === 'microbial_limit_test') {
      await generateAndDownloadMLTDocx(mltData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    }`
);

// We need to do it precisely for handleDownloadReport and handleDownloadBoth as well.
content = content.replace(
  /await generateAndDownloadMLTDocx\(mltData, \{ docType: 'protocol', theme, fontFamily, fontSize, dataMode \}\);\s*\}/,
  `await generateAndDownloadMLTDocx(mltData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    }`
); // Wait, this might match incorrectly.

fs.writeFileSync('src/App.tsx', content);
