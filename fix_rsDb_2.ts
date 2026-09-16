import fs from 'fs';
let rsDb = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');
rsDb = rsDb.replace(/\$\{"Active Pharmaceutical Ingredient"\}/g, '${cleanDrug}');
fs.writeFileSync('src/services/rsPharmaDatabase.ts', rsDb);
