import fs from 'fs';
let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

const replacement = `
  const blankField = "__________ [ENTER RAW DATA]";
  return {
    productName,
    labelClaim: \`Each unit contains \${cleanDrug} \${strengthNum} \${unit}\`,
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV/Vis Detection',
    reference: \`BP / USP Monograph — \${productName}; ICH Q2(R2); USP <1226>\`,
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: blankField,
    carrierGasOrMobilePhase: blankField,
    injectionTempOrFlowRate: blankField,
    detectorTempOrWavelength: blankField,
    injectionVolume: blankField,
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: blankField,
    totalRunTime: blankField,
    diluent: blankField,
    internalStandard: 'N/A (External Standard)',
    relativeRetention: blankField,
    nominalPpm: 100, // Placeholder to allow engine to run
    activeRtMin: 5.0, // Placeholder
    impurityName: blankField,
    impurityRtMin: 6.0, // Placeholder
    nominalArea: 1000000,
    ovenProgramme: [],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: blankField,
      referenceSolution: blankField,
      systemSuitabilitySolution: blankField,
      blank: blankField,
      placeboSolution: blankField,
      handlingNote: blankField,
    },
    monographLimits: [
      { criterion: blankField, limit: blankField },
      { criterion: 'Total impurities', limit: blankField },
      { criterion: 'Disregard limit', limit: blankField },
    ],
    requirements: [
      { name: \`\${cleanDrug} Reference Standard\`, grade: 'Characterised WS', make: 'USP / In-house', batchNo: blankField },
      { name: blankField, grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: blankField },
    ],
  };
}
`;

content = content.replace(
  /const isGC = false;[\s\S]*\}\n/m,
  replacement
);

fs.writeFileSync('src/services/rsPharmaDatabase.ts', content);
