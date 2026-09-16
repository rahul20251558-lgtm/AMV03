import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

const replacement = `
  const blankField = "__________ [ENTER RAW DATA]";
  return {
    activeSubstance: cleaned,
    labelClaim: doseMatch ? \`\${doseValue} \${doseUnit} \${cleaned} per dosage unit\` : productName,
    reference: \`USP/BP Monograph for \${productName}, USP <621>, USP <1225>, ICH Q2(R2)\`,
    chromatographicConditions: {
      column: blankField,
      mobilePhase: blankField,
      flowRate: blankField,
      detectionWavelength: blankField,
      injectionVolume: blankField,
      columnTemperature: blankField,
      runTime: blankField,
      diluent: blankField,
      workingConcentration: blankField,
      approxRetentionTime: blankField,
      note: blankField
    },
    solutionPreparation: {
      standardSolution: blankField,
      sampleSolution: blankField
    },
    retentionTimeMin: 5.0, // Placeholder
    targetNominalWeight: nominalWeight,
    nominalArea: baseArea,
    workingConcNum: workingConc,
    flowRateNum: 1.0, // Placeholder
    columnTempNum: 30, // Placeholder
    mobilePhaseBufferPH: 4.0, // Placeholder
    reagents: ["Acetonitrile", "Milli-Q Water", blankField]
  };
}
`;

content = content.replace(
  /const flowRates = \[1, 1\.2, 1\.5, 0\.8\];[\s\S]*\}\n/m,
  replacement
);

fs.writeFileSync('src/services/pharmaDatabase.ts', content);
