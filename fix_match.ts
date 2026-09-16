import fs from 'fs';
let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

content = content.replace(
  /const numMatch = lim\.limit\.match\(\/\(\\d\+\(\?:\\\.\\d\+\)\?\)\/\);/g,
  `const numMatch = lim.limit.match(/([\\d.]+)\\s*%/);`
);

fs.writeFileSync('src/services/rsPharmaDatabase.ts', content);
