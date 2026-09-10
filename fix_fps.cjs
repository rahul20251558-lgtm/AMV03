const fs = require('fs');

let inputForm = fs.readFileSync('src/components/AMVInputForm.tsx', 'utf8');
inputForm = inputForm.replace('accept=".pdf,.docx"', 'accept=".pdf,image/*"');
fs.writeFileSync('src/components/AMVInputForm.tsx', inputForm);

