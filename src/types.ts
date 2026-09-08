export type DocumentType = 'protocol' | 'report';
export type ThemeFormat = 'blue' | 'simple'; // 'blue' is Executive Blue (#1F4E79), 'simple' is Simple Format (No Color)
export type ValidationMethodType = 'assay' | 'related_substances' | 'dissolution';
export type FontFamilyType = 'Times New Roman' | 'Arial' | 'Calibri' | 'Segoe UI' | 'Cambria' | 'Georgia';
export type FontSizePt = 9 | 10 | 11 | 12 | 13 | 14 | 16;

export interface SignOffPerson {
  name: string;
  designation: string;
  date: string;
}

export interface SignOffGrid {
  preparedBy: SignOffPerson;
  reviewedBy: SignOffPerson;
  approvedBy: SignOffPerson;
}

export interface ChromatographicConditions {
  column: string;
  mobilePhase: string;
  flowRate: string;
  detectionWavelength: string;
  injectionVolume: string;
  columnTemperature: string;
  runTime: string;
  diluent: string;
  workingConcentration: string;
  approxRetentionTime: string;
  note: string;
}

export interface SolutionPreparation {
  standardSolution: string;
  sampleSolution: string;
}

export interface ChemicalRequirement {
  name: string;
  grade: string;
  make: string;
  batchNo: string;
}

export interface EquipmentRequirement {
  srNo: number;
  name: string;
  idNo: string;
  calibrationDate: string;
  dueDate: string;
}

export interface ValidationParameterSummary {
  srNo: number;
  parameter: string;
  acceptanceCriteria: string;
  verificationRequirement: string; // for protocol: "To be verified as per protocol criteria"
  resultStatus: string; // for report: calculated dynamic summary, e.g., "Tailing 1.15; %RSD 0.06 %; plates 3845 — Complies"
}

export interface SystemSuitabilityRow {
  injectionNo: number;
  peakArea: number;
  tailingFactor: number;
  theoreticalPlates: number;
}

export interface SystemSuitabilityData {
  injections: SystemSuitabilityRow[];
  meanArea: number;
  rsdArea: number;
  meanTailing: number;
  rsdTailing: number;
  meanPlates: number;
  rsdPlates: number;
  acceptanceTextProtocol: string;
  acceptanceTextReport: string;
}

export interface SpecificityRow {
  solution: string;
  retentionTime: string;
  interference: string;
}

export interface SpecificityData {
  rows: SpecificityRow[];
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface LinearityLevelRow {
  levelPercent: number;
  concentration: number; // µg/mL
  meanArea: number;
  percentOf100Response: number;
}

export interface LinearityRegression {
  correlationR: number;
  rSquared: number;
  slope: number;
  yIntercept: number;
  yInterceptBiasPercent: number;
}

export interface LinearityData {
  levels: LinearityLevelRow[];
  regression: LinearityRegression;
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface AccuracyRecoveryRow {
  levelPercent: number;
  expNo: number;
  amountAdded: number; // mg
  amountRecovered: number; // mg
  percentRecovery: number;
}

export interface AccuracyData {
  rows: AccuracyRecoveryRow[];
  meanRecoveryAllLevels: number;
  rsdAllLevels: number;
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface PrecisionRow {
  sampleNo: string;
  analyst1Assay: number;
  analyst2Assay: number;
  statisticalEvaluation: string;
}

export interface PrecisionData {
  rows: PrecisionRow[];
  analyst1Mean: number;
  analyst1Rsd: number;
  analyst1Sd: number;
  analyst2Mean: number;
  analyst2Rsd: number;
  analyst2Sd: number;
  cumulativeMean: number;
  cumulativeSd: number;
  cumulativeRsd: number;
  diffBetweenMeans: number;
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface RobustnessRow {
  conditionVaried: string;
  rsdPercent: number;
  tailingFactor: number;
  theoreticalPlates: number;
}

export interface RobustnessData {
  instructionParagraph?: string;
  rows: RobustnessRow[];
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface SolutionStabilityRow {
  timePoint: string;
  standardArea: number;
  sampleArea: number;
  diffPercent: string;
}

export interface SolutionStabilityData {
  rows: SolutionStabilityRow[];
  acceptanceTextProtocol: string;
  conclusionReport: string;
}

export interface ReviewChecklistItem {
  particulars: string;
  compliance: string;
}

export interface AbbreviationItem {
  abbreviation: string;
  expansion: string;
}

export interface RevisionHistoryItem {
  version: string;
  effectiveDate: string;
  reason: string;
  docNumber?: string;
}

export interface AMVDocumentData {
  companyName: string;
  companyAddress: string;
  documentNo: string;
  reportNo?: string;
  protocolDate?: string;
  reportDate?: string;
  productName: string;
  activeSubstance: string;
  labelClaim: string;
  testParameter: string;
  reference: string;
  batchNoUsed: string;
  effectiveDate: string;
  supersedes: string;

