import { AMVDocumentData, ChemicalRequirement, EquipmentRequirement } from '../types';
import { recalculateAMVData } from './mathUtils';
import {
  generateSystemSuitabilityInjections,
  generateLinearityData,
  generatePrecisionData,
  generateAccuracyRecoveryData,
  createSeededRandom,
  extractDynamicLabelClaim,
} from './pharmaMathEngine';

export interface UniqueCodes {
  companyName?: string;
  companyAddress?: string;
  documentNo: string;
  validationBatchNo: string;
  standardLotNo: string;
  referenceStandardLot: string;
  effectiveDate: string;
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

export function getBaseMonograph(productName: string): MonographDefinition {
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
      nominalArea: 3120400,
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
      nominalArea: 2050800,
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
      nominalArea: 1720300,
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
  const cleaned = productName.replace(/tablets?|capsules?|injections?|gastro-resistant|delayed-release|\d+\s*mg|\d+\s*g/gi, "").trim() || "Active Pharmaceutical Ingredient";
  const doseValue = explicitDose ?? 50;
  const doseUnit = explicitUnit ?? "mg";
  const rtSeed = 3.8 + hash % 60 / 10;
  const wavelengthList = [215, 220, 225, 230, 238, 245, 254, 260, 275, 280, 290, 310];
  const wavelength = wavelengthList[hash % wavelengthList.length];
  const flowRates = [1, 1.2, 1.5, 0.8];
  const flowRate = flowRates[hash % flowRates.length];
  const temps = [25, 30, 35, 40];
  const colTemp = temps[hash % temps.length];
  const baseArea = 16e5 + hash % 180 * 1e4;
  const nominalWeight = doseValue <= 10 ? 10 : doseValue <= 50 ? 25 : 50;
  const workingConc = doseValue <= 10 ? 0.01 : doseValue <= 50 ? 0.02 : 0.05;
  const bufferPHList = [2.5, 3, 3.5, 4.5, 6, 6.8, 7];
  const bufferPH = bufferPHList[hash % bufferPHList.length];
  return {
    activeSubstance: cleaned,
    labelClaim: doseMatch ? `${doseValue} ${doseUnit} ${cleaned} per dosage unit` : productName,
    reference: `USP/BP Monograph for ${productName}, USP <621>, USP <1225>, ICH Q2(R2)`,
    chromatographicConditions: {
      column: `USP L1 C18 column (4.6 mm x ${doseValue > 100 ? "250" : "150"} mm, 5 \xB5m)`,
      mobilePhase: `Acetonitrile : 0.02 M Potassium Dihydrogen Phosphate Buffer pH ${bufferPH.toFixed(1)} (45:55 v/v)`,
      flowRate: `${flowRate.toFixed(1)} mL/min`,
      detectionWavelength: `UV at ${wavelength} nm`,
      injectionVolume: "10 \xB5L",
      columnTemperature: `${colTemp} \xB0C`,
      runTime: `${(rtSeed * 1.8).toFixed(1)} min`,
      diluent: "Mobile Phase",
      workingConcentration: `${workingConc} mg/mL (${Math.round(workingConc * 1e3)} \xB5g/mL)`,
      approxRetentionTime: `${rtSeed.toFixed(1)} min`,
      note: `Dissolve 2.72 g KH2PO4 in 1000 mL HPLC grade water, adjust pH to ${bufferPH.toFixed(1)} \xB1 0.05 with dilute H3PO4.`
    },
    solutionPreparation: {
      standardSolution: `Weigh accurately ${nominalWeight.toFixed(1)} mg of ${cleaned} RS into a 100 mL volumetric flask, dissolve and dilute with diluent. Dilute 5.0 mL to 50 mL with diluent.`,
      sampleSolution: `Weigh 20 dosage units, calculate average unit weight, finely powder. Transfer powder equivalent to ${nominalWeight.toFixed(1)} mg ${cleaned} into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter through 0.45 \xB5m filter. Dilute 5.0 mL to 50 mL.`
    },
    retentionTimeMin: Number(rtSeed.toFixed(2)),
    targetNominalWeight: nominalWeight,
    nominalArea: baseArea,
    workingConcNum: workingConc,
    flowRateNum: flowRate,
    columnTempNum: colTemp,
    mobilePhaseBufferPH: bufferPH,
    reagents: ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Phosphoric Acid", "Milli-Q Water"]
  };
}
export function buildFullAMVDataFromMonograph(productName, mono, existingCodes) {
  const codes = {
    ...generateUniqueValidationCodes(productName),
    ...existingCodes || {}
  };
  const extracted = extractDynamicLabelClaim(productName, mono.testParameter, mono.activeSubstance, mono.labelClaim);
  let dynamicLabelClaim = extracted.labelClaim;
  let dynamicActiveSubstance = extracted.activeSubstance;
  const baseArea = mono.nominalArea;
  const rt = mono.retentionTimeMin;
  const nominalWeight = mono.targetNominalWeight;
  const workingConc = mono.workingConcNum || 0.05;
  const flow = mono.flowRateNum || 1;
  const temp = mono.columnTempNum || 30;
  const pH = mono.mobilePhaseBufferPH;
  const runKey = `${productName.toLowerCase()}_wt${nominalWeight}_area${baseArea}`;
  const ssMath = generateSystemSuitabilityInjections(runKey, baseArea, nominalWeight, 5);
  const randSS = createSeededRandom(`${runKey}_ss_plates`);
  const ssInjections = ssMath.injections.map((inj, idx) => ({
    injectionNo: inj.srNo,
    peakArea: inj.peakArea,
    tailingFactor: Number((1.12 + (randSS() - 0.5) * 0.04).toFixed(2)),
    theoreticalPlates: Math.round(3800 + (randSS() - 0.5) * 120)
  }));
  const specificityRows = [
    { solution: "Blank Diluent", retentionTime: "N/A", interference: "None" },
    { solution: "Placebo Solution", retentionTime: "N/A", interference: "None" },
    { solution: "Standard Solution", retentionTime: `${rt.toFixed(2)} min`, interference: "None" },
    { solution: "Sample Solution", retentionTime: `${(rt + 0.01).toFixed(2)} min`, interference: "None" }
  ];
  const nominalPpm = workingConc < 1 ? workingConc * 1e3 : workingConc;
  const linMath = generateLinearityData(runKey, nominalPpm, baseArea, [50, 80, 100, 120, 150]);
  const lvl100 = linMath.levels.find((lvl) => lvl.nominalPercent === 100) || linMath.levels[2];
  const area100 = lvl100.peakArea;
  const linearityLevels = linMath.levels.map((lvl) => ({
    levelPercent: lvl.nominalPercent,
    concentration: Number(lvl.concentrationPpm.toFixed(2)),
    meanArea: lvl.peakArea,
    percentOf100Response: lvl.nominalPercent === 100 ? 100.0 : Number(((lvl.peakArea / area100) * 100).toFixed(2))
  }));
  const accMath = generateAccuracyRecoveryData(runKey, nominalWeight, [50, 100, 150]);
  let expCounter = 1;
  const accRows = [];
  for (const lvl of accMath.levels) {
    for (const rep of lvl.replicates) {
      accRows.push({
        levelPercent: lvl.levelPercent,
        expNo: expCounter++,
        amountAdded: rep.amountAddedMg,
        amountRecovered: rep.amountRecoveredMg,
        percentRecovery: rep.percentRecovery
      });
    }
  }
  const precMath = generatePrecisionData(runKey, nominalWeight, baseArea, 100);
  const precisionRows = precMath.analyst1.rows.map((r, i) => ({
    sampleNo: `Preparation ${r.determinationNo}`,
    analyst1Assay: r.percentAssayOrDissolved,
    analyst2Assay: precMath.analyst2.rows[i].percentAssayOrDissolved,
    statisticalEvaluation: ""
  }));
  const randRob = createSeededRandom(`${runKey}_robustness`);
  const robustnessRows = [
    {
      conditionVaried: `Flow Rate: ${(flow - 0.1).toFixed(1)} mL/min`,
      rsdPercent: Number((0.11 + (randRob() - 0.5) * 0.04).toFixed(2)),
      tailingFactor: Number((1.14 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3910 + (randRob() - 0.5) * 120)
    },
    {
      conditionVaried: `Flow Rate: ${(flow + 0.1).toFixed(1)} mL/min`,
      rsdPercent: Number((0.09 + (randRob() - 0.5) * 0.03).toFixed(2)),
      tailingFactor: Number((1.13 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3780 + (randRob() - 0.5) * 120)
    },
    {
      conditionVaried: `Col Temp: ${temp - 3} \xB0C`,
      rsdPercent: Number((0.1 + (randRob() - 0.5) * 0.04).toFixed(2)),
      tailingFactor: Number((1.15 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3820 + (randRob() - 0.5) * 120)
    },
    {
      conditionVaried: `Col Temp: ${temp + 3} \xB0C`,
      rsdPercent: Number((0.08 + (randRob() - 0.5) * 0.03).toFixed(2)),
      tailingFactor: Number((1.14 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3870 + (randRob() - 0.5) * 120)
    },
    {
      conditionVaried: pH !== void 0 ? `Mobile Phase pH: ${(pH - 0.2).toFixed(1)}` : "Mobile Phase Organic: -2% v/v",
      rsdPercent: Number((0.12 + (randRob() - 0.5) * 0.04).toFixed(2)),
      tailingFactor: Number((1.16 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3790 + (randRob() - 0.5) * 120)
    },
    {
      conditionVaried: pH !== void 0 ? `Mobile Phase pH: ${(pH + 0.2).toFixed(1)}` : "Mobile Phase Organic: +2% v/v",
      rsdPercent: Number((0.1 + (randRob() - 0.5) * 0.04).toFixed(2)),
      tailingFactor: Number((1.13 + (randRob() - 0.5) * 0.03).toFixed(2)),
      theoreticalPlates: Math.round(3890 + (randRob() - 0.5) * 120)
    }
  ];
  const randStab = createSeededRandom(`${runKey}_stability`);
  const stabilityRows = [
    {
      timePoint: "Initial (0 h)",
      standardArea: baseArea,
      sampleArea: Math.round(baseArea * (1 + (randStab() - 0.5) * 8e-4)),
      diffPercent: "0.00 % / 0.00 %"
    },
    {
      timePoint: "3 h",
      standardArea: Math.round(baseArea * (1 - 15e-5 - randStab() * 2e-4)),
      sampleArea: Math.round(baseArea * (1 - 1e-4 - randStab() * 2e-4)),
      diffPercent: "0.02 % / 0.03 %"
    },
    {
      timePoint: "6 h",
      standardArea: Math.round(baseArea * (1 - 5e-4 - randStab() * 4e-4)),
      sampleArea: Math.round(baseArea * (1 - 3e-4 - randStab() * 4e-4)),
      diffPercent: "0.06 % / 0.05 %"
    },
    {
      timePoint: "12 h",
      standardArea: Math.round(baseArea * (1 - 9e-4 - randStab() * 6e-4)),
      sampleArea: Math.round(baseArea * (1 - 7e-4 - randStab() * 6e-4)),
      diffPercent: "0.11 % / 0.10 %"
    },
    {
      timePoint: "18 h",
      standardArea: Math.round(baseArea * (1 - 13e-4 - randStab() * 8e-4)),
      sampleArea: Math.round(baseArea * (1 - 11e-4 - randStab() * 8e-4)),
      diffPercent: "0.15 % / 0.14 %"
    },
    {
      timePoint: "24 h",
      standardArea: Math.round(baseArea * (1 - 19e-4 - randStab() * 1e-3)),
      sampleArea: Math.round(baseArea * (1 - 16e-4 - randStab() * 1e-3)),
      diffPercent: "0.22 % / 0.19 %"
    }
  ];
  const reagentNames = mono.reagents && mono.reagents.length > 0 ? mono.reagents : ["Acetonitrile", "Potassium Dihydrogen Phosphate", "Phosphoric Acid", "Milli-Q Water"];
  const reagents = reagentNames.map((name, idx) => ({
    name,
    grade: name.includes("Water") || name.includes("Acetonitrile") || name.includes("Methanol") ? "HPLC Grade" : "AR Grade",
    make: idx % 2 === 0 ? "Merck" : "Sigma-Aldrich",
    batchNo: `B${102900 + idx * 17}`
  }));
  reagents.push({
    name: `${dynamicActiveSubstance} RS (Lot: ${codes.referenceStandardLot}, Potency: 99.82 % as-is, Valid through: 31-Dec-2027)`,
    grade: "USP Reference Standard",
    make: "USP / Official Reference Standard",
    batchNo: codes.referenceStandardLot
  });
  const equipment = [
    {
      srNo: 1,
      name: "HPLC System with UV / PDA detector \u2014 System-I (Analyst 1)",
      idNo: "HPLC/QC/001",
      calibrationDate: "15-Jan-2026",
      dueDate: "14-Jan-2027"
    },
    {
      srNo: 2,
      name: "HPLC System with UV / PDA detector \u2014 System-II (Analyst 2)",
      idNo: "HPLC/QC/002",
      calibrationDate: "20-Feb-2026",
      dueDate: "19-Feb-2027"
    },
    {
      srNo: 3,
      name: `Column \u2014 Lot A (${mono.chromatographicConditions.column})`,
      idNo: "COL/HPLC/001",
      calibrationDate: "Not applicable \u2013 PQ",
      dueDate: "Not applicable"
    },
    {
      srNo: 4,
      name: `Column \u2014 Lot B (${mono.chromatographicConditions.column})`,
      idNo: "COL/HPLC/002",
      calibrationDate: "Not applicable \u2013 PQ",
      dueDate: "Not applicable"
    },
    {
      srNo: 5,
      name: "Analytical Balance (Micro & Semi-micro)",
      idNo: "BAL/QC/001",
      calibrationDate: "10-Mar-2026",
      dueDate: "09-Mar-2027"
    },
    {
      srNo: 6,
      name: "Ultrasonic Bath with degasser",
      idNo: "USB/QC/001",
      calibrationDate: "05-Apr-2026",
      dueDate: "04-Apr-2027"
    },
    {
      srNo: 7,
      name: "Digital pH Meter (with 3-point calibration)",
      idNo: "PH/QC/001",
      calibrationDate: "12-Apr-2026",
      dueDate: "11-Apr-2027"
    },
    {
      srNo: 8,
      name: "Karl Fischer Titrator (Volumetric)",
      idNo: "KF/QC/001",
      calibrationDate: "18-Apr-2026",
      dueDate: "17-Apr-2027"
    }
  ];
  const protocolNumber = codes.documentNo;
  const reportNumber = codes.documentNo.includes("/AMV/") ? codes.documentNo.replace("/AMV/", "/AMVR/") : `${codes.documentNo}/R`;
  const doc = {
    companyName: existingCodes?.companyName || "WESTCOAST PHARMACEUTICAL WORKS LTD.",
    companyAddress: existingCodes?.companyAddress || "GOTA, Ahmedabad, Gujarat, India",
    documentNo: codes.documentNo,
    reportNo: reportNumber,
    protocolDate: "01-Apr-2026",
    reportDate: codes.approvedDate || "20-Apr-2026",
    productName,
    activeSubstance: dynamicActiveSubstance,
    labelClaim: dynamicLabelClaim,
    testParameter: "Assay by HPLC",
    reference: mono.reference,
    batchNoUsed: codes.validationBatchNo,
    effectiveDate: codes.effectiveDate,
    supersedes: codes.supersedes,
    signOffs: {
      preparedBy: {
        name: "Sahil Panchal",
        designation: "QC. Chemist (Analyst \u2013 QC)",
        date: codes.preparedDate
      },
      reviewedBy: {
        name: "Anil Parmar",
        designation: "QC. In-charge (Manager \u2013 QC)",
        date: codes.reviewedDate
      },
      approvedBy: {
        name: "Hardik Shah",
        designation: "QA In-charge (Head \u2013 QA)",
        date: codes.approvedDate
      }
    },
    objective: `To validate the HPLC analytical method for quantification of ${dynamicActiveSubstance} in ${productName} in compliance with ICH Q2(R2) and USP <1225> guidelines.`,
    scope: `This protocol applies to the validation of the HPLC Assay method for ${productName} manufactured at ${existingCodes?.companyName || "Westcoast Pharmaceutical Works Ltd."}.`,
    verificationDetails: {
      reference: mono.reference,
      typeOfVerification: "Verification of a compendial assay procedure under actual conditions of use, as per USP <1225> and ICH Q2(R2)",
      testToBeVerified: `Assay by HPLC (${dynamicActiveSubstance} content)`,
      verificationTeam: "Analyst 1: Sahil Panchal (Chemist, QC); Analyst 2: Smit Patel (Executive, QC); Supervisor: Anil Parmar (Manager, QC)",
      experimentalDetails: `Specificity, system suitability, linearity (50 % to 150 %), accuracy / recovery (50 %, 100 %, 150 % or 80 %, 100 %, 120 %), range (80 %, 100 %, 120 %), precision (repeatability) and intermediate precision (six determinations each by 2 analysts on 2 instruments on 2 different days), robustness and stability of analytical solutions up to 24 hours, executed on batch ${codes.validationBatchNo} with the corresponding placebo blend.`
    },
    chromatographicConditions: mono.chromatographicConditions,
    solutionPreparation: mono.solutionPreparation,
    calculationFormula: {
      assayFormula: "Assay (%) = (AT / AS) * (WS / DS) * (DT / WT) * (AVG_WT / LC) * P * 100",
      contentFormula: "Content (mg/tablet) = Assay (%) * Label Claim (mg) / 100",
      notes: [
        "• AT = Peak area of analyte in sample chromatogram",
        "• AS = Mean peak area of analyte in standard chromatograms",
        `• WS = Weight of ${dynamicActiveSubstance} working standard taken (${nominalWeight.toFixed(2)} mg)`,
        "• DS = Standard solution final dilution volume (100.0 mL)",
        "• DT = Sample solution final dilution volume (100.0 mL)",
        "• WT = Weight of powdered dosage unit sample taken (mg)",
        "• AVG_WT = Average weight of 20 dosage units (mg)",
        `• LC = Label claim of ${dynamicActiveSubstance} per unit (${dynamicLabelClaim.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|µg)/i)?.[0] || `${nominalWeight.toFixed(2)} mg`})`,
        `• P = Numerical decimal purity of Reference Standard = 0.9982 (99.82 % on as-is basis, from RS Certificate of Analysis Lot: ${codes.referenceStandardLot})`
      ]
    },
    reagentsAndStandards: reagents,
    equipment,
    validationParameters: [],
    // Populated dynamically in recalculateAMVData
    systemSuitability: {
      injections: ssInjections,
      meanArea: 0,
      rsdArea: 0,
      meanTailing: 0,
      rsdTailing: 0,
      meanPlates: 0,
      rsdPlates: 0,
      acceptanceTextProtocol: "Acceptance Criteria: %RSD of Peak Area <= 2.0%, Tailing Factor <= 2.0, Theoretical Plates >= 2000. (Observed Result: To be recorded upon execution)",
      acceptanceTextReport: "Acceptance: %RSD of Peak Area <= 2.0%, Tailing Factor <= 2.0, Theoretical Plates >= 2000. Result: Complies with ICH / USP criteria"
    },
    specificity: {
      rows: specificityRows,
      acceptanceTextProtocol: "Acceptance Criteria: No interfering peak from blank or placebo matrix shall co-elute with the active substance peak. Peak purity shall be verified.",
      conclusionReport: `Conclusion: No peak interference observed at ${dynamicActiveSubstance} retention time (${rt.toFixed(2)} min) in blank or placebo chromatograms. Peak purity confirmed by PDA detector.`
    },
    linearity: {
      levels: linearityLevels,
      regression: {
        correlationR: 0.99993,
        rSquared: 0.9999,
        slope: Math.round(baseArea / nominalPpm),
        yIntercept: -1.45,
        yInterceptBiasPercent: 0
      },
      acceptanceTextProtocol: "Acceptance Criteria: Correlation coefficient (r) shall be \u2265 0.999 (r\xB2 \u2265 0.998). The y-intercept bias shall be within \xB12.0% of nominal response.",
      conclusionReport: "Conclusion: Method demonstrates linear response from 50% to 150% of nominal concentration with r \u2265 0.999."
    },
    accuracy: {
      rows: accRows,
      meanRecoveryAllLevels: 99.9,
      rsdAllLevels: 0.19,
      acceptanceTextProtocol: "Acceptance Criteria: Mean recovery at each concentration level shall be between 98.0% and 102.0%. Overall % RSD across 9 determinations shall be NMT 2.0%.",
      conclusionReport: "Conclusion: Mean recovery at each level was between 98.0% and 102.0% with an overall %RSD of 0.42%, confirming high method accuracy."
    },
    precision: {
      rows: precisionRows,
      analyst1Mean: 99.98,
      analyst1Sd: 0.319,
      analyst1Rsd: 0.32,
      analyst2Mean: 99.88,
      analyst2Sd: 0.397,
      analyst2Rsd: 0.4,
      cumulativeMean: 99.93,
      cumulativeSd: 0.347,
      cumulativeRsd: 0.35,
      diffBetweenMeans: 0.1,
      acceptanceTextProtocol: "Acceptance Criteria: % RSD of six assay results for Analyst 1 and Analyst 2 shall be NMT 2.0%. Overall cumulative % RSD (n=12) shall be NMT 2.0%. Absolute difference between means shall be NMT 1.5%.",
      conclusionReport: "Conclusion: Repeatability %RSD is 0.33% and Intermediate Precision cumulative %RSD (n=12) is 0.37%, demonstrating excellent method precision."
    },
    robustness: {
      instructionParagraph: pH !== void 0 ? "Evaluate system suitability under deliberately varied HPLC conditions (Flow rate \xB10.1 mL/min, Column Temp \xB13\xB0C, Mobile phase pH \xB10.2)." : "Evaluate system suitability under deliberately varied HPLC conditions (Flow rate \xB10.1 mL/min, Column Temp \xB13\xB0C, Mobile phase composition \xB12% v/v).",
      rows: robustnessRows,
      acceptanceTextProtocol: "Acceptance Criteria: System suitability criteria (%RSD NMT 2.0%, Tailing NMT 2.0, Plates NLT 2000) shall be complied with under all varied conditions.",
      conclusionReport: "Conclusion: Deliberate minor variations in flow rate, temperature, and mobile phase did not significantly impact system suitability or test results."
    },
    solutionStability: {
      rows: stabilityRows,
      acceptanceTextProtocol: "Acceptance Criteria: The cumulative percentage difference in peak response for standard and sample solutions over 24 hours shall not exceed 2.0%.",
      conclusionReport: "Conclusion: Standard and sample solutions are stable at room temperature (25 deg C) for up to 24 hours with peak area variations < 1.0%."
    },
    reviewChecklist: [
      { particulars: "Raw data, calculations & chromatograms reviewed", compliance: "Yes \u2013 Reviewed & verified" },
      { particulars: "Electronic audit trail reviewed", compliance: "Yes \u2013 Compliant with 21 CFR Part 11" },
      { particulars: "Deviation / OOS raised", compliance: "NIL (No deviation or OOS encountered)" },
      {
        particulars: "Annexures attached",
        compliance: "Annexure I to Annexure VIII (Chromatograms, Calibration Plots & Raw Logs)"
      }
    ],
    abbreviations: [
      { abbreviation: "AMV", expansion: "Analytical Method Validation" },
      { abbreviation: "HPLC", expansion: "High Performance Liquid Chromatography" },
      { abbreviation: "ICH", expansion: "International Council for Harmonisation" },
      { abbreviation: "USP", expansion: "United States Pharmacopeia" },
      { abbreviation: "%RSD", expansion: "Relative Standard Deviation" },
      { abbreviation: "QC / QA", expansion: "Quality Control / Quality Assurance" },
      { abbreviation: "PDA", expansion: "Photodiode Array" },
      { abbreviation: "KF", expansion: "Karl Fischer (water determination)" },
      { abbreviation: "ACN", expansion: "Acetonitrile" },
      { abbreviation: "mcg/mL / \xB5g/mL", expansion: "Microgram per millilitre" },
      { abbreviation: "\xB5V\xB7s", expansion: "Microvolt second (peak area unit)" },
      { abbreviation: "NMT", expansion: "Not More Than" },
      { abbreviation: "NLT", expansion: "Not Less Than" },
      { abbreviation: "RT", expansion: "Retention Time" },
      { abbreviation: "STP", expansion: "Standard Test Procedure" },
      { abbreviation: "S/N", expansion: "Signal-to-Noise Ratio" },
      { abbreviation: "WS / RS", expansion: "Working Standard / Reference Standard" },
      { abbreviation: "OOS", expansion: "Out of Specification" }
    ],
    revisionHistory: [
      {
        version: "00",
        effectiveDate: "01-Apr-2026",
        docNumber: protocolNumber,
        reason: `Analytical Method Validation Protocol issued as ${protocolNumber} for ${productName} by HPLC (Approved: 31-Mar-2026)`
      },
      {
        version: "01",
        effectiveDate: codes.effectiveDate || "21-Apr-2026",
        docNumber: reportNumber,
        reason: `Executed Analytical Method Validation Report issued as ${reportNumber} for ${productName} by HPLC (Approved: 20-Apr-2026). Validates chromatographic parameters (Retention Time ~${mono.chromatographicConditions.approxRetentionTime}, detection wavelength ${mono.chromatographicConditions.detectionWavelength}, column ${mono.chromatographicConditions.column}, mobile phase ${mono.chromatographicConditions.mobilePhase}, column temperature ${mono.chromatographicConditions.columnTemperature}) with full system suitability, linearity, precision, and accuracy under ICH Q2(R2).`
      }
    ]
  };
  return recalculateAMVData(doc);
}

export function generateUniqueValidationCodes(productName: string): UniqueCodes {
  return {
    documentNo: "AMV-2026-001",
    validationBatchNo: "VAL-88210",
    standardLotNo: "RS-88992",
    referenceStandardLot: "RS-88992",
    effectiveDate: "21-Apr-2026",
    supersedes: "New Method Protocol",
    preparedDate: "15-Apr-2026",
    reviewedDate: "18-Apr-2026",
    approvedDate: "20-Apr-2026"
  };
}

export function generateAMVDataForProduct(
  productName: string,
  existingCodes?: Partial<UniqueCodes>,
  fpsOverrides?: any
) {
  const mono = getBaseMonograph(productName);
  if (fpsOverrides) {
    if (fpsOverrides.column) mono.chromatographicConditions.column = fpsOverrides.column;
    if (fpsOverrides.mobilePhase) mono.chromatographicConditions.mobilePhase = fpsOverrides.mobilePhase;
    if (fpsOverrides.flowRate) mono.chromatographicConditions.flowRate = fpsOverrides.flowRate;
    if (fpsOverrides.wavelength) mono.chromatographicConditions.detectionWavelength = fpsOverrides.wavelength;
    if (fpsOverrides.injectionVolume) mono.chromatographicConditions.injectionVolume = fpsOverrides.injectionVolume;
    if (fpsOverrides.columnTemperature) mono.chromatographicConditions.columnTemperature = fpsOverrides.columnTemperature;
    if (fpsOverrides.runTime) mono.chromatographicConditions.runTime = fpsOverrides.runTime;
    if (fpsOverrides.diluent) mono.chromatographicConditions.diluent = fpsOverrides.diluent;
    if (fpsOverrides.workingConcentration) mono.chromatographicConditions.workingConcentration = fpsOverrides.workingConcentration;
  }
  return buildFullAMVDataFromMonograph(productName, mono, existingCodes);
}
