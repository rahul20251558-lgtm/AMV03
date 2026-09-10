const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the COA upload mock delay with instant
code = code.replace(
  /setTimeout\(\(\) => \{\n\s*setCoaUploaded\(true\);\n\s*setIsLoading\(false\);\n\s*\}, 800\);/g,
  "setCoaUploaded(true);\n            setIsLoading(false);"
);

// Replace AMV generation timeout from 50 to 0 or synchronous
code = code.replace(/setTimeout\(\(\) => \{/g, 'setTimeout(() => {');
code = code.replace(/\}, 50\);/g, '}, 10);'); 

fs.writeFileSync('src/App.tsx', code);
