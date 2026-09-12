const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/const \[isValidated, setIsValidated\] = useState\(false\);\n/g, '');
content = content.replace(/setIsValidated\(true\);\n/g, '');
content = content.replace(/setIsValidated\(false\);\n/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
