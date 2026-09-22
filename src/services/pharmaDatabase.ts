import { AMVDocumentData, ChemicalRequirement, EquipmentRequirement } from '../types';
import { recalculateAMVData } from './mathUtils';
import { postProcessSanitizeDocument } from './postGenerationSanitizer';
import {
  generateSystemSuitabilityInjections,
  generateLinearityData,
  generatePrecisionData,
  generateAccuracyRecoveryData,
  generateContentUniformityData,
  parseProductStrength,
  createSeededRandom,
  extractDynamicLabelClaim,
} from './pharmaMathEngine';

export interface UniqueCodes {
  companyName?: string;
  companyAddress?: string;
  documentNo: string;
  reportNo?: string;
  validationBatchNo: string;
  standardLotNo: string;
  referenceStandardLot: string;
  effectiveDate: string;
  reportDate?: string;
  supersedes: string;
  preparedDate: string;
  reviewedDate: string;
  approvedDate: string;
}

export interface MonographDefinition {
  activeSubstance: string;
  labelClaim: string;
  reference: string;
  chromatographicConditions: {
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
  };
  solutionPreparation: {
    standardSolution: string;
    sampleSolution: string;
  };
  retentionTimeMin: number;
  targetNominalWeight: number;
  nominalArea: number;
  workingConcNum: number;
  flowRateNum: number;
  columnTempNum: number;
  mobilePhaseBufferPH?: number;
  reagents?: string[];
}



function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}


export function generateUniqueValidationCodes(productName: string): UniqueCodes & { batchNo: string } {
  const hash = hashString(productName);
  
  const pad = (n: number) => n.toString().padStart(3, '0');
  
  const docBase = Math.abs(hash) % 10000;
  const documentNo = `AMV-UNK-2604-${pad(docBase)}`;
  
  const batchBase = Math.abs(hash) % 1000;
  const validationBatchNo = `B${pad(batchBase)}`;
  const standardLotNo = `RS${pad(batchBase)}`;
  const referenceStandardLot = `REF-${pad(batchBase)}`;
  
  return {
    documentNo,
    validationBatchNo,
    batchNo: validationBatchNo,
    standardLotNo,
    referenceStandardLot,
    effectiveDate: '01-Jan-2026',
    supersedes: 'Nil',
    preparedDate: '01-Jan-2026',
    reviewedDate: '01-Jan-2026',
    approvedDate: '01-Jan-2026'
  };
}

export function getBaseMonograph

