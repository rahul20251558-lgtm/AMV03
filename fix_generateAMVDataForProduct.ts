import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

const additional = `
export function getMethodDocumentNumber(baseDocNo: string, method: string, isReport: boolean = false): string {
  let clean = (baseDocNo || 'AMV-UNK-2604-101').replace(/\\/R$/i, '').replace(/-R$/i, '');
  clean = clean.replace(/-(ASSAY|RS|DIS|DISS|MLT)/gi, '');
  let tag = 'ASSAY';
  if (method === 'related_substances') tag = 'RS';
  else if (method === 'dissolution') tag = 'DIS';
  else if (method === 'microbial_limit_test') tag = 'MLT';
  let fullCode = clean;
  if (clean.startsWith('AMV-')) {
    fullCode = clean.replace('AMV-', \`AMV-\${tag}-\`);
  } else if (clean.startsWith('AMVER-')) {
    fullCode = clean.replace('AMVER-', \`AMVER-\${tag}-\`);
  } else if (clean.startsWith('WC/QC/AMV-')) {
    fullCode = clean.replace('WC/QC/AMV-', \`WC/QC/AMV-\${tag}-\`);
  } else if (clean.startsWith('WC/QC/AMV/')) {
    fullCode = clean.replace('WC/QC/AMV/', \`WC/QC/AMV-\${tag}/\`);
  } else {
    fullCode = \`\${clean}-\${tag}\`;
  }
  return isReport ? \`\${fullCode}/R\` : fullCode;
}

export function generateAMVDataForProduct(productName: string, overrides?: any): AMVDocumentData {
  const base = getBaseMonograph(productName);
  const blankField = "__________ [ENTER RAW DATA]";
  
  return {
    documentNo: overrides?.documentNo || blankField,
    reportNo: overrides?.reportNo || blankField,
    productName: productName,
    labelClaim: base.labelClaim,
    batchNo: overrides?.validationBatchNo || blankField,
    validationBatchNo: overrides?.validationBatchNo || blankField,
    standardLotNo: overrides?.standardLotNo || blankField,
    companyName: overrides?.companyName || blankField,
    reportDate: overrides?.reportDate || blankField,
    effectiveDate: overrides?.effectiveDate || blankField,
    protocolNo: overrides?.protocolNo || blankField,
    preparedDate: overrides?.preparedDate || blankField,
    reviewedDate: overrides?.reviewedDate || blankField,
    approvedDate: overrides?.approvedDate || blankField,
    
    testParameter: "Assay by HPLC",
    reference: base.reference,
    technique: "HPLC",
    detector: "UV",
    column: base.chromatographicConditions.column,
    mobilePhase: base.chromatographicConditions.mobilePhase,
    flowRate: base.chromatographicConditions.flowRate,
    detectionWavelength: base.chromatographicConditions.detectionWavelength,
    injectionVolume: base.chromatographicConditions.injectionVolume,
    columnTemperature: base.chromatographicConditions.columnTemperature,
    runTime: base.chromatographicConditions.runTime,
    diluent: base.chromatographicConditions.diluent,
    workingConcentration: base.chromatographicConditions.workingConcentration,
    approxRetentionTime: base.chromatographicConditions.approxRetentionTime,
    
    solutionPreparation: base.solutionPreparation,
    
    systemSuitability: { rows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    specificity: { rows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    linearity: { levels: [], regression: { correlationR: 0.999, rSquared: 0.999, slope: 1, yIntercept: 0, yInterceptBiasPercent: 0 }, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    accuracy: { rows: [], meanRecoveryAllLevels: 100, rsdAllLevels: 1, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    precision: { rows: [], analyst1Mean: 100, analyst1Sd: 1, analyst1Rsd: 1, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    intermediatePrecision: { rows: [], analyst2Mean: 100, analyst2Sd: 1, analyst2Rsd: 1, overallMean: 100, overallSd: 1, overallRsd: 1, meanDifference: 0, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    range: { statementProtocol: blankField, statementReport: blankField },
    robustness: { conditions: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    solutionStability: { timepoints: [], stdRsdLimit: 2, smpRsdLimit: 2, stdDiffLimit: 2, smpDiffLimit: 2, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    systemSuitabilityInitial: { rows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField }
  } as any;
}
\n`;

content = content + additional;
fs.writeFileSync('src/services/pharmaDatabase.ts', content);
