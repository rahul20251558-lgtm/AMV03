const fs = require('fs');
const file = 'src/services/dissolutionPharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('extractDynamicLabelClaim')) {
  // Add import
  code = code.replace(
    "import { parseProductStrength, computeNominalDissolutionPeakArea, computeRealisticS1Dissolution, computeStableS1Dissolution } from './pharmaMathEngine';",
    "import { parseProductStrength, computeNominalDissolutionPeakArea, computeRealisticS1Dissolution, computeStableS1Dissolution, extractDynamicLabelClaim } from './pharmaMathEngine';"
  );
  
  // Replace the old override block
  const oldOverrideStart = code.indexOf('// --- DYNAMIC FDC LABEL CLAIM OVERRIDE ---');
  const oldOverrideEnd = code.indexOf('// -----------------------------------------') + '// -----------------------------------------'.length;
  
  if (oldOverrideStart !== -1 && oldOverrideEnd !== -1) {
    const replacement = `
  const extracted = extractDynamicLabelClaim(productName, mono.testParameter, mono.productName, mono.labelClaim);
  let dynamicLabelClaim = extracted.labelClaim;
`;
    code = code.substring(0, oldOverrideStart) + replacement + code.substring(oldOverrideEnd);
  }
  
  fs.writeFileSync(file, code);
  console.log('dissolutionPharmaDatabase.ts updated');
} else {
  console.log('dissolutionPharmaDatabase.ts already updated');
}
