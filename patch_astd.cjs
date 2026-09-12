const fs = require('fs');
let file = 'src/services/dissolutionPharmaDatabase.ts';
let content = fs.readFileSync(file, 'utf-8');

// I will define A_std right after ssMath is generated.
content = content.replace(/const ssInjections:/, 'const A_std = ssMath.meanArea;\n  const ssInjections:');

// And remove other definitions of A_std if any, but since `const A_std` might fail if it's already there in the scope.
content = content.replace(/const A_std = ssMath\.meanArea;/g, '');
content = content.replace(/const ssInjections:/, 'const A_std = ssMath.meanArea;\n  const ssInjections:');

fs.writeFileSync(file, content);
