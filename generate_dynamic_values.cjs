const fs = require('fs');
const files = [
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts',
  'src/services/pharmaMathEngine.ts'
];

// Helper to replace text
function patchFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
}

// 1. In pharmaDatabase, dissolutionPharmaDatabase, rsPharmaDatabase
// Inject PRNG
const injectPRNG = `
  const rand = createSeededRandom(runKey || productName || seed.productName);
  const A_std = ssMath.meanArea;
`;
