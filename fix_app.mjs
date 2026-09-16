import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const activeMethod = targetMethod \|\| validationMethod;\n    const activeOverrides = customOverrides !== undefined \? customOverrides : fpsOverrides;/, 'const activeOverrides = customOverrides !== undefined ? customOverrides : fpsOverrides;');

fs.writeFileSync('src/App.tsx', code);