  signOffs: SignOffGrid;

  objective: string;
  scope: string;

  verificationDetails: {
    reference: string;
    typeOfVerification: string;
    testToBeVerified: string;
    verificationTeam: string;
    experimentalDetails: string;
  };

  chromatographicConditions: ChromatographicConditions;
  solutionPreparation: SolutionPreparation;
  calculationFormula: {
    assayFormula: string;
    contentFormula: string;
    notes: string[];
  };
  reagentsAndStandards: ChemicalRequirement[];
  equipment: EquipmentRequirement[];

  validationParameters: ValidationParameterSummary[];

  systemSuitability: SystemSuitabilityData;
  specificity: SpecificityData;
  linearity: LinearityData;
  accuracy: AccuracyData;
  precision: PrecisionData;
  robustness: RobustnessData;
  solutionStability: SolutionStabilityData;

  reviewChecklist: ReviewChecklistItem[];
  abbreviations: AbbreviationItem[];
  revisionHistory: RevisionHistoryItem[];
}

/* =========================================================================
   RELATED SUBSTANCES (RS) / ORGANIC IMPURITY PROTOCOL & REPORT TYPES
   (Based on Westcoast Pharmaceutical Works Ltd. 16-Section Monograph Format)
========================================================================= */

export interface RSApprovalPerson {
  designation: string;
  name: string;
  signature: string;
  date: string;
  dateProtocol?: string;
  dateReport?: string;
}

export interface RSApprovalTable {
  preparedBy: RSApprovalPerson;
  checkedBy: RSApprovalPerson;
  reviewedBy: RSApprovalPerson;
  authorisedBy: RSApprovalPerson;
}

export interface RSChromatographicConditions {
  instrumentDetector: string;
  column: string;
  carrierGasOrMobilePhase: string;
  injectionTempOrFlowRate: string;
  detectorTempOrWavelength: string;
  injectionVolume: string;
  splitRatio: string;
  ovenProgrammeOrGradient: string;
  totalRunTime: string;
  diluent: string;
  internalStandard: string;
  relativeRetention: string;
}

export interface RSOvenProgrammeRow {
  timeRange: string;
  temperature: string;
  comment: string;
}

export interface RSSolutionPreparation {
  internalStandard: string;
  testSolution: string;
  referenceSolution: string;
  systemSuitabilitySolution: string;
  blank: string;
  placeboSolution: string;
  handlingNote: string;
}

export interface RSMonographLimitItem {
  criterion: string;
  limit: string;
}

export interface RSRequirementItem {
  name: string;
  grade: string;
  make: string;
  batchNo: string;
}

export interface RSValidationParameterCriteria {
  srNo: string;
  parameter: string;
  acceptanceCriteria: string;
  resultRemark: string; // blank for protocol, filled with results and 'Complies' for report
}

export interface RSSystemSuitabilityRow {
  srNo: number;
  weightMg: number | string;
  peakArea: number | string;
  remark: string;
}

export interface RSSystemSuitabilityStats {
  meanArea: number;
  sdArea: number;
  rsdArea: number;
  tailingFactor: number;
  theoreticalPlates: number;
  resolution: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSSpecificityRow {
  solution: string;
  retentionTime: string;
  peakArea: string;
  interferenceObserved: string;
}

export interface RSLinearityLevelRow {
  levelName: string;
  nominalPpm: number;
  weightTakenMg: number | string;
  finalDilution: string;
  meanArea: number | string;
}

export interface RSLinearityRegression {
  rSquared: number;
  slope: number;
  yIntercept: number;
  sdYIntercepts: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSRangeRow {
  srNo: number;
  levelPpm: number;
  sampleId: string;
  peakArea: number | string;
}

export interface RSRangeLevelStat {
  levelPpm: number;
  mean: number;
  sd: number;
  rsd: number;
}

export interface RSPrecisionRow {
  srNo: number;
  sampleId: string;
  volumeUsed: string;
  peakArea: number | string;
  contentPercentLa: number | string;
}

export interface RSPrecisionStats {
  meanContent: number;
  sd: number;
  rsd: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSLodLoqConfirmationRow {
  srNo: number;
  level: string;
  concentrationPpm: number;
  peakArea: number | string;
  snRatio: number | string;
}

export interface RSLoqPrecisionRow {
  srNo: number;
  peakArea: number | string;
  contentPercentLa: number | string;
  remark: string;
}

export interface RSLoqStats {
  meanArea: number;
  sdArea: number;
  rsdArea: number;
  meanContent: number;
  rsdContent: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSIntermediatePrecisionRow {
  srNo: number;
  analyst1Volume: string;
  analyst1Area: number | string;
  analyst1Content: number | string;
  analyst2Volume: string;
  analyst2Area: number | string;
  analyst2Content: number | string;
}

export interface RSIntermediatePrecisionStats {
  analyst1Mean: number;
  analyst1Sd: number;
  analyst1Rsd: number;
  analyst2Mean: number;
  analyst2Sd: number;
  analyst2Rsd: number;
  cumulativeMean: number;
  cumulativeSd: number;
  cumulativeRsd: number;
  diffBetweenMeans: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSAccuracyRecoveryRow {
  srNo: number;
  levelPpm: number;
  standardSpikedMg: number | string;
  sampleArea: number | string;
  amountRecoveredMg: number | string;
  percentRecovery: number | string;
}

export interface RSAccuracyLevelStat {
  levelPpm: number;
  meanRecovery: number;
  sdRecovery: number;
  rsdRecovery: number;
}

export interface RSAccuracyStats {
  levelStats: RSAccuracyLevelStat[];
  overallMeanRecovery: number;
  overallRsd: number;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface RSCompletionRecordItem {
  particulars: string;
  details: string;
  signatureDate: string;
  detailsProtocol?: string;
  signatureDateProtocol?: string;
}

export interface RSAMVDocumentData {
  companyName: string;
  documentTitle: string; // e.g. "ANALYTICAL METHOD VALIDATION PROTOCOL" or "REPORT"
  subTitle: string; // e.g. "(Organic Impurity by Gas Chromatography)" or "(Related Substances by HPLC)"
  protocolNo: string;
  protocolDate: string;
  reportNo?: string;
  reportDate?: string;
  productName: string;
  labelClaim: string;
  testParameter: string;
  reference: string;
  batchNoUsed: string;

