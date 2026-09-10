const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const prompt = `You are a Principal/g, "let prompt = `You are a Principal");

fs.writeFileSync(file, code);
