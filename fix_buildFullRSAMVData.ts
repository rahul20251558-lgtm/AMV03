import fs from 'fs';
let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

const additional = `
export function buildFullRSAMVData(productName: string, options?: any): any {
  const seed = getRSMonograph(productName);
  const blankField = "__________ [ENTER RAW DATA]";
  return {
    documentNo: options?.protocolNo || blankField,
    reportNo: options?.reportNo || blankField,
    productName: productName,
    labelClaim: seed.labelClaim,
    batchNo: options?.batchNo || blankField,
    validationBatchNo: options?.batchNo || blankField,
    standardLotNo: options?.standardLotNo || blankField,
    companyName: options?.companyName || blankField,
    reportDate: options?.reportDate || blankField,
    effectiveDate: options?.effectiveDate || blankField,
    protocolNo: options?.protocolNo || blankField,
    preparedDate: options?.preparedDate || blankField,
    reviewedDate: options?.reviewedDate || blankField,
    approvedDate: options?.approvedDate || blankField,

    testParameter: seed.testParameter,
    reference: seed.reference,
    technique: seed.technique,
    detector: seed.detector,
    column: seed.column,
    mobilePhase: seed.carrierGasOrMobilePhase,
    flowRate: seed.injectionTempOrFlowRate,
    detectionWavelength: seed.detectorTempOrWavelength,
    injectionVolume: seed.injectionVolume,
    columnTemperature: seed.ovenProgrammeOrGradient,
    runTime: seed.totalRunTime,
    diluent: seed.diluent,
    workingConcentration: blankField,
    approxRetentionTime: blankField,

    solutionPreparation: seed.solutionPreparation,
    monographLimits: seed.monographLimits,
    requirements: seed.requirements,

    systemSuitability: { rows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    specificity: { rows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    linearityAndRange: { linearityLevels: [], loqRow: {}, lodRow: {}, regression: { correlationR: 0.999, rSquared: 0.999, slope: 1, yIntercept: 0, yInterceptBiasPercent: 0, residualSumOfSquares: 0 }, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    accuracy: { levels: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    precision: { repeatibilityRows: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    intermediatePrecision: { repeatibilityRows: [], analyst1TotalMean: 0, analyst2TotalMean: 0, difference: 0, acceptanceTextProtocol: blankField, conclusionReport: blankField },
    robustness: { conditions: [], acceptanceTextProtocol: blankField, conclusionReport: blankField },
    solutionStability: { timepoints: [], acceptanceTextProtocol: blankField, conclusionReport: blankField }
  } as any;
}
`;

content = content + additional;
fs.writeFileSync('src/services/rsPharmaDatabase.ts', content);
