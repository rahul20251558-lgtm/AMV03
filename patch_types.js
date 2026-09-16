const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/: number;/g, ': number | string;');
// But be careful, some numbers like srNo or injectionNo might be better left as number?
// It doesn't matter much if they are number | string.

fs.writeFileSync('src/types.ts', code);
