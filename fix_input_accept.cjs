const fs = require('fs');
let code = fs.readFileSync('src/components/AMVInputForm.tsx', 'utf8');

// I notice line 311 has accept=".pdf,.docx", which means images might not be selectable, 
// wait, the problem is PDF upload is NOT happening.
code = code.replace('accept=".pdf,.docx"', 'accept=".pdf,image/*"');

fs.writeFileSync('src/components/AMVInputForm.tsx', code);
