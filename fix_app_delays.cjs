const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace any fake delays
code = code.replace(/setTimeout\(\(\) => \{\n\s*setCoaUploaded\(true\);\n\s*setIsLoading\(false\);\n\s*\}, 800\);/g, "setCoaUploaded(true);\n            setIsLoading(false);");

code = code.replace(/setTimeout\(\(\) => \{/g, 'setTimeout(() => {');
code = code.replace(/\}, 50\);/g, '}, 10);'); 

fs.writeFileSync('src/App.tsx', code);
