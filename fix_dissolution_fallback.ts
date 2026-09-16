import fs from 'fs';
let content = fs.readFileSync('src/services/dissolutionPharmaDatabase.ts', 'utf-8');

const replacement = `
  const blankField = "__________ [ENTER RAW DATA]";
  return {
    productName,
    labelClaim: \`Each dosage unit contains \${cleanDrug} \${strengthNum} \${unit}\`,
    testParameter: 'Dissolution by HPLC with UV/Vis Detection',
    reference: \`USP Monograph for \${productName}, USP <711>, USP <621>, ICH Q2(R2)\`,
    apparatus: blankField,
    speed: blankField,
    medium: blankField,
    volume: blankField,
    temperature: blankField,
    time: blankField,
    qValue: blankField,
    sinkers: blankField,
    filter: blankField,
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
      sampleSolution: blankField,
      placeboSolution: blankField,
      blankSolution: blankField,
    },
    retentionTimeMin: 5.0, // Placeholder
    targetNominalWeight: 25,
    nominalArea: 1000000,
    workingConcNum: 0.05,
    flowRateNum: 1.0,
    columnTempNum: 25,
    reagents: ["Acetonitrile", "Milli-Q Water", blankField],
    equipmentIds: {
      hplc: blankField,
      column: blankField,
      balance: blankField,
      phMeter: blankField,
      sonicator: blankField,
      dissolutionTester: blankField
    }
  };
}
`;

content = content.replace(
  /const apparatusList = \[[\s\S]*\}\n/m,
  replacement
);

fs.writeFileSync('src/services/dissolutionPharmaDatabase.ts', content);
