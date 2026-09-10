const fs = require('fs');
const file = 'src/services/rsPharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('extractDynamicLabelClaim')) {
  // Add import
  code = code.replace(
    "import { parseProductStrength, generateRSDocumentCode } from './pharmaMathEngine';",
    "import { parseProductStrength, generateRSDocumentCode, extractDynamicLabelClaim } from './pharmaMathEngine';"
  );
  
  // Replace the old override block
  const oldOverrideStart = code.indexOf('// --- DYNAMIC FDC LABEL CLAIM OVERRIDE ---');
  const oldOverrideEnd = code.indexOf('// -----------------------------------------') + '// -----------------------------------------'.length;
  
  if (oldOverrideStart !== -1 && oldOverrideEnd !== -1) {
    const replacement = `
  const extracted = extractDynamicLabelClaim(productName, seed.testParameter, seed.activeSubstance, seed.labelClaim);
  let dynamicLabelClaim = extracted.labelClaim;
  let dynamicActiveSubstance = extracted.activeSubstance;
`;
    code = code.substring(0, oldOverrideStart) + replacement + code.substring(oldOverrideEnd);
  }
  
  fs.writeFileSync(file, code);
  console.log('rsPharmaDatabase.ts updated');
} else {
  console.log('rsPharmaDatabase.ts already updated');
}
