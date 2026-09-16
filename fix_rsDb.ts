import fs from 'fs';
let rsDb = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');
rsDb = rsDb.replace(/const "Active Pharmaceutical Ingredient" = getCleanDrugDisplayName/g, 'const cleanDrug = getCleanDrugDisplayName');
rsDb = rsDb.replace(/Each tablet contains \$\{"Active Pharmaceutical Ingredient"\}\ /g, 'Each tablet contains ${cleanDrug} ');
rsDb = rsDb.replace(/name: \`\$\{"Active Pharmaceutical Ingredient"\} Reference Standard\`/g, 'name: `${cleanDrug} Reference Standard`');
fs.writeFileSync('src/services/rsPharmaDatabase.ts', rsDb);
