const fs = require('fs');
const file = 'src/services/pharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/\/\*[\s\S]*?productName: string,\n  existingCodes\?: Partial<UniqueCodes>\n\): AMVDocumentData \{\n  const mono = getBaseMonograph\(productName\);\n  return buildFullAMVDataFromMonograph\(productName, mono, existingCodes\);\n\}/, '');

fs.writeFileSync(file, code);
