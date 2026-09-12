const fs = require('fs');

const rsFile = 'src/services/rsPharmaDatabase.ts';
let rs = fs.readFileSync(rsFile, 'utf-8');

// Use PRNG
rs = rs.replace(/const rand = Math\.random;/g, 'const rand = createSeededRandom(seed.productName + seed.batchNoUsed + "RS");');

// Fix A_std and Precision
const rsPrecGen = `
  const P = seed.potencyDecimal || 1.0;
  const F = seed.saltFactor || 1.0;
  const A_std = ssMath.meanArea;
  
  const ctxPrec = {
    targetPct: 99.85,
    LC_mg: strengthNum,
    A_std: A_std,
    C_std: cWorkingNominal,
    C_smp: cWorkingNominal,
    RRF: 1.0,
    methodType: 'related_substances' as const
  };
  const precMath = generatePrecisionData(seed.productName, strengthNum, nominalArea, 99.85, false, ctxPrec);
`;
rs = rs.replace(/const precMath = generatePrecisionData\(seed\.productName,\s*strengthNum,\s*nominalArea,\s*99\.85\);/g, rsPrecGen);

fs.writeFileSync(rsFile, rs, 'utf-8');

const assayFile = 'src/services/pharmaDatabase.ts';
let assay = fs.readFileSync(assayFile, 'utf-8');

const assayPrecGen = `
  const P = seed.potencyDecimal || 1.0;
  const F = seed.saltFactor || 1.0;
  const A_std = ssMath.meanArea;
  
  const ctxPrec = {
    targetPct: 100,
    LC_mg: strengthNum,
    A_std: A_std,
    W_S: strengthNum,
    D_S: 100,
    D_T: 100,
    W_T: nominalWeight,
    AVG_WT: nominalWeight,
    P: P,
    F: F,
    methodType: 'assay' as const
  };
  const precMath = generatePrecisionData(runKey, nominalWeight, baseArea, 100, false, ctxPrec);
`;
assay = assay.replace(/const precMath = generatePrecisionData\(runKey,\s*nominalWeight,\s*baseArea,\s*100\);/g, assayPrecGen);

fs.writeFileSync(assayFile, assay, 'utf-8');