  // Sign-Off / Approval Table
  signOffs: RSApprovalTable;

  // 1. Objective & 2. Scope
  objective: string;
  scope: string;

  // 3. Reference and Validation Details
  referenceDetails: {
    reference: string;
    typeOfStudy: string;
    testToBeValidated: string;
    validationTeam: string;
    experimentalDetails: string;
  };

  // 4. Analytical Method Summary
  methodSummary: {
    chromatographicConditions: RSChromatographicConditions;
    ovenProgramme: RSOvenProgrammeRow[];
    solutionPreparation: RSSolutionPreparation;
    monographLimits: RSMonographLimitItem[];
    requirements: RSRequirementItem[];
  };

  // 5. Validation Parameters — Acceptance Criteria
  validationParameters: RSValidationParameterCriteria[];

  // 6. System Suitability
  systemSuitability: {
    injections: RSSystemSuitabilityRow[];
    stats: RSSystemSuitabilityStats;
  };

  // 7. Specificity
  specificity: {
    rows: RSSpecificityRow[];
    conclusionProtocol: string;
    conclusionReport: string;
  };

  // 8. Linearity and Range
  linearityAndRange: {
    linearityLevels: RSLinearityLevelRow[];
    regression: RSLinearityRegression;
    rangeRows: RSRangeRow[];
    rangeStats: RSRangeLevelStat[];
    rangeConclusionProtocol: string;
    rangeConclusionReport: string;
  };

  // 9. Precision (Repeatability)
  precision: {
    rows: RSPrecisionRow[];
    stats: RSPrecisionStats;
  };