(productName: string): MonographDefinition {
  const norm = productName.toLowerCase();
  const doseMatch = productName.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|µg)/i);
  const explicitDose = doseMatch ? parseFloat(doseMatch[1]) : null;
  const explicitUnit = doseMatch ? doseMatch[2] : "mg";
  if (norm.includes("acarbose")) {
    const dose = explicitDose ?? 100;
    return {
      activeSubstance: "Acarbose",
      labelClaim: `${dose} ${explicitUnit} Acarbose per tablet`,
      reference: "USP Monograph for Acarbose Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "Amino L8 column (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.01 M Potassium Dihydrogen Phosphate Buffer pH 6.0 (75:25 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 210 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "35 \xB0C",
        runTime: "12.0 min",
        diluent: "Mobile Phase",
        workingConcentration: "0.5 mg/mL",
        approxRetentionTime: "6.5 min",
        note: "Dissolve 1.36 g KH2PO4 in 1000 mL water, adjust pH to 6.0 \xB1 0.05 with 0.1 M KOH."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 50.0 mg of Acarbose RS into a 100 mL volumetric flask, dissolve and dilute to volume with diluent.",
        sampleSolution: "Weigh 20 tablets, determine average weight, finely powder. Transfer powder equivalent to 50.0 mg Acarbose into a 100 mL volumetric flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter through 0.45 \xB5m filter."
      },
      retentionTimeMin: 6.51,
      targetNominalWeight: 50,
      nominalArea: 2541230,
      workingConcNum: 0.5,
      flowRateNum: 1,
      columnTempNum: 35,
      mobilePhaseBufferPH: 6,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Potassium Hydroxide", "Milli-Q Water"]
    };
  }
  if (norm.includes("paracetamol") || norm.includes("acetaminophen")) {
    return {
      activeSubstance: "Paracetamol",
      labelClaim: "500 mg Paracetamol per tablet",
      reference: "USP Monograph for Acetaminophen Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 column (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Methanol : Water (25:75 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 243 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "25 \xB0C",
        runTime: "8.0 min",
        diluent: "Methanol : Water (1:3 v/v)",
        workingConcentration: "0.01 mg/mL (10 \xB5g/mL)",
        approxRetentionTime: "4.2 min",
        note: "Degas mobile phase by vacuum sonication for 15 minutes before use."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 25.0 mg of Paracetamol RS into a 100 mL volumetric flask, dissolve in 20 mL methanol and dilute to volume with water. Dilute 4.0 mL to 100 mL with mobile phase.",
        sampleSolution: "Weigh 20 tablets, determine average weight, grind to fine powder. Transfer powder equivalent to 25.0 mg Paracetamol into 100 mL volumetric flask, sonicate with 50 mL diluent for 15 min, dilute to mark, filter. Dilute 4.0 mL to 100 mL with mobile phase."
      },
      retentionTimeMin: 4.22,
      targetNominalWeight: 25,
      nominalArea: 1852400,
      workingConcNum: 0.01,
      flowRateNum: 1,
      columnTempNum: 25,
      reagents: ["Methanol", "HPLC Grade Water", "Milli-Q Water"]
    };
  }
  if (norm.includes("metformin")) {
    return {
      activeSubstance: "Metformin Hydrochloride",
      labelClaim: "500 mg Metformin Hydrochloride per tablet",
      reference: "USP Monograph for Metformin HCl Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L76 Cation-Exchange / HILIC column (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.5% w/v Sodium Dihydrogen Phosphate with 0.1% SDS pH 3.8 (50:50 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 218 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "10.0 min",
        diluent: "Water : Acetonitrile (90:10 v/v)",
        workingConcentration: "0.01 mg/mL (10 \xB5g/mL)",
        approxRetentionTime: "5.1 min",
        note: "Prepare 0.5% NaH2PO4 buffer with 0.1% SDS, adjust pH to 3.8 \xB1 0.05 using phosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 50.0 mg of Metformin HCl RS into a 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 2.0 mL to 100 mL.",
        sampleSolution: "Weigh 20 tablets, crush to powder. Transfer powder equivalent to 50.0 mg Metformin HCl into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Further dilute 2.0 mL to 100 mL."
      },
      retentionTimeMin: 5.12,
      targetNominalWeight: 50,
      nominalArea: 2145800,
      workingConcNum: 0.01,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3.8,
      reagents: ["Acetonitrile", "Sodium Dihydrogen Phosphate", "Sodium Dodecyl Sulfate", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("atorvastatin")) {
    return {
      activeSubstance: "Atorvastatin Calcium",
      labelClaim: "20 mg Atorvastatin per tablet",
      reference: "USP Monograph for Atorvastatin Calcium Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Ammonium Acetate buffer pH 4.5 : Tetrahydrofuran (67:21:12 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 246 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "35 \xB0C",
        runTime: "15.0 min",
        diluent: "Methanol : Water (80:20 v/v)",
        workingConcentration: "0.02 mg/mL (20 \xB5g/mL)",
        approxRetentionTime: "7.8 min",
        note: "Dissolve 3.85 g ammonium acetate in 1000 mL water, adjust to pH 4.5 with glacial acetic acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg of Atorvastatin RS into 100 mL flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL.",
        sampleSolution: "Weigh 20 tablets, finely powder. Transfer powder equivalent to 20.0 mg Atorvastatin into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 7.84,
      targetNominalWeight: 20,
      nominalArea: 1982300,
      workingConcNum: 0.02,
      flowRateNum: 1.2,
      columnTempNum: 35,
      mobilePhaseBufferPH: 4.5,
      reagents: ["Acetonitrile", "Ammonium Acetate", "Glacial Acetic Acid", "Tetrahydrofuran", "Methanol", "Milli-Q Water"]
    };
  }
  if (norm.includes("pantoprazole")) {
    return {
      activeSubstance: "Pantoprazole Sodium",
      labelClaim: "40 mg Pantoprazole per gastro-resistant tablet",
      reference: "BP/USP Monograph for Pantoprazole Gastro-resistant Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.01 M Phosphate Buffer pH 7.0 (35:65 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 285 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "10.0 min",
        diluent: "0.01 M Sodium Hydroxide in Water",
        workingConcentration: "0.04 mg/mL (40 \xB5g/mL)",
        approxRetentionTime: "5.6 min",
        note: "Prepare 0.01 M Disodium hydrogen phosphate buffer, adjust to pH 7.0 with dilute phosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh 40.0 mg of Pantoprazole Sodium RS into a 100 mL flask, dissolve in 0.01 M NaOH and dilute. Dilute 5.0 mL to 50 mL.",
        sampleSolution: "Weigh 20 tablets, powder finely. Transfer powder equivalent to 40.0 mg Pantoprazole into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 5.62,
      targetNominalWeight: 40,
      nominalArea: 2310500,
      workingConcNum: 0.04,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 7,
      reagents: ["Acetonitrile", "Disodium Hydrogen Phosphate", "Sodium Hydroxide", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("ciprofloxacin")) {
    return {
      activeSubstance: "Ciprofloxacin Hydrochloride",
      labelClaim: "500 mg Ciprofloxacin per film-coated tablet",
      reference: "USP Monograph for Ciprofloxacin Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.025 M Phosphoric Acid with Triethylamine pH 3.0 (13:87 v/v)",
        flowRate: "1.5 mL/min",
        detectionWavelength: "UV at 278 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "12.0 min",
        diluent: "Mobile Phase",
        workingConcentration: "0.05 mg/mL (50 \xB5g/mL)",
        approxRetentionTime: "6.8 min",
        note: "Prepare 0.025 M phosphoric acid solution, add 2 mL triethylamine per liter, adjust to pH 3.0 \xB1 0.05 with H3PO4."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 50.0 mg of Ciprofloxacin HCl RS into a 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL with diluent.",
        sampleSolution: "Weigh 20 tablets, determine average weight, powder finely. Transfer powder equivalent to 50.0 mg Ciprofloxacin into 100 mL flask, sonicate with 70 mL diluent for 20 min, dilute to mark, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 6.84,
      targetNominalWeight: 50,
      nominalArea: 2824100,
      workingConcNum: 0.05,
      flowRateNum: 1.5,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3,
      reagents: ["Acetonitrile", "Orthophosphoric Acid", "Triethylamine", "Milli-Q Water"]
    };
  }
  if (norm.includes("ibuprofen")) {
    return {
      activeSubstance: "Ibuprofen",
      labelClaim: "400 mg Ibuprofen per tablet",
      reference: "USP Monograph for Ibuprofen Tablets, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.01 M Chloroacetic Acid Buffer pH 3.0 (60:40 v/v)",
        flowRate: "1.5 mL/min",
        detectionWavelength: "UV at 254 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "9.0 min",
        diluent: "Acetonitrile : Water (60:40 v/v)",
        workingConcentration: "0.2 mg/mL (200 \xB5g/mL)",
        approxRetentionTime: "4.5 min",
        note: "Dissolve 0.95 g chloroacetic acid in 1000 mL water, adjust to pH 3.0 with ammonium hydroxide."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 40.0 mg of Ibuprofen RS into a 100 mL volumetric flask, dissolve in 50 mL diluent, sonicate 10 min, dilute to mark. Dilute 5.0 mL to 10 mL.",
        sampleSolution: "Weigh 20 tablets, grind to fine powder. Transfer powder equivalent to 40.0 mg Ibuprofen into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 10 mL."
      },
      retentionTimeMin: 4.48,
      targetNominalWeight: 40,
      nominalArea: 3120000,
      workingConcNum: 0.2,
      flowRateNum: 1.5,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3,
      reagents: ["Acetonitrile", "Chloroacetic Acid", "Ammonium Hydroxide", "Milli-Q Water"]
    };
  }
  if (norm.includes("amoxicillin")) {
    return {
      activeSubstance: "Amoxicillin Trihydrate",
      labelClaim: "500 mg Amoxicillin per capsule",
      reference: "USP Monograph for Amoxicillin Capsules, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Potassium Dihydrogen Phosphate Buffer pH 5.0 (4:96 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 230 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "25 \xB0C",
        runTime: "10.0 min",
        diluent: "0.05 M Phosphate Buffer pH 5.0",
        workingConcentration: "1.2 mg/mL",
        approxRetentionTime: "5.2 min",
        note: "Prepare 0.05 M KH2PO4 buffer, adjust pH to 5.0 \xB1 0.05 using dilute potassium hydroxide."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 60.0 mg of Amoxicillin Trihydrate RS into a 50 mL volumetric flask, dissolve and dilute with diluent.",
        sampleSolution: "Empty 20 capsules, determine average fill weight. Transfer powder equivalent to 60.0 mg Amoxicillin into 50 mL flask, add 35 mL diluent, sonicate 15 min, dilute to volume, filter through 0.45 \xB5m filter."
      },
      retentionTimeMin: 5.18,
      targetNominalWeight: 60,
      nominalArea: 1745e3,
      workingConcNum: 1.2,
      flowRateNum: 1.2,
      columnTempNum: 25,
      mobilePhaseBufferPH: 5,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Potassium Hydroxide", "Milli-Q Water"]
    };
  }
  if (norm.includes("omeprazole")) {
    return {
      activeSubstance: "Omeprazole",
      labelClaim: "20 mg Omeprazole per delayed-release capsule",
      reference: "USP Monograph for Omeprazole Delayed-Release Capsules, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L7 C8 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.01 M Disodium Hydrogen Phosphate Buffer pH 7.6 (25:75 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 280 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "12.0 min",
        diluent: "0.01 M Sodium Hydroxide in Water : Acetonitrile (80:20 v/v)",
        workingConcentration: "0.04 mg/mL (40 \xB5g/mL)",
        approxRetentionTime: "7.2 min",
        note: "Prepare 0.01 M Na2HPO4 buffer, adjust to pH 7.6 \xB1 0.05 with dilute phosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg of Omeprazole RS into 100 mL flask, dissolve in 20 mL ACN and dilute with diluent. Dilute 5.0 mL to 25 mL.",
        sampleSolution: "Crush pellets from 20 capsules. Transfer powder equivalent to 20.0 mg Omeprazole into 100 mL flask, add 20 mL ACN and 60 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 25 mL."
      },
      retentionTimeMin: 7.22,
      targetNominalWeight: 20,
      nominalArea: 2080000,
      workingConcNum: 0.04,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 7.6,
      reagents: ["Acetonitrile", "Disodium Hydrogen Phosphate", "Sodium Hydroxide", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("amlodipine")) {
    return {
      activeSubstance: "Amlodipine Besylate",
      labelClaim: "5 mg Amlodipine (as besylate) per tablet",
      reference: "USP Monograph for Amlodipine Besylate Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Methanol : Acetonitrile : 0.03 M Triethylamine Buffer pH 3.0 (35:15:50 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 237 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "14.0 min",
        diluent: "Mobile Phase",
        workingConcentration: "0.02 mg/mL (20 \xB5g/mL)",
        approxRetentionTime: "8.5 min",
        note: "Mix 7.0 mL triethylamine in 1000 mL water, adjust to pH 3.0 with phosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 20.0 mg of Amlodipine Besylate RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL.",
        sampleSolution: "Weigh 20 tablets, crush to powder. Transfer powder equivalent to 20.0 mg Amlodipine into 100 mL flask, add 70 mL diluent, sonicate 25 min, dilute to volume, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 8.46,
      targetNominalWeight: 20,
      nominalArea: 1689200,
      workingConcNum: 0.02,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3,
      reagents: ["Methanol", "Acetonitrile", "Triethylamine", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("azithromycin")) {
    return {
      activeSubstance: "Azithromycin Dihydrate",
      labelClaim: "500 mg Azithromycin per tablet",
      reference: "USP Monograph for Azithromycin Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Dipotassium Phosphate Buffer pH 8.2 (60:40 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 215 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "50 \xB0C",
        runTime: "15.0 min",
        diluent: "Acetonitrile : Water (50:50 v/v)",
        workingConcentration: "0.5 mg/mL (500 \xB5g/mL)",
        approxRetentionTime: "9.4 min",
        note: "Maintain column heater at 50 \xB0C for optimal peak shape and plate efficiency."
      },
      solutionPreparation: {
        standardSolution: "Weigh 50.0 mg of Azithromycin RS into 100 mL volumetric flask, dissolve and dilute with diluent.",
        sampleSolution: "Weigh 20 tablets, powder. Transfer powder equivalent to 50.0 mg Azithromycin into 100 mL flask, add 70 mL diluent, sonicate 25 min, dilute to volume, filter."
      },
      retentionTimeMin: 9.35,
      targetNominalWeight: 50,
      nominalArea: 1923e3,
      workingConcNum: 0.5,
      flowRateNum: 1.2,
      columnTempNum: 50,
      mobilePhaseBufferPH: 8.2,
      reagents: ["Acetonitrile", "Dipotassium Hydrogen Phosphate", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("losartan")) {
    return {
      activeSubstance: "Losartan Potassium",
      labelClaim: "50 mg Losartan Potassium per tablet",
      reference: "USP Monograph for Losartan Potassium Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.1% v/v Phosphoric Acid in Water (40:60 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 250 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "25 \xB0C",
        runTime: "8.0 min",
        diluent: "Acetonitrile : Water (50:50 v/v)",
        workingConcentration: "0.05 mg/mL (50 \xB5g/mL)",
        approxRetentionTime: "4.8 min",
        note: "Mobile phase is isocratic 40% ACN with 0.1% H3PO4 aqueous solution."
      },
      solutionPreparation: {
        standardSolution: "Weigh 25.0 mg of Losartan Potassium RS into 100 mL flask, dissolve and dilute with diluent. Dilute 5.0 mL to 25 mL.",
        sampleSolution: "Weigh 20 tablets, crush to powder. Transfer powder equivalent to 25.0 mg Losartan into 100 mL flask, sonicate 20 min with 70 mL diluent, dilute to mark, filter. Dilute 5.0 mL to 25 mL."
      },
      retentionTimeMin: 4.82,
      targetNominalWeight: 25,
      nominalArea: 2450300,
      workingConcNum: 0.05,
      flowRateNum: 1,
      columnTempNum: 25,
      reagents: ["Acetonitrile", "Orthophosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("telmisartan")) {
    return {
      activeSubstance: "Telmisartan",
      labelClaim: "40 mg Telmisartan per tablet",
      reference: "USP Monograph for Telmisartan Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.02 M Potassium Dihydrogen Phosphate Buffer pH 3.0 (70:30 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 298 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "35 \xB0C",
        runTime: "10.0 min",
        diluent: "Methanol : 0.05 M Sodium Hydroxide (80:20 v/v)",
        workingConcentration: "0.04 mg/mL (40 \xB5g/mL)",
        approxRetentionTime: "5.9 min",
        note: "Telmisartan is practically insoluble in neutral water; use methanolic alkaline diluent."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg of Telmisartan RS into 100 mL flask, dissolve in 50 mL diluent, sonicate 15 min, dilute to mark. Dilute 5.0 mL to 25 mL with mobile phase.",
        sampleSolution: "Weigh 20 tablets, finely powder. Transfer powder equivalent to 20.0 mg Telmisartan into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 25 mL with mobile phase."
      },
      retentionTimeMin: 5.92,
      targetNominalWeight: 20,
      nominalArea: 276e4,
      workingConcNum: 0.04,
      flowRateNum: 1,
      columnTempNum: 35,
      mobilePhaseBufferPH: 3,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Methanol", "Sodium Hydroxide", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("levofloxacin")) {
    return {
      activeSubstance: "Levofloxacin Hemihydrate",
      labelClaim: "500 mg Levofloxacin per tablet",
      reference: "USP Monograph for Levofloxacin Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.1% v/v Trifluoroacetic Acid in Water (20:80 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 294 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "35 \xB0C",
        runTime: "11.0 min",
        diluent: "Water : Acetonitrile (80:20 v/v)",
        workingConcentration: "0.1 mg/mL (100 \xB5g/mL)",
        approxRetentionTime: "6.1 min",
        note: "Degas TFA mobile phase daily to avoid baseline drift at 294 nm."
      },
      solutionPreparation: {
        standardSolution: "Weigh 50.0 mg of Levofloxacin RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 25 mL.",
        sampleSolution: "Weigh 20 tablets, crush to fine powder. Transfer powder equivalent to 50.0 mg Levofloxacin into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 25 mL."
      },
      retentionTimeMin: 6.14,
      targetNominalWeight: 50,
      nominalArea: 2984e3,
      workingConcNum: 0.1,
      flowRateNum: 1.2,
      columnTempNum: 35,
      reagents: ["Acetonitrile", "Trifluoroacetic Acid (TFA)", "Milli-Q Water"]
    };
  }
  if (norm.includes("cetirizine")) {
    return {
      activeSubstance: "Cetirizine Hydrochloride",
      labelClaim: "10 mg Cetirizine HCl per tablet",
      reference: "BP/USP Monograph for Cetirizine Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Potassium Dihydrogen Phosphate Buffer pH 6.0 (40:60 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 230 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "25 \xB0C",
        runTime: "10.0 min",
        diluent: "Acetonitrile : Water (40:60 v/v)",
        workingConcentration: "0.02 mg/mL (20 \xB5g/mL)",
        approxRetentionTime: "6.7 min",
        note: "Adjust phosphate buffer pH to 6.0 with 0.1 M potassium hydroxide."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg of Cetirizine HCl RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL.",
        sampleSolution: "Weigh 20 tablets, finely powder. Transfer powder equivalent to 20.0 mg Cetirizine HCl into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 6.72,
      targetNominalWeight: 20,
      nominalArea: 1845600,
      workingConcNum: 0.02,
      flowRateNum: 1,
      columnTempNum: 25,
      mobilePhaseBufferPH: 6,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Potassium Hydroxide", "Milli-Q Water"]
    };
  }
  if (norm.includes("diclofenac")) {
    return {
      activeSubstance: "Diclofenac Sodium",
      labelClaim: "50 mg Diclofenac Sodium per enteric-coated tablet",
      reference: "USP Monograph for Diclofenac Sodium Delayed-Release Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Methanol : 0.01 M Phosphate Buffer pH 2.5 (70:30 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 254 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "12.0 min",
        diluent: "Methanol : Water (70:30 v/v)",
        workingConcentration: "0.05 mg/mL (50 \xB5g/mL)",
        approxRetentionTime: "7.5 min",
        note: "Adjust phosphate buffer to pH 2.5 \xB1 0.05 using phosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh 25.0 mg of Diclofenac Sodium RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 25 mL.",
        sampleSolution: "Weigh 20 enteric-coated tablets, finely powder. Transfer powder equivalent to 25.0 mg Diclofenac Sodium into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter. Dilute 5.0 mL to 25 mL."
      },
      retentionTimeMin: 7.54,
      targetNominalWeight: 25,
      nominalArea: 3310200,
      workingConcNum: 0.05,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 2.5,
      reagents: ["Methanol", "Potassium Dihydrogen Phosphate", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("rosuvastatin")) {
    const dose = explicitDose ?? 20;
    const is10mg = dose <= 10;
    const nominalWeight2 = is10mg ? 10 : dose <= 20 ? 20 : dose;
    const workingConcNum = is10mg ? 0.01 : dose <= 20 ? 0.02 : 0.04;
    const workingConcPpm = Math.round(workingConcNum * 1e3);
    const calculatedNominalArea = Math.round(1945e3 * (workingConcNum / 0.02));
    return {
      activeSubstance: "Rosuvastatin Calcium",
      labelClaim: `${dose} ${explicitUnit} Rosuvastatin per film-coated tablet`,
      reference: "USP Monograph for Rosuvastatin Calcium Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Ammonium Acetate buffer pH 4.0 : THF (30:60:10 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 242 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "35 \xB0C",
        runTime: "14.0 min",
        diluent: "Acetonitrile : Water (50:50 v/v)",
        workingConcentration: `${workingConcNum} mg/mL (${workingConcPpm} \xB5g/mL)`,
        approxRetentionTime: "8.1 min",
        note: "Prepare 0.05 M ammonium acetate buffer adjusted to pH 4.0 with glacial acetic acid."
      },
      solutionPreparation: {
        standardSolution: `Weigh accurately ${nominalWeight2.toFixed(1)} mg of Rosuvastatin Calcium RS into a 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL.`,
        sampleSolution: `Weigh 20 tablets, crush to powder. Transfer powder equivalent to ${nominalWeight2.toFixed(1)} mg Rosuvastatin into a 100 mL volumetric flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter. Dilute 5.0 mL to 50 mL.`
      },
      retentionTimeMin: 8.12,
      targetNominalWeight: nominalWeight2,
      nominalArea: calculatedNominalArea,
      workingConcNum,
      flowRateNum: 1.2,
      columnTempNum: 35,
      mobilePhaseBufferPH: 4,
      reagents: ["Acetonitrile", "Ammonium Acetate", "Glacial Acetic Acid", "Tetrahydrofuran", "Milli-Q Water"]
    };
  }
  if (norm.includes("montelukast")) {
    return {
      activeSubstance: "Montelukast Sodium",
      labelClaim: "10 mg Montelukast (as sodium salt) per film-coated tablet",
      reference: "USP Monograph for Montelukast Sodium Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L11 Phenyl-Hexyl (4.6 mm x 150 mm, 3.5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.02 M Potassium Dihydrogen Phosphate Buffer pH 3.7 (60:40 v/v)",
        flowRate: "1.2 mL/min",
        detectionWavelength: "UV at 238 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "40 \xB0C",
        runTime: "12.0 min",
        diluent: "Methanol : Water (80:20 v/v)",
        workingConcentration: "0.04 mg/mL (40 \xB5g/mL)",
        approxRetentionTime: "6.2 min",
        note: "Adjust phosphate buffer pH to 3.7 with dilute orthophosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 20.0 mg Montelukast Sodium RS into 100 mL flask, dissolve in 20 mL methanol, dilute to mark with diluent. Dilute 5.0 mL to 25 mL.",
        sampleSolution: "Weigh 20 tablets, finely crush. Transfer powder equivalent to 20.0 mg Montelukast into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter. Dilute 5.0 mL to 25 mL."
      },
      retentionTimeMin: 6.24,
      targetNominalWeight: 20,
      nominalArea: 2150400,
      workingConcNum: 0.04,
      flowRateNum: 1.2,
      columnTempNum: 40,
      mobilePhaseBufferPH: 3.7,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Methanol", "Orthophosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("clopidogrel")) {
    return {
      activeSubstance: "Clopidogrel Bisulfate",
      labelClaim: "75 mg Clopidogrel (as bisulfate) per tablet",
      reference: "USP Monograph for Clopidogrel Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L57 Chiral AGP or USP L1 C18 (4.6 mm x 150 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Potassium Phosphate Buffer pH 2.5 with 0.1% TEA (75:25 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 220 nm",
        injectionVolume: "10 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "14.0 min",
        diluent: "Methanol : Water (75:25 v/v)",
        workingConcentration: "0.075 mg/mL (75 \xB5g/mL)",
        approxRetentionTime: "7.4 min",
        note: "Adjust buffer pH to 2.5 with dilute phosphoric acid; maintain column temperature at 30 \xB0C."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 25.0 mg Clopidogrel Bisulfate RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 3.0 mL to 10 mL.",
        sampleSolution: "Weigh 20 tablets, powder finely. Transfer powder equivalent to 75.0 mg Clopidogrel into 200 mL flask, add 140 mL diluent, sonicate 25 min, dilute to volume, filter. Dilute 4.0 mL to 20 mL."
      },
      retentionTimeMin: 7.42,
      targetNominalWeight: 25,
      nominalArea: 268e4,
      workingConcNum: 0.075,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 2.5,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Triethylamine", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("escitalopram")) {
    return {
      activeSubstance: "Escitalopram Oxalate",
      labelClaim: "10 mg Escitalopram (as oxalate) per film-coated tablet",
      reference: "USP Monograph for Escitalopram Tablets, USP <621>, Ph. Eur. Monograph 2768, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.05 M Potassium Dihydrogen Phosphate Buffer pH 3.0 with Triethylamine (35:65 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 238 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "12.0 min",
        diluent: "Mobile Phase",
        workingConcentration: "0.02 mg/mL (20 \xB5g/mL)",
        approxRetentionTime: "5.8 min",
        note: "Dissolve 6.8 g KH2PO4 in 1000 mL water, add 2 mL triethylamine, adjust pH to 3.0 with H3PO4."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg Escitalopram Oxalate RS into 100 mL flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL.",
        sampleSolution: "Weigh 20 tablets, grind to fine powder. Transfer powder equivalent to 20.0 mg Escitalopram into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter. Dilute 5.0 mL to 50 mL."
      },
      retentionTimeMin: 5.82,
      targetNominalWeight: 20,
      nominalArea: 1850300,
      workingConcNum: 0.02,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3,
      reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Triethylamine", "Phosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("gabapentin")) {
    return {
      activeSubstance: "Gabapentin",
      labelClaim: "300 mg Gabapentin per capsule",
      reference: "USP Monograph for Gabapentin Capsules, USP <621>, USP <1225>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Methanol : 0.01 M Monobasic Potassium Phosphate Buffer pH 6.2 (10:90 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 210 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "25 \xB0C",
        runTime: "10.0 min",
        diluent: "Mobile Phase",
        workingConcentration: "1.5 mg/mL",
        approxRetentionTime: "5.2 min",
        note: "Prepare 0.01 M KH2PO4 buffer, adjust pH to 6.2 \xB1 0.05 using dilute potassium hydroxide."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 75.0 mg Gabapentin RS into a 50 mL volumetric flask, dissolve and dilute with diluent.",
        sampleSolution: "Empty 20 capsules, determine average fill weight. Transfer powder equivalent to 75.0 mg Gabapentin into 50 mL flask, add 35 mL diluent, sonicate 15 min, dilute to volume, filter through 0.45 \xB5m nylon membrane."
      },
      retentionTimeMin: 5.24,
      targetNominalWeight: 75,
      nominalArea: 164e4,
      workingConcNum: 1.5,
      flowRateNum: 1,
      columnTempNum: 25,
      mobilePhaseBufferPH: 6.2,
      reagents: ["Methanol", "Potassium Dihydrogen Phosphate", "Potassium Hydroxide", "Milli-Q Water"]
    };
  }
  if (norm.includes("glimepiride")) {
    return {
      activeSubstance: "Glimepiride",
      labelClaim: "2 mg Glimepiride per tablet",
      reference: "USP Monograph for Glimepiride Tablets, USP <621>, ICH Q2(R2)",
      chromatographicConditions: {
        column: "USP L1 C18 (4.6 mm x 250 mm, 5 \xB5m)",
        mobilePhase: "Acetonitrile : 0.01 M Ammonium Phosphate Buffer pH 3.0 (50:50 v/v)",
        flowRate: "1.0 mL/min",
        detectionWavelength: "UV at 228 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "30 \xB0C",
        runTime: "14.0 min",
        diluent: "Acetonitrile : Water (80:20 v/v)",
        workingConcentration: "0.02 mg/mL (20 \xB5g/mL)",
        approxRetentionTime: "8.6 min",
        note: "Adjust 0.01 M ammonium phosphate to pH 3.0 with 85% orthophosphoric acid."
      },
      solutionPreparation: {
        standardSolution: "Weigh 20.0 mg Glimepiride RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 2.0 mL to 20 mL.",
        sampleSolution: "Weigh 20 tablets, crush to powder. Transfer powder equivalent to 2.0 mg Glimepiride into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter."
      },
      retentionTimeMin: 8.62,
      targetNominalWeight: 20,
      nominalArea: 1720.00,
      workingConcNum: 0.02,
      flowRateNum: 1,
      columnTempNum: 30,
      mobilePhaseBufferPH: 3,
      reagents: ["Acetonitrile", "Ammonium Dihydrogen Phosphate", "Orthophosphoric Acid", "Milli-Q Water"]
    };
  }
  if (norm.includes("tibolone")) {
    return {
      activeSubstance: "Tibolone",
      labelClaim: "Each tablet contains Tibolone BP 2.5 mg",
      reference: "BP Monograph for Tibolone Tablets, BP Appendix III D, ICH Q2(R2)",
      chromatographicConditions: {
        column: "Hypersil ODS C18 (4.6 mm x 100 mm, 5 \xB5m)",
        mobilePhase: "Methanol : Water (77:23 v/v)",
        flowRate: "0.5 mL/min",
        detectionWavelength: "UV at 205 nm",
        injectionVolume: "20 \xB5L",
        columnTemperature: "40 \xB0C",
        runTime: "12.0 min",
        diluent: "Methanol : Water (77:23 v/v)",
        workingConcentration: "0.025 mg/mL (25 \xB5g/mL)",
        approxRetentionTime: "6.5 min",
        note: "Low wavelength detection at 205 nm requires high purity HPLC grade methanol and thoroughly degassed mobile phase."
      },
      solutionPreparation: {
        standardSolution: "Weigh accurately 25.0 mg Tibolone RS into 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 2.0 mL to 20 mL.",
        sampleSolution: "Weigh 20 tablets, determine average weight, powder finely. Transfer powder equivalent to 2.5 mg Tibolone into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter through 0.45 \xB5m PTFE."
      },
      retentionTimeMin: 6.52,
      targetNominalWeight: 25,
      nominalArea: 189e4,
      workingConcNum: 0.025,
      flowRateNum: 0.5,
      columnTempNum: 40,
      reagents: ["Methanol R2", "Milli-Q Water"]
    };
  }
  const hash = hashString(productName);
  const cleaned = productName.replace(/tablets?|capsules?|injections?|gastro-resistant|delayed-release|\d+\s*mg|\d+\s*g/gi, '').trim() || "Active Pharmaceutical Ingredient";
  const doseValue = explicitDose ?? 50;
  const doseUnit = explicitUnit ?? "mg";
  const rtSeed = 3.8 + hash % 60 / 10;
  const wavelengthList = [215, 220, 225, 230, 238, 245, 254, 260, 275, 280, 290, 310];
  const wavelength = wavelengthList[hash % wavelengthList.length];
  
  const blankField = "__________ [ENTER RAW DATA]";
  return {
    activeSubstance: cleaned,
    labelClaim: doseMatch ? `${doseValue} ${doseUnit} ${cleaned} per dosage unit` : productName,
    reference: `USP/BP Monograph for ${productName}, USP <621>, USP <1225>, ICH Q2(R2)`,
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
    targetNominalWeight: 50,
    nominalArea: 189e4,
    workingConcNum: 0.05,
    flowRateNum: 1.0, // Placeholder
    columnTempNum: 30, // Placeholder
    mobilePhaseBufferPH: 4.0, // Placeholder
    reagents: ["Acetonitrile", "Milli-Q Water", blankField]
  };
}

export function getMethodDocumentNumber(baseDocNo: string, method: string, isReport: boolean = false): string {
  let clean = (baseDocNo || 'AMV-UNK-2604-101').replace(/\/R$/i, '').replace(/-R$/i, '');
  clean = clean.replace(/-(ASSAY|RS|DIS|DISS|MLT|TITR)/gi, '');
  let tag = 'ASSAY';
  if (method === 'related_substances') tag = 'RS';
  else if (method === 'dissolution') tag = 'DIS';
  else if (method === 'microbial_limit_test') tag = 'MLT';
  else if (method === 'titration') tag = 'TITR';
  let fullCode = clean;
  if (clean.startsWith('AMV-')) {
    fullCode = clean.replace('AMV-', `AMV-${tag}-`);
  } else if (clean.startsWith('AMVER-')) {
    fullCode = clean.replace('AMVER-', `AMVER-${tag}-`);
  } else if (clean.startsWith('WC/QC/AMV-')) {
    fullCode = clean.replace('WC/QC/AMV-', `WC/QC/AMV-${tag}-`);
  } else if (clean.startsWith('WC/QC/AMV/')) {
    fullCode = clean.replace('WC/QC/AMV/', `WC/QC/AMV-${tag}/`);
  } else {
    fullCode = `${clean}-${tag}`;
  }
  return isReport ? `${fullCode}/R` : fullCode;
}

export function generateAMVDataForProduct(productName: string, overrides?: any): AMVDocumentData {
  const base = getBaseMonograph(productName);
  const assayScope = overrides?.assayScope || 'assay_and_cu';
  const isCU = assayScope === 'assay_and_cu';

  const strengthParsed = parseProductStrength(productName);
  const strengthMg = strengthParsed.strengthNum > 0 ? strengthParsed.strengthNum : (base.targetNominalWeight || 10);
  const nominalArea = base.nominalArea || 2000000;
  const avgTabletWt = base.targetNominalWeight && base.targetNominalWeight > strengthMg ? base.targetNominalWeight : 150;

  const docNo = overrides?.documentNo || 'WC/QC/AMV/0316';
  const reportNo = overrides?.reportNo || `${docNo}/R`;
  const batchNo = overrides?.validationBatchNo || overrides?.batchNo || 'TB2501';
  const companyName = overrides?.companyName || 'WESTCOAST PHARMACEUTICAL WORKS LTD.';
  const companyAddress = overrides?.companyAddress || 'Plot No. 1105, Phase-III, G.I.D.C., Chhatral, Dist. Gandhinagar - 382 729, Gujarat, India';
  const effectiveDate = overrides?.effectiveDate || overrides?.reportDate || '20-Apr-2026';
  const reportDate = overrides?.reportDate || effectiveDate;
  const supersedes = overrides?.supersedes || 'Nil (New Document)';

  // SST
  const sstGen = generateSystemSuitabilityInjections(
    productName,
    nominalArea,
    base.targetNominalWeight || strengthMg,
    5,
    base.retentionTimeMin || 4.8
  );
  const sstInjections = sstGen.injections.map((inj) => ({
    injectionNo: `Inj. ${inj.srNo}`,
    peakArea: inj.peakArea,
    tailingFactor: inj.tailingFactor,
    theoreticalPlates: inj.theoreticalPlates,
  }));

  // Specificity
  const specificityRows = [
    { solution: 'Blank (Diluent)', retentionTime: 'Not detected', interference: 'Nil (No peak detected)' },
    { solution: 'Placebo Matrix', retentionTime: 'Not detected', interference: 'Nil (No interference at active RT)' },
    { solution: 'Reference Standard Solution', retentionTime: `${base.retentionTimeMin || 4.8} min`, interference: 'Principal peak observed; no interfering co-eluting peaks' },
    { solution: 'Assay Sample Solution (Composite)', retentionTime: `${base.retentionTimeMin || 4.8} min`, interference: 'Complies (Peak purity angle < Purity threshold; no co-elution)' },
  ];
  if (isCU) {
    specificityRows.push({
      solution: 'Content Uniformity Sample (Single Unit)',
      retentionTime: `${base.retentionTimeMin || 4.8} min`,
      interference: 'Complies (Single-unit active peak verified; spectral purity passed)',
    });
  }

  // Linearity
  const workingPpm = base.workingConcNum ? base.workingConcNum * 1000 : 100;
  const linGen = generateLinearityData(productName, workingPpm, nominalArea, [50, 75, 100, 125, 150]);
  const linLevels = linGen.levels.map((lvl) => ({
    levelPercent: lvl.nominalPercent,
    concentration: lvl.concentrationPpm,
    meanArea: lvl.peakArea,
    percentOf100Response: Number(((lvl.peakArea / (linGen.levels[2]?.peakArea || 1)) * 100).toFixed(2)),
  }));

  // Accuracy
  const accGen = generateAccuracyRecoveryData(productName, strengthMg, [50, 100, 150], nominalArea);
  const accRows = accGen.levels.flatMap((lvl) =>
    lvl.replicates.map((rep) => ({
      levelPercent: lvl.levelPercent,
      expNo: `Prep ${rep.prepNo}`,
      amountAdded: rep.amountAddedMg,
      amountRecovered: rep.amountRecoveredMg,
      percentRecovery: rep.percentRecovery,
    }))
  );

  // Precision (Assay Composite Repeatability & Intermediate Precision)
  const precGen = generatePrecisionData(productName, strengthMg, nominalArea, 99.85);
  const precRows = precGen.analyst1.rows.map((r, i) => ({
    sampleNo: `Sample Preparation ${r.determinationNo}`,
    analyst1Assay: r.percentAssayOrDissolved,
    analyst2Assay: precGen.analyst2.rows[i]?.percentAssayOrDissolved || r.percentAssayOrDissolved,
    statisticalEvaluation: 'Complies',
  }));

  // Content Uniformity (USP <905> / BP Appendix XII C)
  let cuData = undefined;
  if (isCU) {
    const cuGen = generateContentUniformityData(productName, strengthMg, nominalArea, avgTabletWt);
    cuData = {
      units: cuGen.units,
      meanAssayPercent: cuGen.meanAssayPercent,
      sdAssayPercent: cuGen.sdAssayPercent,
      rsdAssayPercent: cuGen.rsdAssayPercent,
      kConstant: cuGen.kConstant,
      referenceValueM: cuGen.referenceValueM,
      acceptanceValueAV: cuGen.acceptanceValueAV,
      maxAllowedAV: cuGen.maxAllowedAV,
      acceptanceTextProtocol: cuGen.acceptanceTextProtocol,
      conclusionReport: cuGen.conclusionReport,
    };
  }

  // Robustness
  const robRows = [
    { conditionVaried: 'Flow rate: -0.1 mL/min', rsdPercent: 0.42, tailingFactor: 1.14, theoreticalPlates: 4890 },
    { conditionVaried: 'Flow rate: +0.1 mL/min', rsdPercent: 0.48, tailingFactor: 1.11, theoreticalPlates: 4810 },
    { conditionVaried: 'Column Temp: -3 °C', rsdPercent: 0.38, tailingFactor: 1.12, theoreticalPlates: 4860 },
    { conditionVaried: 'Column Temp: +3 °C', rsdPercent: 0.45, tailingFactor: 1.13, theoreticalPlates: 4840 },
    { conditionVaried: 'Mobile Phase Buffer pH: -0.2', rsdPercent: 0.51, tailingFactor: 1.15, theoreticalPlates: 4790 },
    { conditionVaried: 'Mobile Phase Buffer pH: +0.2', rsdPercent: 0.49, tailingFactor: 1.12, theoreticalPlates: 4830 },
  ];

  // Solution Stability
  const stabRows = [
    { timePoint: 'Initial (0 Hour)', standardArea: nominalArea, sampleArea: Math.round(nominalArea * 0.998), diffPercent: '0.00 %' },
    { timePoint: '6 Hours (Room Temp / 25°C)', standardArea: Math.round(nominalArea * 1.002), sampleArea: Math.round(nominalArea * 0.997), diffPercent: '0.20 %' },
    { timePoint: '12 Hours (Room Temp / 25°C)', standardArea: Math.round(nominalArea * 0.996), sampleArea: Math.round(nominalArea * 0.994), diffPercent: '0.40 %' },
    { timePoint: '24 Hours (Room Temp / 25°C)', standardArea: Math.round(nominalArea * 0.993), sampleArea: Math.round(nominalArea * 0.991), diffPercent: '0.70 %' },
    { timePoint: '24 Hours (Refrigerated 2-8°C)', standardArea: Math.round(nominalArea * 0.998), sampleArea: Math.round(nominalArea * 0.997), diffPercent: '0.10 %' },
  ];

  const rawDoc: AMVDocumentData = {
    companyName,
    companyAddress,
    documentNo: docNo,
    reportNo,
    protocolDate: effectiveDate,
    reportDate,
    productName,
    activeSubstance: base.activeSubstance,
    labelClaim: base.labelClaim,
    testParameter: isCU ? 'For Assay and Content of Uniformity Method by HPLC' : 'Assay by HPLC',
    reference: isCU ? `${base.reference}, USP <905> Uniformity of Dosage Units, BP Appendix XII C, USP <621>, ICH Q2(R2)` : `${base.reference}, USP <621>, ICH Q2(R2)`,
    batchNoUsed: batchNo,
    effectiveDate,
    supersedes,
    assayScope,

    signOffs: {
      preparedBy: { name: 'Mr. Pradeep Sharma', designation: 'Officer - Quality Control', date: effectiveDate },
      checkedBy: { name: 'Ms. Sneha Patel', designation: 'Executive - Quality Control', date: effectiveDate },
      reviewedBy: { name: 'Mr. Rajesh Kumar', designation: 'Manager - Quality Assurance', date: effectiveDate },
      approvedBy: { name: 'Dr. Ashok V. Shah', designation: 'General Manager - QA & QC', date: effectiveDate },
    },

    objective: isCU
      ? `To validate the High-Performance Liquid Chromatographic (HPLC) procedure for the simultaneous quantitative determination of finished product composite powder Assay and individual dosage unit Content of Uniformity (Uniformity of Dosage Units per USP <905> / BP Appendix XII C) in ${productName}.`
      : `To establish documented evidence that the analytical test procedure for Assay of ${productName} by HPLC is suitable for its intended purpose and consistently yields results meeting predetermined acceptance criteria.`,

    scope: isCU
      ? `This document applies to the analytical method validation / verification of the HPLC test method for composite Assay and single-tablet Content of Uniformity of ${productName} manufactured at ${companyName}.`
      : `This document applies to the analytical method validation / verification for Assay of ${productName} by HPLC at ${companyName}, ${companyAddress}.`,

    verificationDetails: {
      reference: isCU ? `${base.reference}, USP <905>, BP App. XII C` : base.reference,
      typeOfVerification: 'Method Validation / Verification study per ICH Q2(R2) & USP <1225>',
      testToBeVerified: isCU ? 'For Assay and Content of Uniformity Method by HPLC' : 'Assay by HPLC',
      verificationTeam: 'Quality Control Analytical Validation Group',
      experimentalDetails: `Analysis executed on qualified HPLC system utilizing ${base.chromatographicConditions.column} with detection at ${base.chromatographicConditions.detectionWavelength}.`,
    },

    chromatographicConditions: base.chromatographicConditions,

    solutionPreparation: {
      standardSolution: base.solutionPreparation.standardSolution,
      sampleSolution: base.solutionPreparation.sampleSolution,
      cuSampleSolution: isCU
        ? `Take 10 tablets individually. Transfer each individual tablet into a separate 100 mL volumetric flask. Add 70 mL of diluent, sonicate for 20 minutes with intermittent shaking to disintegrate completely. Allow to cool to room temperature, dilute to volume with diluent and mix well. Filter an aliquot through 0.45 µm membrane filter, discarding the first 3 mL of filtrate. Dilute appropriately if required to match the working concentration (${base.chromatographicConditions.workingConcentration}). Inject each of the 10 dosage unit solutions.`
        : undefined,
    },

    calculationFormula: {
      assayFormula: 'Assay (%) = (AT / AS) × (WS / DS) × (DT / WT) × (AVG_WT / LC) × P × 100',
      contentFormula: 'Content (mg/unit) = (Assay (%) × LC) / 100',
      cuFormula: isCU ? 'Individual Unit Assay (%) = (A_unit / AS) × (WS / DS) × (V_unit / 1) × (1 / LC) × P × 100' : undefined,
      cuAcceptanceValueFormula: isCU ? 'Acceptance Value (AV) = |M - X̄| + k · s (where k = 2.4 for n = 10, L1 Limit ≤ 15.0)' : undefined,
      notes: [
        'AT = Peak area of analyte in sample preparation',
        'AS = Mean peak area of analyte in standard preparation',
        'WS = Weight of Reference Standard taken (mg)',
        'DS = Dilution volume of Reference Standard (mL)',
        'WT = Weight of sample powder taken (mg)',
        'DT = Dilution volume of sample (mL)',
        'AVG_WT = Average weight of 20 units (mg)',
        'LC = Declared label claim (mg/unit)',
        'P = Potency of Reference Standard on as-is basis (decimal)',
        ...(isCU
          ? [
              'A_unit = Peak area of active substance in individual dosage unit preparation',
              'V_unit = Dilution volume of single dosage unit (mL)',
              'X̄ = Mean of individual contents (% of label claim)',
              's = Sample standard deviation of individual contents',
              'k = Acceptability constant (k = 2.4 for n = 10 units)',
              'M = Reference value: if 98.5% ≤ X̄ ≤ 101.5%, M = X̄; if X̄ < 98.5%, M = 98.5%; if X̄ > 101.5%, M = 101.5%',
              'L1 = Maximum allowed acceptance value (L1 = 15.0)',
            ]
          : []),
      ],
    },

    reagentsAndStandards: [
      { chemicalName: `${base.activeSubstance} Reference Standard / Working Standard`, grade: 'Primary / Working Standard', make: 'In-House / Compendial', lotNumber: overrides?.standardLotNo || 'RS-STD-2026-08', expiryDate: '31-Dec-2027' },
      { chemicalName: 'Methanol', grade: 'HPLC Grade', make: 'Merck / Fisher Scientific', lotNumber: 'ME26B04', expiryDate: '31-Jan-2028' },
      { chemicalName: 'Acetonitrile', grade: 'HPLC Grade', make: 'Merck / Rankem', lotNumber: 'AC26C11', expiryDate: '28-Feb-2028' },
      { chemicalName: 'Purified High-Purity Water', grade: 'Milli-Q (Resistivity ≥ 18.2 MΩ·cm)', make: 'Millipore In-House', lotNumber: 'Freshly Prepared', expiryDate: '24 Hours' },
      { chemicalName: 'Potassium Dihydrogen Phosphate', grade: 'AR Grade', make: 'Sigma-Aldrich / Qualigens', lotNumber: 'KH26A09', expiryDate: '30-Jun-2028' },
      { chemicalName: '0.45 µm PTFE / Nylon Membrane Filters', grade: 'Syringe Filters (0.45 µm)', make: 'Millipore / Whatman', lotNumber: 'FL26D01', expiryDate: '31-Dec-2029' },
    ],

    equipment: [
      { equipmentName: 'High Performance Liquid Chromatograph (HPLC)', makeModel: 'Waters Alliance / Shimadzu Prominence', equipmentId: 'EQ/QC/HPLC-012', calibrationDueDate: '15-May-2026' },
      { equipmentName: 'Analytical Micro Balance', makeModel: 'Mettler Toledo XPE205 (d = 0.01 mg)', equipmentId: 'EQ/QC/BAL-004', calibrationDueDate: '28-Apr-2026' },
      { equipmentName: 'Ultrasonic Bath / Sonicator', makeModel: 'Elmasonic P60H', equipmentId: 'EQ/QC/SON-008', calibrationDueDate: '10-Jul-2026' },
      { equipmentName: 'Digital pH Meter', makeModel: 'Thermo Scientific Orion Star A211', equipmentId: 'EQ/QC/PH-003', calibrationDueDate: '02-May-2026' },
    ],

    validationParameters: [
      { parameter: 'System Suitability', acceptanceCriteria: '% RSD of peak area NMT 2.0% (n=5), Tailing factor NMT 2.0, Theoretical plates NLT 2000', result: 'Complies (%RSD = 0.42%, Tailing = 1.12, Plates = 4850)' },
      { parameter: 'Specificity', acceptanceCriteria: 'No interference at retention time of active peak from blank, placebo or degradation products. Peak purity passed.', result: 'Complies (No interference observed at active RT)' },
      { parameter: 'Linearity', acceptanceCriteria: 'Correlation coefficient (r) ≥ 0.999, r² ≥ 0.998 across 50% to 150% of nominal concentration; y-intercept bias NMT ±2.0%', result: 'Complies (r = 0.9998, r² = 0.9996, y-intercept bias = 0.35%)' },
      { parameter: 'Accuracy (Recovery)', acceptanceCriteria: 'Mean recovery at 50%, 100%, and 150% shall be 98.0% to 102.0%; Overall % RSD NMT 2.0%', result: 'Complies (Overall mean recovery = 99.85%, %RSD = 0.65%)' },
      { parameter: 'Method Precision', acceptanceCriteria: '% RSD of 6 assay determinations shall be NMT 2.0%', result: 'Complies (%RSD = 0.58%, Mean = 99.82%)' },
      { parameter: 'Intermediate Precision', acceptanceCriteria: 'Cumulative % RSD (n=12) NMT 2.0%; Absolute difference between means NMT 1.5%', result: 'Complies (Cum. %RSD = 0.62%, Mean Diff = 0.24%)' },
      ...(isCU
        ? [
            {
              parameter: 'Content of Uniformity (USP <905> / BP App. XII C)',
              acceptanceCriteria: 'Acceptance Value (AV) NMT 15.0 (L1) for 10 individual units; no individual unit < 85.0% or > 115.0%',
              result: `Complies (AV = ${cuData?.acceptanceValueAV || 3.24} ≤ 15.0; Mean = ${cuData?.meanAssayPercent || 99.85}%; %RSD = ${cuData?.rsdAssayPercent || 1.35}%)`,
            },
          ]
        : []),
      { parameter: 'Robustness', acceptanceCriteria: 'System suitability criteria met under deliberate variations in flow rate, column temp, and mobile phase pH', result: 'Complies (SST criteria met under all varied conditions)' },
      { parameter: 'Solution Stability', acceptanceCriteria: '% Difference in peak area of standard and sample solutions over 24 hours shall be NMT 2.0%', result: 'Complies (Standard and sample solutions stable up to 24 hours at RT and 2-8°C)' },
    ],

    systemSuitability: {
      injections: sstInjections,
      meanArea: sstGen.meanArea,
      sdArea: sstGen.sdArea,
      rsdArea: sstGen.rsdArea,
      meanPlates: sstGen.meanPlates,
      meanTailing: sstGen.meanTailing,
      acceptanceTextProtocol: '% RSD of peak area for 5 replicate injections shall be NMT 2.0%. Tailing factor shall be NMT 2.0. Theoretical plates shall be NLT 2000.',
      conclusionReport: `The % RSD of peak area for 5 replicate injections of standard preparation is ${sstGen.rsdArea} % (Criteria: NMT 2.0 %). Mean tailing factor is ${sstGen.meanTailing} (Criteria: NMT 2.0) and theoretical plates are ${sstGen.meanPlates} (Criteria: NLT 2000). System suitability criteria are complied with.`,
    },

    specificity: {
      rows: specificityRows,
      acceptanceTextProtocol: 'No interference shall be observed at the retention time of the principal active substance peak from blank (diluent) and placebo matrix solutions.',
      conclusionReport: 'No interfering peaks were detected at the retention time of the active substance in the blank and placebo preparations. Spectral purity analysis demonstrates that the active analyte peak is spectrally pure and homogenous.',
    },

    linearity: {
      levels: linLevels,
      regression: {
        correlationR: Number(Math.sqrt(linGen.regression.rSquared).toFixed(5)),
        rSquared: linGen.regression.rSquared,
        slope: linGen.regression.slope,
        yIntercept: linGen.regression.yIntercept,
        yInterceptBiasPercent: Number(((linGen.regression.yIntercept / (linLevels[2]?.meanArea || 1)) * 100).toFixed(2)),
      },
      acceptanceTextProtocol: 'The correlation coefficient (r) shall be NLT 0.999 and coefficient of determination (r²) shall be NLT 0.998 across 50% to 150% of nominal concentration. The y-intercept bias shall be NMT ±2.0%.',
      conclusionReport: `The correlation coefficient (r) obtained is ${Number(Math.sqrt(linGen.regression.rSquared).toFixed(5))} and r² is ${linGen.regression.rSquared}, which exceeds the acceptance criterion of NLT 0.999. The response is linear across the evaluated range of 50 % to 150 %.`,
    },

    accuracy: {
      rows: accRows,
      meanRecoveryAllLevels: 99.85,
      rsdAllLevels: 0.65,
      acceptanceTextProtocol: 'The mean recovery of the active substance at 50%, 100%, and 150% levels (triplicate determinations, total n=9) shall be between 98.0% and 102.0%, with overall % RSD NMT 2.0%.',
      conclusionReport: 'The mean recovery across all 9 determinations covering 50 %, 100 %, and 150 % accuracy levels is within 98.0 % to 102.0 % with % RSD NMT 2.0 %. The method is accurate and recovers the analyte without bias.',
    },

    precision: {
      rows: precRows,
      analyst1Mean: precGen.analyst1.meanPercent,
      analyst1Sd: precGen.analyst1.sd,
      analyst1Rsd: precGen.analyst1.rsd,
      analyst2Mean: precGen.analyst2.meanPercent,
      analyst2Sd: precGen.analyst2.sd,
      analyst2Rsd: precGen.analyst2.rsd,
      cumulativeMean: precGen.cumulative.meanPercent,
      cumulativeSd: precGen.cumulative.sd,
      cumulativeRsd: precGen.cumulative.rsd,
      diffBetweenMeans: Number(Math.abs(precGen.analyst1.meanPercent - precGen.analyst2.meanPercent).toFixed(2)),
      acceptanceTextProtocol: '% RSD of six replicate sample assay determinations by Analyst 1 shall be NMT 2.0%. For intermediate precision, Analyst 2 % RSD shall be NMT 2.0%, overall cumulative % RSD (n=12) shall be NMT 2.0%, and absolute difference between means shall be NMT 1.5%.',
      conclusionReport: `Method precision demonstrates an Analyst 1 % RSD of ${precGen.analyst1.rsd} % (NMT 2.0 %). Intermediate precision shows Analyst 2 % RSD of ${precGen.analyst2.rsd} %, cumulative % RSD (n=12) of ${precGen.cumulative.rsd} % (NMT 2.0 %), and mean difference of ${Number(Math.abs(precGen.analyst1.meanPercent - precGen.analyst2.meanPercent).toFixed(2))} % (NMT 1.5 %). All precision criteria are complied with.`,
    },

    contentUniformity: cuData,

    robustness: {
      rows: robRows,
      acceptanceTextProtocol: 'System suitability criteria (% RSD NMT 2.0%, Tailing factor NMT 2.0, Theoretical plates NLT 2000) shall be complied with under all deliberately varied chromatographic conditions.',
      conclusionReport: 'The analytical method is robust against deliberate variations in flow rate (±0.1 mL/min), column temperature (±3 °C), and mobile phase buffer pH (±0.2 units). System suitability parameters complied across all conditions.',
    },

    solutionStability: {
      rows: stabRows,
      acceptanceTextProtocol: 'The percentage difference in peak area response between the initial solution and stability time points over 24 hours shall not exceed 2.0% for both standard and sample preparations.',
      conclusionReport: 'The standard and sample solutions are chemically stable for up to 24 hours at room temperature (25 °C) and refrigerated (2–8 °C), with percentage differences well within the NMT 2.0% limit.',
    },

    reviewChecklist: [
      { particulars: 'Raw data, injection sequences, and electronic chromatograms reviewed', compliance: 'Verified & Documented' },
      { particulars: 'System suitability evaluated prior to sample sequence execution', compliance: 'Complied' },
      { particulars: '21 CFR Part 11 electronic audit trail verified without unexplained events', compliance: 'Verified & Clean' },
      { particulars: 'Any Out-of-Specification (OOS) or analytical deviations encountered', compliance: 'Nil (None observed)' },
      { particulars: 'All calculation formulas verified against raw integration outputs', compliance: '100% Recomputed & Verified' },
    ],

    abbreviations: [
      { abbreviation: 'AMV', expansion: 'Analytical Method Validation' },
      { abbreviation: 'HPLC', expansion: 'High Performance Liquid Chromatography' },
      { abbreviation: 'ICH', expansion: 'International Council for Harmonisation' },
      { abbreviation: 'USP', expansion: 'United States Pharmacopeia' },
      { abbreviation: 'BP', expansion: 'British Pharmacopoeia' },
      { abbreviation: 'CU', expansion: 'Content of Uniformity (Uniformity of Dosage Units)' },
      { abbreviation: 'AV', expansion: 'Acceptance Value (USP <905>)' },
      { abbreviation: 'SST', expansion: 'System Suitability Test' },
      { abbreviation: 'RSD', expansion: 'Relative Standard Deviation' },
      { abbreviation: 'SD', expansion: 'Standard Deviation' },
      { abbreviation: 'RT', expansion: 'Retention Time' },
      { abbreviation: 'PTFE', expansion: 'Polytetrafluoroethylene' },
      { abbreviation: 'QA', expansion: 'Quality Assurance' },
      { abbreviation: 'QC', expansion: 'Quality Control' },
      { abbreviation: 'GMP', expansion: 'Good Manufacturing Practice' },
    ],

    revisionHistory: [
      { version: '00', effectiveDate, reason: isCU ? 'New Analytical Method Validation Report for composite Assay and Content of Uniformity Method by HPLC' : 'New Analytical Method Validation Report for finished product Assay by HPLC', docNumber: docNo },
    ],
  };

  return recalculateAMVData(rawDoc);
}

export function buildFullAMVDataFromMonograph(productName: string, mono: MonographDefinition, overrides?: any): any {
  return generateAMVDataForProduct(productName, overrides);
}

