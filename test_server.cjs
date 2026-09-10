const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

console.log(code.includes('fpsFileData'));