  // 10. Limit of Detection and Limit of Quantitation
  lodLoq: {
    confirmationRows: RSLodLoqConfirmationRow[];
    loqPrecisionRows: RSLoqPrecisionRow[];
    loqStats: RSLoqStats;
    conclusionProtocol: string;
    conclusionReport: string;
  };

  // 11. Intermediate Precision
  intermediatePrecision: {
    rows: RSIntermediatePrecisionRow[];
    stats: RSIntermediatePrecisionStats;
  };

  // 12. Accuracy (Recovery)
  accuracy: {
    rows: RSAccuracyRecoveryRow[];
    stats: RSAccuracyStats;
  };

  // 13. Overall Conclusion
  overallConclusionProtocol: string;
  overallConclusionReport: string;

  // 14. Completion Record
  completionRecord: RSCompletionRecordItem[];

  // 15. Abbreviations
  abbreviations: AbbreviationItem[];

  // 16. Revision History
  revisionHistory: RevisionHistoryItem[];
}

// ==========================================
// DISSOLUTION AMV METHOD VERIFICATION TYPES
// ==========================================

export interface DissolutionChromatographicConditions {
  instrument: string;
  column: string;
  mobilePhase: string;
  modeOfElution: string;
  flowRate: string;
  columnTemperature: string;
  detectionWavelength: string;
  injectionVolume: string;
  diluent: string;
  determinationOfContent: string;
}

export interface DissolutionTestConditions {
  compliance: string;
  apparatus: string;
  paddleSpeed: string;
  medium: string;
  mediumTemperature: string;
  samplingTime: string;
  sampleTreatment: string;
  numberOfUnits: string;
}

export interface DissolutionSolutionPreparation {
  testSolution: string;
  standardSolution: string;
  blank: string;
  placeboSolution: string;
  precisionStandardSolution: string;
  precisionSampleSolution: string;
  linearitySolutions: string;
  handlingNote: string;
}

export interface DissolutionMonographLimit {
  criterion: string;
  limit: string;
  basisOfCalculation: string;
}

export interface DissolutionRequirementItem {
  name: string;
  grade: string;
  make: string;
  batchNo: string;
}

export interface DissolutionValidationParameterCriteria {
  srNo: string;
  parameter: string;
  acceptanceCriteria: string;
  executionStatusProtocol: string;
  executionStatusReport: string;
}

export interface DissolutionSystemSuitabilityRow {
  srNo: number;
  weightMg: number | string;
  peakArea: number | string;
  remark: string;
}

export interface DissolutionSystemSuitabilityStats {
  meanArea: number | string;
  sdArea: number | string;
  rsdArea: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionLinearityLevelRow {
  levelName: string;
  nominalPpm: number;
  weightMg: number | string;
  finalDilution: string;
  meanArea: number | string;
}

export interface DissolutionLinearityRegression {
  rSquared: number | string;
  slope: number | string;
  yIntercept: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionRangeRow {
  srNo: number;
  levelPpm: number;
  sampleId: string;
  peakArea: number | string;
}

export interface DissolutionRangeStats {
  mean75: number | string;
  sd75: number | string;
  rsd75: number | string;
  mean125: number | string;
  sd125: number | string;
  rsd125: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionPrecisionRow {
  srNo: number;
  sampleId: string;
  amountUsedMg: number | string;
  sampleArea: number | string;
  contentPercentLa: number | string;
}

export interface DissolutionPrecisionStats {
  meanContent: number | string;
  sdContent: number | string;
  rsdContent: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionIntermediatePrecisionRow {
  srNo: number;
  analyst1AmountMg: number | string;
  analyst1Area: number | string;
  analyst1PercentLa: number | string;
  analyst2AmountMg: number | string;
  analyst2Area: number | string;
  analyst2PercentLa: number | string;
}

export interface DissolutionIntermediatePrecisionStats {
  analyst1Mean: number | string;
  analyst1Rsd: number | string;
  analyst2Mean: number | string;
  analyst2Rsd: number | string;
  cumulativeRsd: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionAccuracyRow {
  srNo: number;
  levelPpm: number;
  spikedMg: number | string;
  sampleArea: number | string;
  amountRecoveredMg: number | string;
  percentRecovery: number | string;
}

export interface DissolutionAccuracyStats {
  meanRecovery75: number | string;
  meanRecovery100: number | string;
  meanRecovery125: number | string;
  overallRsd: number | string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionSpecificitySolutionRow {
  solutionName: string;
  retentionTime: string;
  peakArea: string | number;
  interferenceObserved: string;
}

export interface DissolutionSpecificityStressRow {
  condition: string;
  stressParameters: string;
  activeRtMin: string;
  degradantRtMin: string;
  activePeakArea: number | string;
  degradantPeakArea: number | string;
  degradationPercent: number | string;
  resolution: number | string;
  peakPurity: string;
  interference: string;
}

export interface DissolutionSpecificityData {
  solutionRows: DissolutionSpecificitySolutionRow[];
  stressRows: DissolutionSpecificityStressRow[];
  acceptanceTextProtocol: string;
  conclusionReport: string;
  degradationAssessment: string;
  degradantName?: string;
  degradantRt?: number;
  degradantRrt?: number;
  stressIntroParagraph?: string;
}

export interface DissolutionRobustnessRow {
  conditionVaried: string;
  retentionTimeMin: string;
  tailingFactor: number | string;
  theoreticalPlates: number | string;
  rsdPercent: number | string;
  remark: string;
}

export interface DissolutionRobustnessData {
  rows: DissolutionRobustnessRow[];
  acceptanceCriteria: string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionSolutionStabilityRow {
  timePoint: string;
  standardArea: number | string;
  standardDiffPercent: number | string;
  sampleArea: number | string;
  sampleDiffPercent: number | string;
  dissolvedPercent: number | string;
  remark: string;
}

export interface DissolutionSolutionStabilityData {
  rowsRoomTemp: DissolutionSolutionStabilityRow[];
  rowsRefrigerated: DissolutionSolutionStabilityRow[];
  acceptanceCriteria: string;
  conclusionProtocol: string;
  conclusionReport: string;
}

export interface DissolutionCompletionRecordItem {
  particulars: string;
  detailsProtocol: string;
  detailsReport: string;
  signatureDateProtocol: string;
  signatureDateReport: string;
}

export interface DissolutionAMVDocumentData {
  companyName: string;
  documentTitle: string; // "ANALYTICAL METHOD VERIFICATION PROTOCOL" or "REPORT"
  subTitle: string; // "(For DISSOLUTION Method)"
  protocolNo: string;
  protocolDate: string;
  reportNo: string;
  reportDate: string;
  productName: string;
  labelClaim: string;
  testParameter: string;
  reference: string;
  batchNoUsed: string;
  supersedes?: string;

