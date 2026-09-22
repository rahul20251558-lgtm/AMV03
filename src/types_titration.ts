import { SignOffPerson } from './types';

export interface TitrimetricConditions {
  mode: string; // e.g. "Direct titration" | "Back titration" | "Complexometric titration" | "Non-aqueous titration"
  titrant: string; // e.g. "1 N HCl VS" | "0.1 N NaOH VS" | "0.05 M Disodium Edetate VS"
  normalityOrMolarity: string; // e.g. "1 N" | "0.1 N" | "0.05 M"
  endpointDetection: string; // e.g. "Visual, using Methyl Red TS as indicator"
  indicator: string; // e.g. "Methyl Red TS (3 mL)"
  sampleTakenDescription: string; // e.g. "400 mg of Sodium Bicarbonate USP, dissolved in 100 mL of water with 3 mL of Methyl Red TS."
  blankDescription: string; // e.g. "100 mL of water with 3 mL of Methyl Red TS added."
  endpointColorTransition: string; // e.g. "persistent Yellow — Pink colour"
  analyticalNote: string; // e.g. "Sodium bicarbonate solutions liberate carbon dioxide on acidification; titrate immediately after dissolution and avoid vigorous shaking before the endpoint."
}

export interface TitrationSolutionPreparation {
  blank: string;
  standardSolution: string;
  sampleSolution: string;
}

export interface TitrationCalculationFormula {
  generalFormula: string; // "Result = [(V − B) × N × F × 100] / W"
  assayFormula: string; // "Assay (% of LA) = [(V − B) × N × F × 100] / W × (Average Weight / Label Claim)"
  definitions: { symbol: string; meaning: string }[];
  equivalencyFactorMg: number; // e.g. 84.01 mg/mEq
  equivalencyFactorUnit: string; // "mg/mEq" or "mg/mL"
}

export interface TitrationMaterialItem {
  srNo: number;
  name: string;
  type: string; // e.g. "Working Standard (potency assigned)", "Test sample", "Chemical", "Volumetric solution", "Purified Water", "Indicator solution"
  lotNo: string;
  grade?: string;
  make?: string;
  expiryDate?: string;
}

export interface TitrationVerificationParameter {
  srNo: number;
  parameter: string;
  acceptanceCriteria: string;
  verificationRequirement: string; // "—" in protocol; "Complies (...)" in report
  statusReport?: string;
}

export interface TitrationSystemSuitabilityRow {
  srNo: number;
  weightMg: number | string;
  buretteReadingMl: number | string;
}

