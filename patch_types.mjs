import fs from 'fs';
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/: number;/g, ': number | string;');
fs.writeFileSync('src/types.ts', code);