  signOffs: RSApprovalTable;

  objective: string;
  scope: string;

  referenceDetails: {
    reference: string;
    typeOfStudy: string;
    testToBeVerified: string;
    verificationTeam: string;
    experimentalDetails: string;
  };

  methodSummary: {
    chromatographicConditions: DissolutionChromatographicConditions;
    dissolutionConditions: DissolutionTestConditions;
    solutionPreparation: DissolutionSolutionPreparation;
    monographLimits: DissolutionMonographLimit;
    requirements: DissolutionRequirementItem[];
  };

  validationParameters: DissolutionValidationParameterCriteria[];

  systemSuitability: {
    injections: DissolutionSystemSuitabilityRow[];
    stats: DissolutionSystemSuitabilityStats;
  };

  specificity: DissolutionSpecificityData;

  linearity: {
    levels: DissolutionLinearityLevelRow[];
    regression: DissolutionLinearityRegression;
  };

  range: {
    rows: DissolutionRangeRow[];
    stats: DissolutionRangeStats;
  };

  precision: {
    rows: DissolutionPrecisionRow[];
    stats: DissolutionPrecisionStats;
  };

  intermediatePrecision: {
    rows: DissolutionIntermediatePrecisionRow[];
    stats: DissolutionIntermediatePrecisionStats;
  };

  accuracy: {
    rows: DissolutionAccuracyRow[];
    stats: DissolutionAccuracyStats;
  };

  robustness: DissolutionRobustnessData;
  solutionStability: DissolutionSolutionStabilityData;

  overallConclusionProtocol: string;
  overallConclusionReport: string;

  completionRecord: DissolutionCompletionRecordItem[];
  abbreviations: AbbreviationItem[];
  revisionHistory: RevisionHistoryItem[];
}