export interface TitrationSystemSuitabilityData {
  rows: TitrationSystemSuitabilityRow[];
  meanWeightMg: number | string;
  meanReadingMl: number | string;
  sdReadingMl: number | string;
  rsdReadingMl: number | string; // NMT 2.0 %
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationLinearityLevel {
  levelPercent: number; // 50, 75, 100, 125, 150
  weightTakenMg: number;
  nominalConcentrationPpm?: number;
  preparationText: string;
  replicateReadings: number[];
  meanReadingMl: number;
}

export interface TitrationLinearityData {
  explanatoryText1: string;
  explanatoryText2: string;
  levels: TitrationLinearityLevel[];
  slope: number | string;
  intercept: number | string;
  rSquared: number | string; // > 0.995
  correlationCoefficientR: number | string;
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationRangeRow {
  srNo: number;
  sampleId: string;
  levelPercent: number; // 75 or 125
  buretteReadingMl: number | string;
}

export interface TitrationRangeData {
  explanatoryText: string;
  rows: TitrationRangeRow[];
  stats75: {
    mean: number | string;
    sd: number | string;
    rsd: number | string;
  };
  stats125: {
    mean: number | string;
    sd: number | string;
    rsd: number | string;
  };
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationPrecisionRow {
  srNo: number;
  sampleId: string;
  amountUsedMg: number | string;
  buretteReadingMl: number | string;
  contentPercentLA: number | string;
}

export interface TitrationPrecisionData {
  explanatoryText: string;
  rows: TitrationPrecisionRow[];
  meanContentPercent: number | string;
  sdContentPercent: number | string;
  rsdContentPercent: number | string; // NMT 2.0 %
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationIntermediatePrecisionRow {
  srNo: number;
  analyst1: {
    amountUsedMg: number | string;
    buretteReadingMl: number | string;
    contentPercentLA: number | string;
  };
  analyst2: {
    amountUsedMg: number | string;
    buretteReadingMl: number | string;
    contentPercentLA: number | string;
  };
}

export interface TitrationIntermediatePrecisionData {
  explanatoryText: string;
  rows: TitrationIntermediatePrecisionRow[];
  analyst1Stats: {
    mean: number | string;
    sd: number | string;
    rsd: number | string;
  };
  analyst2Stats: {
    mean: number | string;
    sd: number | string;
    rsd: number | string;
  };
  overallMean: number | string;
  overallRsd: number | string;
  diffBetweenMeans: number | string; // Absolute difference NMT 1.5%
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationAccuracyRow {
  srNo: number;
  sampleId: string;
  levelPercent: number; // 75, 100, 125
  spikedMg: number | string;
  buretteReadingMl: number | string;
  recoveredMg: number | string;
  recoveryPercent: number | string;
}

export interface TitrationAccuracyLevelStats {
  levelPercent: number;
  meanRecovery: number | string;
  sdRecovery: number | string;
  rsdRecovery: number | string;
}

export interface TitrationAccuracyData {
  explanatoryText: string;
  rows: TitrationAccuracyRow[];
  levelStats: TitrationAccuracyLevelStats[];
  overallMeanRecovery: number | string;
  overallRsdRecovery: number | string;
  acceptanceCriteria: string;
  conforms: boolean;
}

export interface TitrationSignOffs {
  preparedBy: SignOffPerson;
  checkedBy: SignOffPerson;
  reviewedBy: SignOffPerson;
  authorizedBy: SignOffPerson;
}

export interface TitrationReviewChecklist {
  rawRecordsReviewed: boolean;
  rawRecordsInitials: string;
  calcVerified: boolean;
  calcInitials: string;
  deviationRaised: boolean;
  deviationRefNo: string;
  annexuresPages: string;
}

export interface TitrationAbbreviation {
  abbreviation: string;
  fullForm: string;
}

export interface TitrationAMVDocumentData {
  companyName: string;
  companyAddress: string;
  documentTitle: string; // "ANALYTICAL METHOD VERIFICATION PROTOCOL (Assay by Titration)" or REPORT
  subBannerNotice: string; // "*** PROTOCOL — NOT AN EXECUTED REPORT ***" or "*** EXECUTED REPORT ***"
  protocolNo: string;
  reportNo: string;
  productName: string;
  labelClaim: string;
  testParameter: string;
  reference: string;
  protocolDate: string;
  reportDate: string;
  formatNo: string; // "WC/QC/01/08-F01"
  supersedes: string; // "Nil"
  batchNoUsed: string;
  standardLotNo: string;
  avgTabletWeightMg: number;
  targetNominalWeightMg: number;

  signOffs: TitrationSignOffs;

  objective: string;
  scope: string;

  referenceDetails: {
    reference: string;
    typeOfVerification: string;
    testToBeVerified: string;
    verificationTeam: {
      analyst1: string;
      analyst2: string;
      supervisor: string;
    };
    experimentalDetails: string;
  };

  methodSummary: {
    titrimetricConditions: TitrimetricConditions;
    solutionPreparation: TitrationSolutionPreparation;
    calculationFormula: TitrationCalculationFormula;
    materialsAndStandards: TitrationMaterialItem[];
  };

  verificationParameters: TitrationVerificationParameter[];

  systemSuitability: TitrationSystemSuitabilityData;
  linearityAndRange: {
    linearity: TitrationLinearityData;
    range: TitrationRangeData;
  };
  precision: TitrationPrecisionData;
  intermediatePrecision: TitrationIntermediatePrecisionData;
  accuracy: TitrationAccuracyData;

  overallConclusionProtocol: string;
  overallConclusionReport: string;

  reviewChecklist: TitrationReviewChecklist;
  abbreviations: TitrationAbbreviation[];
}
