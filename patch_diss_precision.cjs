const fs = require('fs');

const file = 'src/services/dissolutionPharmaDatabase.ts';
let content = fs.readFileSync(file, 'utf-8');

// We need P and F. They are supplied in mono (DissolutionAMVDocumentData).
// Add them if missing in generating. 
// "const precMath = generatePrecisionData(mono.productName, strengthNum, nominalArea, 99.8, true);"
const precReplace = `
  const P = mono.potencyDecimal || 0.998;
  const F = mono.saltFactor || 1.0;
  
  const ctx = {
    targetPct: 99.8,
    LC_mg: strengthNum,
    A_std: ssMath.meanArea,
    C_std: cWorkingNominal,
    V_medium: vMedNum,
    DF: df,
    P: P,
    F: F,
    methodType: 'dissolution' as const
  };
  const precMath = generatePrecisionData(mono.productName, strengthNum, nominalArea, 99.8, true, ctx);
`;
content = content.replace(/const precMath = generatePrecisionData\(mono\.productName,\s*strengthNum,\s*nominalArea,\s*99\.8,\s*true\);/g, precReplace);

fs.writeFileSync(file, content);
