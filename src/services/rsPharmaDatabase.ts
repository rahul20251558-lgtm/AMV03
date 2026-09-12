import {
  RSAMVDocumentData,
  RSOvenProgrammeRow,
  RSMonographLimitItem,
  RSRequirementItem,
  RSValidationParameterCriteria,
  RSSystemSuitabilityRow,
  RSSpecificityRow,
  RSLinearityLevelRow,
  RSRangeRow,
  RSPrecisionRow,
  RSLodLoqConfirmationRow,
  RSLoqPrecisionRow,
  RSIntermediatePrecisionRow,
  RSAccuracyRecoveryRow,
} from '../types';
import { filterUsedAbbreviations } from './abbreviationFilter';
import { getCleanDrugDisplayName, postProcessSanitizeDocument } from './postGenerationSanitizer';
import {
  parseProductStrength,
  computeNominalPeakArea,
  generateSystemSuitabilityInjections,
  generateLinearityData,
  generatePrecisionData,
  generateAccuracyRecoveryData,
  createSeededRandom,
  normalRandom,
  extractDynamicLabelClaim,
  formatPharmaDate,
  parsePharmaDate,
} from './pharmaMathEngine';

export interface RSMonographSeed {
  productName: string;
  activeSubstance?: string;
  labelClaim: string;
  testParameter: string;
  reference: string;
  technique: 'GC' | 'HPLC';
  detector: string;
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
  nominalPpm: number;
  activeRtMin: number;
  impurityName: string;
  impurityRtMin: number;
  internalStandardRtMin?: number;
  nominalArea: number;
  ovenProgramme: RSOvenProgrammeRow[];
  solutionPreparation: {
    internalStandard: string;
    testSolution: string;
    referenceSolution: string;
    systemSuitabilitySolution: string;
    blank: string;
    placeboSolution: string;
    handlingNote: string;
  };
  monographLimits: RSMonographLimitItem[];
  requirements: RSRequirementItem[];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Comprehensive Compendial Related Substances Monographs
export const RS_MONOGRAPH_LIBRARY: Record<string, RSMonographSeed> = {
  vildagliptin: {
    productName: 'Vildagliptin Tablets 50 mg',
    activeSubstance: 'Vildagliptin',
    labelClaim: 'Each tablet contains Vildagliptin 50 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'In-house Monograph / Compendial Reference Standard; ICH Q2(R2); USP <1226>',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV/Vis Detector',
    column: 'Inertsil ODS-3 C18, 250 mm × 4.6 mm, 5 µm (USP L1)',
    carrierGasOrMobilePhase: '0.02 M Potassium Dihydrogen Phosphate Buffer pH 6.8 : Acetonitrile (82 : 18 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 210 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A (HPLC)',
    ovenProgrammeOrGradient: 'Isocratic for 35 minutes at 30 °C',
    totalRunTime: '35 minutes',
    diluent: 'Phosphate Buffer pH 6.8 : Acetonitrile (82 : 18 v/v)',
    internalStandard: 'N/A (External Standardisation)',
    relativeRetention: 'With reference to Vildagliptin (RT ~ 9.50 min): Vildagliptin Related Compound A about 0.58',
    nominalPpm: 500,
    activeRtMin: 9.50,
    impurityName: 'Vildagliptin Related Compound A (Pyrrolidine-2-carbonitrile)',
    impurityRtMin: 5.51,
    internalStandardRtMin: undefined,
    nominalArea: 4850000,
    ovenProgramme: [
      { timeRange: '0 — 35 min', temperature: '30 °C (Column Oven)', comment: 'Isocratic HPLC elution' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Disperse powdered tablets equivalent to 50.0 mg Vildagliptin in 70 mL diluent, sonicate 20 min, dilute to 100.0 mL (500 µg/mL). Filter through 0.45 µm PTFE filter.',
      referenceSolution: 'Dilute 1.0 mL of test solution to 100.0 mL with diluent. Further dilute 1.0 mL to 10.0 mL with diluent (0.10 % level, 0.5 µg/mL).',
      systemSuitabilitySolution: 'Solution containing Vildagliptin Working Standard (500 µg/mL) and Vildagliptin Related Compound A (5 µg/mL).',
      blank: 'Diluent (Mobile Phase).',
      placeboSolution: 'Transfer quantity of placebo excipient blend equivalent to one tablet into 100 mL flask, extract with diluent identically, and filter.',
      handlingNote: 'Keep solutions protected from actinic light. Equilibrate HPLC system until baseline stability is established.',
    },
    monographLimits: [
      { criterion: 'Vildagliptin Related Compound A', limit: 'NMT 0.20 %' },
      { criterion: 'Any unspecified impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Vildagliptin Working Standard', grade: 'Characterised Working Standard (Potency: 99.82 %)', make: 'In-house QC Lab', batchNo: 'WS/VIL/2025/01' },
      { name: 'Vildagliptin Related Compound A Reference Standard', grade: 'Compendial Reference Standard (CRS/USP)', make: 'EDQM / USP', batchNo: 'CRS-VIL-A-01' },
      { name: 'Finished Product Validation Batch', grade: 'Commercial finished formulation', make: 'Manufacturing Site', batchNo: 'VIL-2025-01' },
      { name: 'Placebo Blend', grade: 'Master Formula excipient composite', make: 'Manufacturing Site', batchNo: 'PL-VIL-2501' },
      { name: 'Acetonitrile (HPLC Grade)', grade: 'Spectroscopic / HPLC Grade (≥ 99.9 %)', make: 'Merck / Honeywell', batchNo: 'ACN-88421' },
    ],
  },
  valproate: {
    productName: 'Sodium Valproate Oral Solution BP 200 mg / 5 mL',
    labelClaim: 'Each 5 mL contains Sodium Valproate BP 200 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Sodium Valproate Oral Solution (current edition); BP Appendix III D (HPLC); ICH Q2(R2); USP <1226>',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV/Vis Detector',
    column: 'Octadecylsilyl silica gel for chromatography (C18), 250 mm × 4.6 mm, 5 µm (USP L1)',
    carrierGasOrMobilePhase: '0.05 M Monopotassium Phosphate Buffer pH 3.0 : Acetonitrile (55 : 45 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 210 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes; column temperature 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A (External Reference Standard method)',
    relativeRetention: 'With reference to Valproic Acid (retention time about 8.5 min): Impurity K about 0.85; Impurity B about 1.25',
    nominalPpm: 400,
    activeRtMin: 8.52,
    impurityName: 'Impurity K (2-(1-methylethyl)pentanoic acid)',
    impurityRtMin: 7.24,
    internalStandardRtMin: undefined,
    nominalArea: 512400,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Phosphate Buffer pH 3.0 : Acetonitrile (55:45 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A (External standard method).',
      testSolution:
        'Transfer a quantity of oral solution containing 100 mg Sodium Valproate into a 100 mL volumetric flask, dissolve and dilute to volume with diluent. Filter through 0.45 µm PTFE filter.',
      referenceSolution:
        'Dilute 1.0 mL of test solution to 100.0 mL with diluent. Further dilute 1.0 mL of this solution to 10.0 mL with diluent (0.1 % level).',
      systemSuitabilitySolution:
        'Prepare a solution containing Sodium Valproate RS (1.0 mg/mL) and Impurity K RS (2.0 µg/mL) in diluent.',
      blank: 'Diluent (Mobile Phase).',
      placeboSolution:
        'Take a quantity of placebo matrix equivalent to test solution and process identically.',
      handlingNote:
        'Prepare solutions fresh on day of use; protect from direct light.',
    },
    monographLimits: [
      { criterion: 'Impurity K (2-(1-methylethyl)pentanoic acid)', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual secondary impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.40 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Sodium Valproate BP Working Standard (Potency: 99.78 % as-is)', grade: 'Characterised WS — potency on as-is basis', make: 'In-house / USP', batchNo: 'WS/VAL/2403' },
      { name: 'Impurity K Reference Standard', grade: 'EP Chemical Reference Standard', make: 'EDQM', batchNo: 'EPCRS-721' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'AR Grade', make: 'Merck', batchNo: 'PDP-4410' },
      { name: 'Acetonitrile', grade: 'HPLC Grade', make: 'Merck', batchNo: 'ACN-9281' },
      { name: 'Orthophosphoric Acid (0.1 M)', grade: 'AR Grade', make: 'Rankem', batchNo: 'OPA-2024' },
      { name: 'Milli-Q Water', grade: 'Conductivity < 0.055 µS/cm', make: 'Millipore', batchNo: 'MQ-9999' },
    ],
  },
  paracetamol: {
    productName: 'Paracetamol Tablets BP 500 mg',
    labelClaim: 'Each tablet contains Paracetamol BP 500 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Paracetamol Tablets; Ph. Eur. Monograph 0049; USP Monograph Acetaminophen; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV/Vis Detector',
    column: 'Inertsil ODS-3 C18 (4.6 mm × 250 mm, 5 µm) or USP L1',
    carrierGasOrMobilePhase: '0.05 M Monopotassium Phosphate Buffer pH 3.0 : Methanol (85 : 15 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 245 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic run for 25 minutes; ambient temperature (25 °C)',
    totalRunTime: '25 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A (External Reference Standard method)',
    relativeRetention: 'With reference to Paracetamol (RT ~ 5.4 min): Impurity K (4-aminophenol) about 0.45; Impurity F about 1.85',
    nominalPpm: 250,
    activeRtMin: 5.42,
    impurityName: '4-Aminophenol (Impurity K)',
    impurityRtMin: 2.45,
    nominalArea: 1420500,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '25 °C (Isocratic)', comment: 'Buffer : Methanol (85:15 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution:
        'Weigh 20 tablets, determine average mass and finely powder. Transfer powder containing 250 mg of Paracetamol into a 100 mL volumetric flask, add 70 mL diluent, sonicate 15 min, dilute to volume, filter through 0.45 µm membrane.',
      referenceSolution:
        'Dilute 1.0 mL of test solution to 100.0 mL with diluent. Dilute 1.0 mL of this solution to 10.0 mL with diluent (0.1% level).',
      systemSuitabilitySolution:
        'Dissolve 5.0 mg of Paracetamol for system suitability CRS (containing 4-aminophenol) in diluent and dilute to 50.0 mL.',
      blank: 'Diluent (Mobile Phase).',
      placeboSolution:
        'Transfer placebo equivalent to 250 mg Paracetamol, process identically to test solution.',
      handlingNote: 'Protect 4-aminophenol solutions from light; prepare fresh on the day of analysis.',
    },
    monographLimits: [
      { criterion: '4-Aminophenol (Impurity K)', limit: 'NMT 50 ppm (0.005 %)' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.025 %' },
    ],
    requirements: [
      { name: 'Paracetamol BP Working Standard', grade: 'Characterised WS', make: 'USP / In-house', batchNo: 'WS/PAR/2402' },
      { name: '4-Aminophenol Reference Standard', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-4AP-10' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Methanol', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'MEOH-7231' },
      { name: 'Milli-Q Water', grade: 'Conductivity < 0.055 µS/cm', make: 'Millipore', batchNo: 'MQ-2024' },
    ],
  },
  metformin: {
    productName: 'Metformin HCl Tablets BP 500 mg',
    labelClaim: 'Each tablet contains Metformin Hydrochloride BP 500 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Metformin Tablets; Ph. Eur. Monograph 0931; USP Monograph; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'Inertsil ODS-3V C18 (4.6 mm × 250 mm, 5 µm) or USP L1',
    carrierGasOrMobilePhase: '0.05 M Sodium Heptanesulfonate Buffer pH 3.85 : Acetonitrile (90 : 10 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 218 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 20 minutes at 30 °C',
    totalRunTime: '20 minutes',
    diluent: 'Milli-Q Water',
    internalStandard: 'N/A (External Reference Standard)',
    relativeRetention: 'With reference to Metformin (RT ~ 8.2 min): Dicyandiamide (Impurity A) about 0.35',
    nominalPpm: 200,
    activeRtMin: 8.21,
    impurityName: 'Dicyandiamide (Impurity A)',
    impurityRtMin: 2.88,
    nominalArea: 1680400,
    ovenProgramme: [
      { timeRange: '0 — 20', temperature: '30 °C (Isocratic)', comment: 'Ion-pair buffer : ACN (90:10 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution:
        'Weigh 20 tablets, crush to powder. Dissolve powder containing 500 mg Metformin HCl in 70 mL water, sonicate 20 min, dilute to 100 mL, filter.',
      referenceSolution:
        'Dilute 1.0 mL of test solution to 100.0 mL with water. Dilute 1.0 mL of this solution to 10.0 mL with water (0.1% level).',
      systemSuitabilitySolution:
        'Dissolve 5 mg Metformin HCl and 2 mg Dicyandiamide CRS in water, dilute to 100 mL.',
      blank: 'Water.',
      placeboSolution: 'Placebo prepared identically without active ingredient.',
      handlingNote: 'Equilibrate column with ion-pairing buffer for at least 60 minutes before first injection.',
    },
    monographLimits: [
      { criterion: 'Dicyandiamide (Impurity A)', limit: 'NMT 0.02 % (200 ppm)' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.02 %' },
    ],
    requirements: [
      { name: 'Metformin HCl Working Standard', grade: 'Characterised WS', make: 'USP / In-house', batchNo: 'WS/MET/2401' },
      { name: 'Dicyandiamide CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-DICY-02' },
      { name: 'Sodium 1-Heptanesulfonate Monohydrate', grade: 'HPLC grade', make: 'Merck', batchNo: 'SHS-9912' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Merck', batchNo: 'ACN-4421' },
    ],
  },
  ciprofloxacin: {
    productName: 'Ciprofloxacin Tablets USP 500 mg',
    labelClaim: 'Each film-coated tablet contains Ciprofloxacin HCl eq. to Ciprofloxacin 500 mg',
    testParameter: 'Organic Impurities (Related Substances) by HPLC with UV Detection',
    reference: 'USP Monograph — Ciprofloxacin Tablets; Ph. Eur. Monograph 1089; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: '0.025 M Phosphoric Acid Buffer with Triethylamine pH 3.0 : Acetonitrile (87 : 13 v/v)',
    injectionTempOrFlowRate: '1.5 mL per minute',
    detectorTempOrWavelength: 'UV at 278 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A (External Reference Standard)',
    relativeRetention: 'With reference to Ciprofloxacin (RT ~ 9.5 min): Fluoroquinolonic acid about 0.38; Impurity A about 0.52',
    nominalPpm: 250,
    activeRtMin: 9.52,
    impurityName: 'Fluoroquinolonic Acid (Impurity A)',
    impurityRtMin: 3.62,
    nominalArea: 2120000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Phosphate buffer pH 3.0 : ACN (87:13 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution:
        'Transfer pulverized tablet powder equivalent to 500 mg Ciprofloxacin into a 100 mL flask, dissolve in diluent, sonicate 20 min, filter.',
      referenceSolution:
        'Dilute 1.0 mL of test solution to 100.0 mL with diluent. Dilute 2.0 mL to 10.0 mL (0.2% reference level).',
      systemSuitabilitySolution:
        'Dissolve Ciprofloxacin for system suitability CRS containing Fluoroquinolonic acid in diluent.',
      blank: 'Mobile Phase.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Solutions are sensitive to light; protect from direct illumination.',
    },
    monographLimits: [
      { criterion: 'Fluoroquinolonic Acid', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.20 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Ciprofloxacin HCl Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/CIP/2405' },
      { name: 'Fluoroquinolonic Acid CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-FQA-01' },
      { name: 'Triethylamine', grade: 'HPLC grade', make: 'Merck', batchNo: 'TEA-1029' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  atorvastatin: {
    productName: 'Atorvastatin Calcium Tablets USP 20 mg',
    labelClaim: 'Each tablet contains Atorvastatin Calcium eq. to Atorvastatin 20 mg',
    testParameter: 'Organic Impurities by Reverse Phase HPLC with UV Detection',
    reference: 'USP Monograph — Atorvastatin Calcium Tablets; USP <621>; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.05 M Ammonium Acetate pH 4.5 : THF (67:21:12 v/v)',
    injectionTempOrFlowRate: '1.2 mL per minute',
    detectorTempOrWavelength: 'UV at 246 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 35 minutes at 35 °C',
    totalRunTime: '35 minutes',
    diluent: 'Methanol : Water (80:20 v/v)',
    internalStandard: 'N/A (External Reference Standard)',
    relativeRetention: 'With reference to Atorvastatin (RT ~ 11.2 min): Atorvastatin Lactone (Impurity A) ~ 1.45; Desfluoro Atorvastatin ~ 0.88',
    nominalPpm: 200,
    activeRtMin: 11.24,
    impurityName: 'Atorvastatin Lactone (Impurity A)',
    impurityRtMin: 16.30,
    nominalArea: 1845000,
    ovenProgramme: [
      { timeRange: '0 — 35', temperature: '35 °C (Linear Gradient)', comment: 'Acetonitrile / Ammonium Acetate / THF' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Disperse tablet powder equivalent to 20 mg Atorvastatin in 100 mL diluent, sonicate 20 min, filter through 0.45 µm PVDF.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Standard containing Atorvastatin and Atorvastatin Lactone CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed identically.',
      handlingNote: 'Keep solutions protected from actinic light; store in amber vials.',
    },
    monographLimits: [
      { criterion: 'Atorvastatin Lactone (Impurity A)', limit: 'NMT 0.25 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.80 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Atorvastatin Calcium Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/ATO/2401' },
      { name: 'Atorvastatin Lactone Reference Standard', grade: 'USP RS', make: 'USP', batchNo: 'RS-ALAC-03' },
      { name: 'Ammonium Acetate', grade: 'HPLC grade', make: 'Merck', batchNo: 'AA-9120' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-9912' },
    ],
  },
  ibuprofen: {
    productName: 'Ibuprofen Tablets BP 400 mg',
    labelClaim: 'Each tablet contains Ibuprofen BP 400 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Ibuprofen Tablets; Ph. Eur. Monograph 0721; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'Inertsil ODS-3 C18 (4.6 mm × 150 mm, 5 µm)',
    carrierGasOrMobilePhase: '0.01 M Chloroacetic acid buffer pH 3.0 : Acetonitrile (40 : 60 v/v)',
    injectionTempOrFlowRate: '1.5 mL per minute',
    detectorTempOrWavelength: 'UV at 254 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Acetonitrile : Water (60:40 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Ibuprofen (RT ~ 8.4 min): 4-Isobutylacetophenone (Impurity B) about 1.32',
    nominalPpm: 250,
    activeRtMin: 8.42,
    impurityName: '4-Isobutylacetophenone (Impurity B)',
    impurityRtMin: 11.12,
    nominalArea: 1950000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Chloroacetic acid : ACN (40:60 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Dissolve powder containing 400 mg Ibuprofen in 100 mL diluent, sonicate 15 min, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL. Dilute 1.0 mL to 10.0 mL (0.1% level).',
      systemSuitabilitySolution: 'Standard containing Ibuprofen and 4-isobutylacetophenone CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Maintain buffer pH at 3.0 ± 0.05 to avoid peak tailing of Ibuprofen carboxylic acid.',
    },
    monographLimits: [
      { criterion: '4-Isobutylacetophenone (Impurity B)', limit: 'NMT 0.10 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.30 %' },
      { criterion: 'Disregard limit', limit: '0.03 %' },
    ],
    requirements: [
      { name: 'Ibuprofen BP Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/IBU/2402' },
      { name: '4-Isobutylacetophenone CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-IB-02' },
      { name: 'Chloroacetic Acid', grade: 'AR grade', make: 'Merck', batchNo: 'CA-1022' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-7731' },
    ],
  },
  pantoprazole: {
    productName: 'Pantoprazole Sodium Gastro-Resistant Tablets 40 mg',
    labelClaim: 'Each tablet contains Pantoprazole Sodium eq. to Pantoprazole 40 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Pantoprazole Gastro-Resistant Tablets; Ph. Eur. Monograph 2296; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'Inertsil ODS-3 C18 (4.6 mm × 150 mm, 5 µm) or USP L1',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.01 M Phosphate Buffer pH 7.0 (35 : 65 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 285 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: '0.01 M Sodium Hydroxide in Water',
    internalStandard: 'N/A (External Reference Standard)',
    relativeRetention: 'With reference to Pantoprazole (RT ~ 7.5 min): Pantoprazole Sulfone (Impurity A) ~ 1.35; Impurity B ~ 0.65',
    nominalPpm: 200,
    activeRtMin: 7.52,
    impurityName: 'Pantoprazole Sulfone (Impurity A)',
    impurityRtMin: 10.15,
    nominalArea: 2100000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Gradient)', comment: 'Phosphate buffer pH 7.0 : Acetonitrile' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Disperse tablet powder equivalent to 40 mg Pantoprazole in 100 mL 0.01 M NaOH, sonicate 20 min, filter through 0.45 µm PVDF.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Pantoprazole Sodium and Pantoprazole Sulfone CRS.',
      blank: 'Diluent (0.01 M NaOH).',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Pantoprazole degrades rapidly under acidic conditions; maintain basic pH with 0.01 M NaOH throughout sample handling.',
    },
    monographLimits: [
      { criterion: 'Pantoprazole Sulfone (Impurity A)', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Pantoprazole Sodium Working Standard', grade: 'Characterised WS', make: 'USP / In-house', batchNo: 'WS/PAN/2401' },
      { name: 'Pantoprazole Sulfone CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-PANS-01' },
      { name: 'Disodium Hydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'DHP-9102' },
      { name: 'Sodium Hydroxide', grade: 'AR grade', make: 'Rankem', batchNo: 'SH-2021' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  omeprazole: {
    productName: 'Omeprazole Gastro-Resistant Capsules BP 20 mg',
    labelClaim: 'Each capsule contains Omeprazole BP 20 mg (as enteric pellets)',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Omeprazole Capsules; Ph. Eur. Monograph 0942; USP Monograph; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'Inertsil ODS-2 C8 (4.6 mm × 150 mm, 5 µm) or USP L7',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.01 M Disodium Hydrogen Phosphate Buffer pH 7.6 (25 : 75 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 280 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 25 minutes at 30 °C',
    totalRunTime: '25 minutes',
    diluent: '0.01 M Sodium Hydroxide in Water : Acetonitrile (80:20 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Omeprazole (RT ~ 8.2 min): Omeprazole Sulfone (Impurity D) ~ 1.42; Omeprazole Sulfide ~ 0.58',
    nominalPpm: 200,
    activeRtMin: 8.22,
    impurityName: 'Omeprazole Sulfone (Impurity D)',
    impurityRtMin: 11.67,
    nominalArea: 1980000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '30 °C (Isocratic)', comment: 'Phosphate buffer pH 7.6 : ACN (75:25 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Crush enteric pellets from 20 capsules. Disperse powder containing 20 mg Omeprazole in 20 mL ACN, add 70 mL diluent, sonicate 20 min, dilute to 100 mL, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Standard containing Omeprazole and Omeprazole Sulfone CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo pellet matrix processed identically.',
      handlingNote: 'Keep solutions alkaline and protected from direct sunlight; prepare fresh before injection.',
    },
    monographLimits: [
      { criterion: 'Omeprazole Sulfone (Impurity D)', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Omeprazole BP Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/OMP/2403' },
      { name: 'Omeprazole Sulfone CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-OMPS-02' },
      { name: 'Disodium Hydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'DHP-9102' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  amlodipine: {
    productName: 'Amlodipine Besylate Tablets USP 5 mg',
    labelClaim: 'Each tablet contains Amlodipine Besylate eq. to Amlodipine 5 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Amlodipine Besylate Tablets; Ph. Eur. Monograph 1491; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Methanol : Acetonitrile : 0.03 M Triethylamine Buffer pH 3.0 (35 : 15 : 50 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 237 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Amlodipine (RT ~ 9.8 min): Amlodipine Related Compound A ~ 0.48; Impurity B ~ 1.35',
    nominalPpm: 200,
    activeRtMin: 9.84,
    impurityName: 'Amlodipine Related Compound A',
    impurityRtMin: 4.72,
    nominalArea: 1750000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Methanol : ACN : TEA buffer pH 3.0' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 20 mg Amlodipine into 100 mL volumetric flask, add 70 mL diluent, sonicate 25 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Amlodipine Besylate and Amlodipine Related Compound A RS.',
      blank: 'Mobile Phase.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Protect test solutions from light to avoid photo-induced pyridine oxidation.',
    },
    monographLimits: [
      { criterion: 'Amlodipine Related Compound A', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Amlodipine Besylate Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/AML/2402' },
      { name: 'Amlodipine Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-AMLA-01' },
      { name: 'Triethylamine', grade: 'HPLC grade', make: 'Merck', batchNo: 'TEA-1029' },
      { name: 'Methanol', grade: 'HPLC grade', make: 'Merck', batchNo: 'MEOH-7231' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  losartan: {
    productName: 'Losartan Potassium Tablets USP 50 mg',
    labelClaim: 'Each film-coated tablet contains Losartan Potassium USP 50 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Losartan Potassium Tablets; Ph. Eur. Monograph 2232; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.1 % v/v Phosphoric Acid in Water (40 : 60 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 250 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 25 minutes at 25 °C',
    totalRunTime: '25 minutes',
    diluent: 'Acetonitrile : Water (50:50 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Losartan (RT ~ 7.2 min): Losartan Related Compound A (triphenylmethanol) ~ 1.62; Impurity C ~ 0.72',
    nominalPpm: 200,
    activeRtMin: 7.24,
    impurityName: 'Losartan Related Compound A (Triphenylmethanol)',
    impurityRtMin: 11.73,
    nominalArea: 2240000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '25 °C (Gradient)', comment: 'Acetonitrile : 0.1% H3PO4 aqueous' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Crush 20 tablets. Dissolve powder containing 50 mg Losartan Potassium in 100 mL diluent, sonicate 20 min, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Losartan Potassium and Losartan Related Compound A RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Ensure complete dissolution by sonicating for full 20 minutes.',
    },
    monographLimits: [
      { criterion: 'Losartan Related Compound A', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Losartan Potassium Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/LOS/2401' },
      { name: 'Losartan Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-LOSA-02' },
      { name: 'Orthophosphoric Acid', grade: 'HPLC grade', make: 'Merck', batchNo: 'OPA-5521' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  rosuvastatin: {
    productName: 'Rosuvastatin Calcium Tablets USP 20 mg',
    labelClaim: 'Each tablet contains Rosuvastatin Calcium eq. to Rosuvastatin 20 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Rosuvastatin Calcium Tablets; Ph. Eur. Monograph 2631; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.05 M Ammonium Acetate buffer pH 4.0 : THF (30:60:10 v/v)',
    injectionTempOrFlowRate: '1.2 mL per minute',
    detectorTempOrWavelength: 'UV at 242 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 30 minutes at 35 °C',
    totalRunTime: '30 minutes',
    diluent: 'Acetonitrile : Water (50:50 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Rosuvastatin (RT ~ 8.6 min): Rosuvastatin Lactone (Impurity A) ~ 1.45; Anti-isomer ~ 0.85',
    nominalPpm: 200,
    activeRtMin: 8.62,
    impurityName: 'Rosuvastatin Lactone (Impurity A)',
    impurityRtMin: 12.50,
    nominalArea: 1950000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '35 °C (Gradient)', comment: 'Acetonitrile / Ammonium Acetate / THF' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Disperse powder containing 20 mg Rosuvastatin in 100 mL diluent, sonicate 20 min, filter through 0.45 µm PVDF.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Rosuvastatin Calcium and Rosuvastatin Lactone CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Rosuvastatin undergoes light-induced isomerization; protect all solutions from light.',
    },
    monographLimits: [
      { criterion: 'Rosuvastatin Lactone (Impurity A)', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.80 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Rosuvastatin Calcium Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/ROS/2401' },
      { name: 'Rosuvastatin Lactone CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-ROSL-01' },
      { name: 'Ammonium Acetate', grade: 'HPLC grade', make: 'Merck', batchNo: 'AA-9120' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  montelukast: {
    productName: 'Montelukast Sodium Tablets USP 10 mg',
    labelClaim: 'Each film-coated tablet contains Montelukast Sodium eq. to Montelukast 10 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Montelukast Sodium Tablets; Ph. Eur. Monograph 2583; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L11 Phenyl-Hexyl (4.6 mm × 150 mm, 3.5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.02 M Potassium Dihydrogen Phosphate pH 3.7 (60 : 40 v/v)',
    injectionTempOrFlowRate: '1.2 mL per minute',
    detectorTempOrWavelength: 'UV at 238 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 30 minutes at 40 °C',
    totalRunTime: '30 minutes',
    diluent: 'Methanol : Water (80:20 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Montelukast (RT ~ 8.2 min): Montelukast Sulfoxide (Impurity B) ~ 0.85; Montelukast Cis-isomer ~ 1.15',
    nominalPpm: 200,
    activeRtMin: 8.22,
    impurityName: 'Montelukast Sulfoxide (Impurity B)',
    impurityRtMin: 6.98,
    nominalArea: 2150000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '40 °C (Gradient)', comment: 'Phosphate buffer pH 3.7 : Acetonitrile' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Crush 20 tablets. Transfer powder containing 20 mg Montelukast into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to volume, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Montelukast Sodium and Montelukast Sulfoxide RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed identically.',
      handlingNote: 'Montelukast is highly light sensitive and oxidizes readily; use amber glassware.',
    },
    monographLimits: [
      { criterion: 'Montelukast Sulfoxide (Impurity B)', limit: 'NMT 0.15 %' },
      { criterion: 'Montelukast Cis-isomer', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Montelukast Sodium Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/MON/2401' },
      { name: 'Montelukast Sulfoxide RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-MONS-01' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  clopidogrel: {
    productName: 'Clopidogrel Bisulfate Tablets USP 75 mg',
    labelClaim: 'Each tablet contains Clopidogrel Bisulfate eq. to Clopidogrel 75 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'USP Monograph — Clopidogrel Tablets; Ph. Eur. Monograph 2531; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 150 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.05 M Potassium Phosphate Buffer pH 2.5 with 0.1% TEA (75 : 25 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 220 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 25 minutes at 30 °C',
    totalRunTime: '25 minutes',
    diluent: 'Methanol : Water (75:25 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Clopidogrel (RT ~ 8.8 min): Clopidogrel Related Compound A (Carboxylic Acid derivative) ~ 0.55; Impurity B ~ 1.25',
    nominalPpm: 250,
    activeRtMin: 8.82,
    impurityName: 'Clopidogrel Related Compound A (Carboxylic Acid)',
    impurityRtMin: 4.85,
    nominalArea: 2580000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '30 °C (Isocratic)', comment: 'Phosphate buffer pH 2.5 : ACN (25:75 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 75 mg Clopidogrel into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Clopidogrel Bisulfate and Clopidogrel Related Compound A RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Keep mobile phase fresh and maintain buffer pH 2.5 strictly.',
    },
    monographLimits: [
      { criterion: 'Clopidogrel Related Compound A', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Clopidogrel Bisulfate Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/CLP/2401' },
      { name: 'Clopidogrel Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-CLPA-02' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  acarbose: {
    productName: 'Acarbose Tablets USP 100 mg',
    labelClaim: 'Each tablet contains Acarbose USP 100 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'USP Monograph — Acarbose Tablets; Ph. Eur. Monograph 2089; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L8 Amino stationary phase (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.01 M Potassium Dihydrogen Phosphate Buffer pH 6.0 (75 : 25 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 210 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 25 minutes at 35 °C',
    totalRunTime: '25 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Acarbose (RT ~ 8.5 min): Impurity A ~ 0.72; Impurity B ~ 1.38',
    nominalPpm: 250,
    activeRtMin: 8.52,
    impurityName: 'Acarbose Impurity A',
    impurityRtMin: 6.13,
    nominalArea: 2420000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '35 °C (Isocratic)', comment: 'Phosphate buffer pH 6.0 : ACN (25:75 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 100 mg Acarbose into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Standard containing Acarbose and Acarbose Impurity A RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed identically.',
      handlingNote: 'Maintain column temperature at 35 °C for reproducible amino phase retention.',
    },
    monographLimits: [
      { criterion: 'Acarbose Impurity A', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.60 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Acarbose Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/ACA/2401' },
      { name: 'Acarbose Impurity A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-ACAA-01' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  levofloxacin: {
    productName: 'Levofloxacin Tablets USP 500 mg',
    labelClaim: 'Each film-coated tablet contains Levofloxacin Hemihydrate eq. to Levofloxacin 500 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Levofloxacin Tablets; Ph. Eur. Monograph 2592; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.1 % v/v Trifluoroacetic Acid in Water (20 : 80 v/v)',
    injectionTempOrFlowRate: '1.2 mL per minute',
    detectorTempOrWavelength: 'UV at 294 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Gradient elution over 30 minutes at 35 °C',
    totalRunTime: '30 minutes',
    diluent: 'Water : Acetonitrile (80:20 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Levofloxacin (RT ~ 6.5 min): Levofloxacin Related Compound A (Desfluoro) ~ 0.62; Impurity B (D-isomer / Ofloxacin) ~ 1.00; Impurity D ~ 1.35',
    nominalPpm: 250,
    activeRtMin: 6.52,
    impurityName: 'Levofloxacin Related Compound A (Desfluoro)',
    impurityRtMin: 4.04,
    nominalArea: 2850000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '35 °C (Gradient)', comment: '0.1% TFA aqueous : ACN' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 50 mg Levofloxacin into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Levofloxacin and Levofloxacin Related Compound A RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Protect test solutions from light to avoid photo-degradation of fluoroquinolone nucleus.',
    },
    monographLimits: [
      { criterion: 'Levofloxacin Related Compound A', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Levofloxacin Hemihydrate Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/LEV/2401' },
      { name: 'Levofloxacin Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-LEVA-01' },
      { name: 'Trifluoroacetic Acid (TFA)', grade: 'HPLC spectrophotometric grade', make: 'Merck', batchNo: 'TFA-9912' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  cetirizine: {
    productName: 'Cetirizine Hydrochloride Tablets BP 10 mg',
    labelClaim: 'Each film-coated tablet contains Cetirizine Hydrochloride BP 10 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Cetirizine Tablets; Ph. Eur. Monograph 1084; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'Inertsil ODS-3 C18 (4.6 mm × 150 mm, 5 µm) or USP L1',
    carrierGasOrMobilePhase: 'Acetonitrile : 0.05 M Potassium Dihydrogen Phosphate Buffer pH 6.0 (40 : 60 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 230 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 25 minutes at 25 °C',
    totalRunTime: '25 minutes',
    diluent: 'Acetonitrile : Water (40:60 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Cetirizine (RT ~ 7.2 min): Cetirizine Impurity A (Chlorobenzhydrylpiperazine) ~ 0.42; Impurity B ~ 1.55',
    nominalPpm: 200,
    activeRtMin: 7.22,
    impurityName: 'Cetirizine Impurity A ((4-chlorophenyl)phenylmethylpiperazine)',
    impurityRtMin: 3.03,
    nominalArea: 1920000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '25 °C (Isocratic)', comment: 'Phosphate buffer pH 6.0 : ACN (60:40 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 20 mg Cetirizine HCl into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Cetirizine HCl and Cetirizine Impurity A CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed identically.',
      handlingNote: 'Maintain mobile phase buffer pH at 6.0 ± 0.05 to ensure reproducible retention.',
    },
    monographLimits: [
      { criterion: 'Cetirizine Impurity A', limit: 'NMT 0.15 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.30 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Cetirizine Hydrochloride Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/CET/2401' },
      { name: 'Cetirizine Impurity A CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-CETA-01' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Acetonitrile', grade: 'HPLC grade', make: 'Honeywell', batchNo: 'ACN-8812' },
    ],
  },
  diclofenac: {
    productName: 'Diclofenac Sodium Delayed-Release Tablets USP 50 mg',
    labelClaim: 'Each enteric-coated tablet contains Diclofenac Sodium USP 50 mg',
    testParameter: 'Organic Impurities by HPLC with UV Detection',
    reference: 'USP Monograph — Diclofenac Sodium Delayed-Release Tablets; Ph. Eur. Monograph 1002; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Methanol : 0.01 M Phosphate Buffer pH 2.5 (70 : 30 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 254 nm',
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Methanol : Water (70:30 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Diclofenac (RT ~ 8.2 min): Diclofenac Related Compound A (Indolinone) ~ 0.45',
    nominalPpm: 250,
    activeRtMin: 8.24,
    impurityName: 'Diclofenac Related Compound A (1-(2,6-dichlorophenyl)indolin-2-one)',
    impurityRtMin: 3.71,
    nominalArea: 3100000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Phosphate buffer pH 2.5 : Methanol (30:70 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 enteric-coated tablets. Transfer powder containing 50 mg Diclofenac Sodium into 100 mL flask, add 70 mL diluent, sonicate 20 min, dilute to mark, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Solution containing Diclofenac Sodium and Diclofenac Related Compound A RS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Ensure enteric coating polymer is thoroughly dissolved by sonicating 20 min in diluent.',
    },
    monographLimits: [
      { criterion: 'Diclofenac Related Compound A', limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Diclofenac Sodium Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/DIC/2401' },
      { name: 'Diclofenac Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-DICA-01' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Methanol', grade: 'HPLC grade', make: 'Merck', batchNo: 'MEOH-7231' },
    ],
  },
  gabapentin: {
    productName: 'Gabapentin Capsules USP 300 mg',
    labelClaim: 'Each capsule contains Gabapentin USP 300 mg',
    testParameter: 'Related Substances (Gabapentin Related Compound A - Lactam) by HPLC',
    reference: 'USP Monograph — Gabapentin Capsules; Ph. Eur. Monograph 1425; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 (4.6 mm × 250 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Methanol : 0.01 M Monobasic Potassium Phosphate Buffer pH 6.2 (10 : 90 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: 'UV at 210 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 25 minutes at 25 °C',
    totalRunTime: '25 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Gabapentin (RT ~ 5.4 min): Gabapentin Related Compound A (Lactam) ~ 2.45',
    nominalPpm: 250,
    activeRtMin: 5.42,
    impurityName: 'Gabapentin Related Compound A (Gabapentin Lactam)',
    impurityRtMin: 13.28,
    nominalArea: 1720000,
    ovenProgramme: [
      { timeRange: '0 — 25', temperature: '25 °C (Isocratic)', comment: 'Phosphate buffer pH 6.2 : Methanol (90:10 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Empty 20 capsules, transfer powder equivalent to 150 mg Gabapentin into a 50 mL flask, add 35 mL diluent, sonicate 15 min, dilute to volume, filter.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 1.0 mL to 10.0 mL (0.1 % level).',
      systemSuitabilitySolution: 'Standard containing Gabapentin and Gabapentin Related Compound A RS (0.1 mg/mL).',
      blank: 'Diluent.',
      placeboSolution: 'Placebo capsule excipients processed identically.',
      handlingNote: 'Gabapentin lactam forms by intramolecular cyclization under acidic/heat conditions; maintain ambient temperature and neutral pH.',
    },
    monographLimits: [
      { criterion: 'Gabapentin Related Compound A (Lactam)', limit: 'NMT 0.10 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.10 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.40 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Gabapentin Working Standard', grade: 'Characterised WS', make: 'USP', batchNo: 'WS/GAB/2401' },
      { name: 'Gabapentin Related Compound A RS', grade: 'USP RS', make: 'USP', batchNo: 'RS-GABA-01' },
      { name: 'Potassium Dihydrogen Phosphate', grade: 'HPLC grade', make: 'Merck', batchNo: 'PDP-8812' },
      { name: 'Methanol', grade: 'HPLC grade', make: 'Merck', batchNo: 'MEOH-7231' },
    ],
  },
  tibolone: {
    productName: 'Tibolone Tablets BP 2.5 mg',
    labelClaim: 'Each tablet contains Tibolone BP 2.5 mg',
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV Detection',
    reference: 'BP Monograph — Tibolone Tablets; BP Appendix III D; ICH Q2(R2)',
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV/Vis Detector',
    column: 'Hypersil ODS C18 (4.6 mm × 100 mm, 5 µm)',
    carrierGasOrMobilePhase: 'Methanol : Water (77 : 23 v/v)',
    injectionTempOrFlowRate: '0.5 mL per minute',
    detectorTempOrWavelength: 'UV at 205 nm',
    injectionVolume: '20 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 40 °C',
    totalRunTime: '30 minutes',
    diluent: 'Methanol : Water (77:23 v/v)',
    internalStandard: 'N/A',
    relativeRetention: 'With reference to Tibolone (RT ~ 7.2 min): Delta-4-Tibolone (Impurity A) ~ 1.25; 3-alpha-hydroxytibolone ~ 0.75',
    nominalPpm: 200,
    activeRtMin: 7.22,
    impurityName: 'Delta-4-Tibolone (Impurity A)',
    impurityRtMin: 9.02,
    nominalArea: 1840000,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '40 °C (Isocratic)', comment: 'Methanol : Water (77:23 v/v)' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: 'Powder 20 tablets. Transfer powder containing 2.5 mg Tibolone into 50 mL flask, add 35 mL diluent, sonicate 20 min, dilute to mark, filter through 0.45 µm PTFE.',
      referenceSolution: 'Dilute 1.0 mL test solution to 100.0 mL with diluent. Dilute 2.0 mL to 10.0 mL (0.2 % level).',
      systemSuitabilitySolution: 'Solution containing Tibolone and Delta-4-Tibolone CRS.',
      blank: 'Diluent.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'UV detection at 205 nm requires spectroscopic grade methanol and thorough helium or vacuum degassing.',
    },
    monographLimits: [
      { criterion: 'Delta-4-Tibolone (Impurity A)', limit: 'NMT 0.50 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.20 %' },
      { criterion: 'Total impurities', limit: 'NMT 1.00 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: 'Tibolone BP Working Standard', grade: 'Characterised WS', make: 'In-house / BP', batchNo: 'WS/TIB/2401' },
      { name: 'Delta-4-Tibolone CRS', grade: 'Ph. Eur. CRS', make: 'EDQM', batchNo: 'CRS-D4T-01' },
      { name: 'Methanol R2', grade: 'Spectrophotometric HPLC grade', make: 'Merck', batchNo: 'MEOH-SP-01' },
      { name: 'Milli-Q Water', grade: 'Conductivity < 0.055 µS/cm', make: 'Millipore', batchNo: 'MQ-2024' },
    ],
  },
};

function adaptMonographToProduct(baseSeed: RSMonographSeed, targetName: string, targetApi?: string): RSMonographSeed {
  const cloned: RSMonographSeed = JSON.parse(JSON.stringify(baseSeed));
  const { strengthNum, unit } = parseProductStrength(targetName, targetApi);
  cloned.productName = targetName;
  if (strengthNum) {
    const cleanDrug = getCleanDrugDisplayName(targetName, cloned.activeSubstance || '');
    cloned.labelClaim = `Each tablet contains ${cleanDrug} ${strengthNum} ${unit}`;
    if (cloned.solutionPreparation && cloned.solutionPreparation.testSolution) {
      cloned.solutionPreparation.testSolution = cloned.solutionPreparation.testSolution.replace(
        /(?:equivalent to|containing)\s*\d+(?:\.\d+)?\s*(?:mg|g)\s+([A-Za-z]+)/gi,
        `equivalent to ${strengthNum}.0 mg $1`
      );
    }
  }
  return cloned;
}

export function getRSMonograph(productName: string, targetApi?: string): RSMonographSeed {
  if (!productName || !productName.trim()) {
    return RS_MONOGRAPH_LIBRARY.valproate;
  }
  const norm = productName.trim().toLowerCase();

  if (norm.includes('valproate') || norm.includes('valproic')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.valproate, productName);
  }
  if (norm.includes('paracetamol') || norm.includes('acetaminophen')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.paracetamol, productName);
  }
  if (norm.includes('metformin')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.metformin, productName);
  }
  if (norm.includes('ciprofloxacin')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.ciprofloxacin, productName);
  }
  if (norm.includes('atorvastatin')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.atorvastatin, productName);
  }
  if (norm.includes('ibuprofen')) {
    return adaptMonographToProduct(RS_MONOGRAPH_LIBRARY.ibuprofen, productName);
  }
  if (norm.includes('rosuvastatin')) {
    const is10mg = norm.includes('10');
    const base = RS_MONOGRAPH_LIBRARY.rosuvastatin;
    if (is10mg) {
      return adaptMonographToProduct({
        ...base,
        productName: 'Rosuvastatin Tablets 10 mg',
        labelClaim: 'Each tablet contains Rosuvastatin Calcium eq. to Rosuvastatin 10 mg',
        solutionPreparation: {
          ...base.solutionPreparation,
          testSolution: 'Powder 20 tablets. Disperse powder containing 10 mg Rosuvastatin in 50 mL diluent, sonicate 20 min, filter through 0.45 µm PVDF.',
        },
      }, productName);
    }
    return adaptMonographToProduct(base, productName);
  }

  // Check other keys
  for (const [k, v] of Object.entries(RS_MONOGRAPH_LIBRARY)) {
    if (norm.includes(k) || k.includes(norm)) {
      return adaptMonographToProduct(v, productName);
    }
  }

  // Procedural scientific compendial generation for any new drug
  const hash = hashString(productName);
  const rand = createSeededRandom(productName.toLowerCase());
  const { strengthNum, unit } = parseProductStrength(productName, targetApi);

  const isGC = false;
  const cleanDrug = getCleanDrugDisplayName(productName, 'Active Pharmaceutical Ingredient');
  const cleanDrugCode = (cleanDrug.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()) || 'ACT';

  const wavelengths = [215, 225, 238, 245, 254, 268, 275, 282];
  const chosenWavelength = wavelengths[Math.floor(rand() * wavelengths.length)];
  const nominalArea = computeNominalPeakArea(productName, chosenWavelength);

  const activeRt = Number((6.0 + rand() * 8.0).toFixed(2)); // 6.0 to 14.0 min
  const impurityRt = Number((activeRt * (0.45 + rand() * 0.35)).toFixed(2));
  const nominalPpm = 200 + Math.floor(rand() * 4) * 50; // 200, 250, 300, 350 ppm

  const impurityName = `${cleanDrug} Degradation Product (Impurity A)`;

  return {
    productName,
    labelClaim: `Each unit contains ${cleanDrug} ${strengthNum} ${unit}`,
    testParameter: 'Related Substances (Organic Impurities) by HPLC with UV/Vis Detection',
    reference: `BP / USP Monograph — ${productName}; ICH Q2(R2); USP <1226>`,
    technique: 'HPLC',
    detector: 'High Performance Liquid Chromatograph with UV Detector',
    column: 'USP L1 C18 stationary phase (250 mm × 4.6 mm, 5 µm)',
    carrierGasOrMobilePhase: '0.02 M Phosphate Buffer pH 3.2 : Acetonitrile (70:30 v/v)',
    injectionTempOrFlowRate: '1.0 mL per minute',
    detectorTempOrWavelength: `UV at ${chosenWavelength} nm`,
    injectionVolume: '10 µL',
    splitRatio: 'N/A',
    ovenProgrammeOrGradient: 'Isocratic for 30 minutes at 30 °C',
    totalRunTime: '30 minutes',
    diluent: 'Mobile Phase',
    internalStandard: 'N/A (External Standard)',
    relativeRetention: `With reference to ${cleanDrug} (RT ~ ${activeRt} min): ${impurityName} about ${(impurityRt / activeRt).toFixed(2)}`,
    nominalPpm,
    activeRtMin: activeRt,
    impurityName,
    impurityRtMin: impurityRt,
    internalStandardRtMin: undefined,
    nominalArea,
    ovenProgramme: [
      { timeRange: '0 — 30', temperature: '30 °C (Isocratic)', comment: 'Monograph validated condition' },
    ],
    solutionPreparation: {
      internalStandard: 'N/A',
      testSolution: `Weigh sample equivalent to ${nominalPpm} ppm active substance, dissolve in diluent, sonicate 15 min, filter.`,
      referenceSolution: `Dilute 1.0 mL test solution to 100.0 mL with diluent. Further dilute 1.0 mL to 10.0 mL (0.1 % level).`,
      systemSuitabilitySolution: `Standard solution containing ${cleanDrug} Reference Standard and ${impurityName}.`,
      blank: 'Mobile Phase.',
      placeboSolution: 'Placebo matrix processed under identical conditions.',
      handlingNote: 'Prepare solutions fresh on day of use; protect from direct light.',
    },
    monographLimits: [
      { criterion: impurityName, limit: 'NMT 0.20 %' },
      { criterion: 'Any other individual impurity', limit: 'NMT 0.15 %' },
      { criterion: 'Total impurities', limit: 'NMT 0.50 %' },
      { criterion: 'Disregard limit', limit: '0.05 %' },
    ],
    requirements: [
      { name: `${cleanDrug} Working Standard`, grade: 'Characterised WS', make: 'USP / In-house', batchNo: `WS/${cleanDrugCode}/2401` },
      { name: `${impurityName} Reference Standard`, grade: 'Official CRS', make: 'EDQM / USP', batchNo: `CRS-${cleanDrugCode}-01` },
      { name: 'HPLC Grade Solvents & Reagents', grade: 'HPLC / Spectroscopy grade', make: 'Merck / Honeywell', batchNo: 'SOLV-8821' },
    ],
  };
}

export function buildFullRSAMVData(
  productName: string,
  options?: {
    targetApi?: string;
    protocolNo?: string;
    protocolDate?: string;
    batchNo?: string;
    companyName?: string;
    reportDate?: string;
    effectiveDate?: string;
    verifiedMonograph?: Partial<RSMonographSeed>;
  }
): RSAMVDocumentData {
  const safeProductName = (productName && productName.trim()) ? productName.trim() : 'Sodium Valproate Oral Solution BP';
  let seed = getRSMonograph(safeProductName, options?.targetApi);
  if (options?.verifiedMonograph) {
    const cleanMonograph: Partial<RSMonographSeed> = {};
    for (const [k, v] of Object.entries(options.verifiedMonograph)) {
      if (v !== undefined && v !== null) {
        if (typeof v === 'string' && v.trim() !== '') {
          (cleanMonograph as any)[k] = v.trim();
        } else if (typeof v === 'number' && !isNaN(v)) {
          (cleanMonograph as any)[k] = v;
        }
      }
    }
    seed = { ...seed, ...cleanMonograph };
  }

  seed.productName = safeProductName;

  const extracted = extractDynamicLabelClaim(safeProductName, seed.testParameter, options?.targetApi || seed.activeSubstance || safeProductName.split(' ')[0], seed.labelClaim);
  let dynamicLabelClaim = extracted.labelClaim;
  let dynamicActiveSubstance = extracted.activeSubstance;

  const rawCompanyName = options?.companyName || 'WESTCOAST PHARMACEUTICAL WORKS LTD.';
  const companyName = rawCompanyName.replace(/\.+$/, '');

  const { strengthNum, unit } = parseProductStrength(safeProductName, options?.targetApi);
  if (strengthNum && (!dynamicLabelClaim || !dynamicLabelClaim.includes(`${strengthNum}`))) {
    dynamicLabelClaim = `Each tablet contains ${dynamicActiveSubstance} ${strengthNum} ${unit}`;
  }
  seed.labelClaim = dynamicLabelClaim;

  const nomPpm = seed.nominalPpm || (strengthNum ? strengthNum * 5 : 250);
  const p50 = Math.round(nomPpm * 0.5);
  const p75 = Math.round(nomPpm * 0.75);
  const p100 = nomPpm;
  const p125 = Math.round(nomPpm * 1.25);
  const p150 = Math.round(nomPpm * 1.5);

  const solPrep = { ...seed.solutionPreparation };
  if (solPrep.testSolution && strengthNum) {
    solPrep.testSolution = solPrep.testSolution.replace(
      /(?:equivalent to|containing)\s*\d+(?:\.\d+)?\s*(?:mg|g)\s+([A-Za-z]+)/gi,
      `equivalent to ${strengthNum}.0 mg $1`
    );
  }

  const rawReportDate = options?.reportDate || '20-Apr-2026';
  const parsedReport = parsePharmaDate(rawReportDate) || new Date(2026, 3, 20);
  const finalApprovalDate = formatPharmaDate(parsedReport);
  const reportDate = finalApprovalDate; // Header Report Date ALWAYS equals final approval date!

  const d1 = new Date(parsedReport);
  d1.setDate(d1.getDate() - 1);
  const reportPrepDate = formatPharmaDate(d1);

  const d2 = new Date(parsedReport);
  d2.setDate(d2.getDate() - 2);
  const executionDate = formatPharmaDate(d2);

  const d7 = new Date(parsedReport);
  d7.setDate(d7.getDate() - 7);
  const parsedProtocol = options?.protocolDate ? (parsePharmaDate(options.protocolDate) || d7) : d7;
  const protocolApprovalDate = formatPharmaDate(parsedProtocol);
  const protocolDate = protocolApprovalDate;

  const d8 = new Date(parsedProtocol);
  d8.setDate(d8.getDate() - 1);
  const protocolPrepDate = formatPharmaDate(d8);

  const docNo = options?.protocolNo || 'WC/QC/AMV/0285';
  const batchNo = options?.batchNo || `WC-${safeProductName.substring(0, 3).toUpperCase()}-2401`;

  const nominalArea = seed.nominalArea || computeNominalPeakArea(productName, 245);

  // 1. System Suitability Injections
  const ssMath = generateSystemSuitabilityInjections(seed.productName, nominalArea, 50.0, 5, seed.activeRtMin, 4850, 1.12);
  const ssInjections: RSSystemSuitabilityRow[] = ssMath.injections.map((inj) => ({
    srNo: inj.srNo,
    weightMg: inj.weightMg,
    retentionTime: inj.retentionTime,
    peakArea: inj.peakArea,
    tailingFactor: inj.tailingFactor,
    theoreticalPlates: inj.theoreticalPlates,
    remark: `Standard reference injection complies with system criteria`,
  }));

  // 2. Specificity
  const referenceStandardDisplayName = getCleanDrugDisplayName(seed.productName || productName, dynamicActiveSubstance);
  const specificityRows: RSSpecificityRow[] = [
    { solution: 'Blank Solution', retentionTime: '—', peakArea: 'No peak observed', interferenceObserved: 'Nil' },
    { solution: 'Placebo Solution', retentionTime: '—', peakArea: 'No peak observed at analyte retention window', interferenceObserved: 'Nil' },
    {
      solution: `Reference Standard (${referenceStandardDisplayName})`,
      retentionTime: `${seed.activeRtMin} min`,
      peakArea: '3,842,500',
      interferenceObserved: 'Nil — Baseline resolved',
    },
    {
      solution: `System Suitability (${seed.impurityName})`,
      retentionTime: `${seed.impurityRtMin} min`,
      peakArea: '148,200',
      interferenceObserved: 'Resolution = 2.45 (NLT 2.0)',
    },
    {
      solution: 'Finished Product Test Solution',
      retentionTime: `${seed.activeRtMin} min`,
      peakArea: '3,845,100',
      interferenceObserved: 'Complies',
    },
  ];

  // 3. Linearity Data (50% to 150%)
  const linMath = generateLinearityData(seed.productName, nomPpm, nominalArea, [50, 75, 100, 125, 150]);
  const linearityLevels: RSLinearityLevelRow[] = linMath.levels.map((lvl) => ({
    levelName: lvl.levelName,
    nominalPpm: lvl.concentrationPpm,
    weightTakenMg: lvl.nominalWeightMg,
    finalDilution: `${lvl.dilutionVolumeMl} mL`,
    meanArea: lvl.peakArea,
  }));

  // 4. Range (75% and 125%)
  const randRange = createSeededRandom(`${seed.productName.toLowerCase()}_rs_range`);
  const area75 = linearityLevels[1]?.meanArea || Math.round(nominalArea * 0.75);
  const area125 = linearityLevels[3]?.meanArea || Math.round(nominalArea * 1.25);

  const rangeRows: RSRangeRow[] = [
    { srNo: 1, levelPpm: p75, sampleId: 'Level II (75 %) — Inj 1', peakArea: Math.round(Number(area75) * (1 + (randRange() - 0.5) * 0.004)) },
    { srNo: 2, levelPpm: p75, sampleId: 'Level II (75 %) — Inj 2', peakArea: Math.round(Number(area75) * (1 + (randRange() - 0.5) * 0.004)) },
    { srNo: 3, levelPpm: p75, sampleId: 'Level II (75 %) — Inj 3', peakArea: Math.round(Number(area75) * (1 + (randRange() - 0.5) * 0.004)) },
    { srNo: 4, levelPpm: p125, sampleId: 'Level IV (125 %) — Inj 1', peakArea: Math.round(Number(area125) * (1 + (randRange() - 0.5) * 0.004)) },
    { srNo: 5, levelPpm: p125, sampleId: 'Level IV (125 %) — Inj 2', peakArea: Math.round(Number(area125) * (1 + (randRange() - 0.5) * 0.004)) },
    { srNo: 6, levelPpm: p125, sampleId: 'Level IV (125 %) — Inj 3', peakArea: Math.round(Number(area125) * (1 + (randRange() - 0.5) * 0.004)) },
  ];

  const a75 = rangeRows.slice(0, 3).map((r) => Number(r.peakArea));
  const m75 = Math.round(a75.reduce((a, b) => a + b, 0) / 3);
  const sd75 = Number(Math.sqrt(a75.reduce((acc, a) => acc + Math.pow(a - m75, 2), 0) / 2).toFixed(1));
  const rsd75 = Number(((sd75 / m75) * 100).toFixed(2));

  const a125 = rangeRows.slice(3, 6).map((r) => Number(r.peakArea));
  const m125 = Math.round(a125.reduce((a, b) => a + b, 0) / 3);
  const sd125 = Number(Math.sqrt(a125.reduce((acc, a) => acc + Math.pow(a - m125, 2), 0) / 2).toFixed(1));
  const rsd125 = Number(((sd125 / m125) * 100).toFixed(2));

  // 5. Precision (Repeatability) - Content percentage around nominal
  const precMath = generatePrecisionData(seed.productName, strengthNum, nominalArea, 99.85);
  const precisionRows: RSPrecisionRow[] = precMath.analyst1.rows.map((r, i) => ({
    srNo: r.determinationNo,
    sampleId: `Finished Product Prep ${i + 1}`,
    volumeUsed: '10.0 mL',
    peakArea: r.peakArea,
    contentPercentLa: r.percentAssayOrDissolved,
  }));

  // 6. LOD & LOQ
  const lodLoqConfirmationRows: RSLodLoqConfirmationRow[] = [
    { srNo: 1, level: 'Limit of Detection (LOD)', concentrationPpm: Number((nomPpm * 0.033).toFixed(2)), peakArea: Math.round(nominalArea * 0.033), snRatio: '4.8 : 1 (NLT 3:1)' },
    { srNo: 2, level: 'Limit of Quantification (LOQ)', concentrationPpm: Number((nomPpm * 0.10).toFixed(2)), peakArea: Math.round(nominalArea * 0.10), snRatio: '14.2 : 1 (NLT 10:1)' },
  ];

  const randLoq = createSeededRandom(`${seed.productName.toLowerCase()}_loq`);
  const loqBaseArea = Math.round(nominalArea * 0.10);
  const loqPrecisionRows: RSLoqPrecisionRow[] = [1, 2, 3, 4, 5, 6].map((i) => ({
    srNo: i,
    peakArea: Math.round(loqBaseArea * (1 + (randLoq() - 0.5) * 0.025)),
    contentPercentLa: 0.10,
    remark: 'Complies',
  }));

  const loqAreas = loqPrecisionRows.map((r) => Number(r.peakArea));
  const loqMean = Math.round(loqAreas.reduce((a, b) => a + b, 0) / 6);
  const loqSd = Number(Math.sqrt(loqAreas.reduce((acc, a) => acc + Math.pow(a - loqMean, 2), 0) / 5).toFixed(1));
  const loqRsd = Number(((loqSd / loqMean) * 100).toFixed(2));

  // 7. Intermediate Precision
  const intermediatePrecisionRows: RSIntermediatePrecisionRow[] = precMath.analyst1.rows.map((r1, i) => {
    const r2 = precMath.analyst2.rows[i];
    return {
      srNo: r1.determinationNo,
      analyst1Volume: '10.0 mL',
      analyst1Area: r1.peakArea,
      analyst1Content: r1.percentAssayOrDissolved,
      analyst2Volume: '10.0 mL',
      analyst2Area: r2.peakArea,
      analyst2Content: r2.percentAssayOrDissolved,
    };
  });

  // 8. Accuracy & Recovery (Triplicate across 3 levels)
  const accMath = generateAccuracyRecoveryData(seed.productName, nomPpm, [75, 100, 125], nominalArea);
  let accSr = 1;
  const accuracyRecoveryRows: RSAccuracyRecoveryRow[] = [];
  for (const lvl of accMath.levels) {
    for (const rep of lvl.replicates) {
      const repArea = Math.round((lvl.levelPercent / 100) * nominalArea * (rep.percentRecovery / 100));
      accuracyRecoveryRows.push({
        srNo: accSr++,
        levelPpm: lvl.levelPercent,
        standardSpikedMg: rep.amountAddedMg,
        sampleArea: repArea,
        amountRecoveredMg: rep.amountRecoveredMg,
        percentRecovery: rep.percentRecovery,
      });
    }
  }

  const platesCriteria = 'NLT 1500';

  // 9. Validation Parameters Table
  const validationParameters: RSValidationParameterCriteria[] = [
    {
      srNo: '5.1',
      parameter: 'System Suitability',
      acceptanceCriteria: `Resolution between ${seed.impurityName} and main active peak NLT 2.0; %RSD of peak response NMT 2.0 %; theoretical plates ${platesCriteria}; tailing factor NMT 1.5.`,
      resultRemark: `Resolution 2.45; %RSD ${ssMath.rsdArea} %; Theoretical plates 2840; Tailing 1.15 — Complies`,
    },
    {
      srNo: '5.2',
      parameter: 'Specificity',
      acceptanceCriteria: 'No interference from blank or placebo matrix at retention times of active drug and specified impurities.',
      resultRemark: 'No interfering peaks observed at critical retention times — Complies',
    },
    {
      srNo: '5.3',
      parameter: 'Linearity',
      acceptanceCriteria: `Correlation coefficient (r²) ≥ 0.995 over ${p50} ppm to ${p150} ppm; slope and y-intercept to be reported.`,
      resultRemark: `r² = ${linMath.regression.rSquared} over ${p50} ppm to ${p150} ppm — Complies`,
    },
    {
      srNo: '5.4',
      parameter: 'Range',
      acceptanceCriteria: `%RSD of peak response ≤ 2.0 % at ${p75} ppm and ${p125} ppm.`,
      resultRemark: `%RSD at ${p75} ppm: ${rsd75} %; %RSD at ${p125} ppm: ${rsd125} % — Complies`,
    },
    {
      srNo: '5.5',
      parameter: 'Precision (Repeatability)',
      acceptanceCriteria: '%RSD of content for six determinations NMT 2.0 %.',
      resultRemark: `%RSD of six determinations: ${precMath.analyst1.rsd} % — Complies`,
    },
    {
      srNo: '5.6',
      parameter: 'LOD and LOQ',
      acceptanceCriteria: 'Signal-to-noise (S/N) ratio at LOD NLT 3:1; at LOQ NLT 10:1; %RSD at LOQ NMT 5.0 %.',
      resultRemark: `LOD S/N = 4.8; LOQ S/N = 14.2; %RSD at LOQ = ${loqRsd} % — Complies`,
    },
    {
      srNo: '5.7',
      parameter: 'Intermediate Precision',
      acceptanceCriteria: '%RSD of content NMT 2.0 % for each analyst; cumulative %RSD for twelve results NMT 2.0 %.',
      resultRemark: `Analyst 1 %RSD ${precMath.analyst1.rsd} %; Analyst 2 %RSD ${precMath.analyst2.rsd} %; Cumulative %RSD ${precMath.cumulative.rsd} % — Complies`,
    },
    {
      srNo: '5.8',
      parameter: 'Accuracy (Recovery)',
      acceptanceCriteria: `Mean recovery at ${p75} ppm, ${p100} ppm and ${p125} ppm between 98.0 % and 102.0 %; %RSD ≤ 2.0 %.`,
      resultRemark: `Overall mean recovery = ${accMath.overallMean} %; %RSD = ${accMath.overallRsd} % — Complies`,
    },
  ];

  const reportNumber = docNo.includes('/AMV/') ? docNo.replace('/AMV/', '/AMVR/') : `${docNo}/R`;

  const doc: RSAMVDocumentData = {
    companyName,
    documentTitle: `ANALYTICAL METHOD VALIDATION PROTOCOL / REPORT FOR ORGANIC IMPURITY (RELATED SUBSTANCES) BY ${seed.technique}`,
    subTitle: `(${seed.technique === 'GC' ? 'Organic Impurity by Gas Chromatography' : 'Related Substances by HPLC'})`,
    protocolNo: docNo,
    protocolDate: protocolDate,
    reportNo: reportNumber,
    reportDate: reportDate,
    productName: safeProductName,
    labelClaim: dynamicLabelClaim,
    testParameter: seed.testParameter,
    reference: seed.reference,
    batchNoUsed: batchNo,

    signOffs: {
      preparedBy: {
        designation: 'Chemist, Quality Control',
        name: 'Riya Patel',
        signature: 'Signed',
        date: reportPrepDate,
        dateProtocol: protocolPrepDate,
        dateReport: reportPrepDate,
      },
      checkedBy: {
        designation: 'Executive, Quality Control',
        name: 'Jeel Patel',
        signature: 'Signed',
        date: reportPrepDate,
        dateProtocol: protocolPrepDate,
        dateReport: reportPrepDate,
      },
      reviewedBy: {
        designation: 'Manager, Quality Assurance',
        name: 'Anil Parmar',
        signature: 'Signed',
        date: reportDate,
        dateProtocol: protocolApprovalDate,
        dateReport: reportDate,
      },
      authorisedBy: {
        designation: 'General Manager, Quality (Head QA/QC)',
        name: 'Suresh Shah',
        signature: 'Signed',
        date: reportDate,
        dateProtocol: protocolApprovalDate,
        dateReport: reportDate,
      },
    },

    objective: `To validate the analytical method for the determination of Organic Impurity (Related Substances) in ${seed.productName} by ${
      seed.technique === 'GC' ? 'gas chromatography' : 'high performance liquid chromatography'
    }, and to demonstrate that the procedure is suitable for its intended purpose and gives specific, linear, accurate, and precise results under standard laboratory operating conditions as per ${seed.reference}.`,

    scope: `This document is applicable to the validation of the ${
      seed.technique === 'GC' ? 'gas chromatographic' : 'liquid chromatographic'
    } method for Organic Impurities of ${seed.productName} in the Quality Control laboratory of ${companyName}.`,

    referenceDetails: {
      reference: seed.reference,
      typeOfStudy: `Method Validation of Organic Impurities as per ICH Q2(R2) and ${seed.reference.split(';')[0]}`,
      testToBeValidated: seed.testParameter,
      validationTeam: 'Analyst 1 — Riya Patel (Chemist, QC); Analyst 2 — Jeel Patel (Executive, QC); under supervision of Anil Parmar (Manager, QC)',
      experimentalDetails: `System suitability, specificity, linearity (${p50} ppm to ${p150} ppm), range (${p75} ppm and ${p125} ppm), repeatability, LOD/LOQ confirmation, intermediate precision, and accuracy across 3 levels in triplicate.`,
    },

    methodSummary: {
      chromatographicConditions: {
        instrumentDetector: seed.technique === 'GC' ? 'Gas Chromatograph with FID Detector and Headspace / Split Autosampler' : 'High Performance Liquid Chromatograph with UV/Vis Detector',
        column: seed.column,
        carrierGasOrMobilePhase: seed.carrierGasOrMobilePhase,
        injectionTempOrFlowRate: seed.injectionTempOrFlowRate,
        detectorTempOrWavelength: seed.detectorTempOrWavelength,
        injectionVolume: seed.injectionVolume,
        splitRatio: seed.splitRatio,
        ovenProgrammeOrGradient: seed.ovenProgrammeOrGradient,
        totalRunTime: seed.totalRunTime,
        diluent: seed.diluent,
        internalStandard: seed.internalStandard,
        relativeRetention: seed.relativeRetention,
      },
      ovenProgramme: seed.ovenProgramme,
      solutionPreparation: solPrep,
      monographLimits: seed.monographLimits,
      requirements: seed.requirements,
    },

    validationParameters,

    systemSuitability: {
      injections: ssInjections,
      stats: {
        meanArea: ssMath.meanArea,
        sdArea: ssMath.sdArea,
        rsdArea: ssMath.rsdArea,
        tailingFactor: 1.15,
        theoreticalPlates: 2840,
        theoreticalPlatesCriteria: platesCriteria,
        resolution: 2.45,
        conclusionProtocol: 'The system suitability parameters shall be verified prior to starting the sample analysis sequence.',
        conclusionReport: `The system suitability test complies with all acceptance criteria (%RSD of peak area = ${ssMath.rsdArea} %, Resolution = 2.45, Plates = 2840, Tailing = 1.15). The chromatographic system is verified as suitable.`,
      },
    },

    specificity: {
      rows: specificityRows,
      conclusionProtocol: 'Specificity shall be demonstrated by establishing the absence of interfering peaks at the retention windows of the analyte and impurities.',
      conclusionReport: 'No interfering peaks were observed in blank or placebo chromatograms at the retention windows of the active drug and specified impurities. The method is specific.',
    },

    linearityAndRange: {
      linearityLevels,
      regression: {
        rSquared: linMath.regression.rSquared,
        slope: linMath.regression.slope,
        yIntercept: linMath.regression.yIntercept,
        sdYIntercepts: Number(((Number((nomPpm * 0.10).toFixed(2)) * linMath.regression.slope) / 10).toFixed(1)),
        conclusionProtocol: `Linearity will be evaluated from ${p50} ppm to ${p150} ppm with acceptance criteria r² ≥ 0.995.`,
        conclusionReport: `The linear regression analysis yielded a correlation coefficient (r²) of ${linMath.regression.rSquared}, exceeding the threshold of 0.995. Excellent linearity is confirmed across ${p50} ppm to ${p150} ppm.`,
      },
      rangeRows,
      rangeStats: [
        { levelPpm: p75, mean: m75, sd: sd75, rsd: rsd75 },
        { levelPpm: p125, mean: m125, sd: sd125, rsd: rsd125 },
      ],
      rangeConclusionProtocol: `Range will be verified at ${p75} ppm and ${p125} ppm with %RSD ≤ 2.0 %.`,
      rangeConclusionReport: `%RSD at ${p75} ppm is ${rsd75} % and at ${p125} ppm is ${rsd125} % (both ≤ 2.0 %). The analytical range is validated.`,
    },

    precision: {
      rows: precisionRows,
      stats: {
        meanContent: precMath.analyst1.meanPercent,
        sd: precMath.analyst1.sd,
        rsd: precMath.analyst1.rsd,
        conclusionProtocol: 'Six independent preparations of the finished product will be tested. %RSD must be NMT 2.0 %.',
        conclusionReport: `The %RSD of six determinations is ${precMath.analyst1.rsd} % (NMT 2.0 %). Repeatability is confirmed.`,
      },
    },

    lodLoq: {
      confirmationRows: lodLoqConfirmationRows,
      loqPrecisionRows,
      loqStats: {
        meanArea: loqMean,
        sdArea: loqSd,
        rsdArea: loqRsd,
        meanContent: 0.10,
        rsdContent: loqRsd,
        conclusionProtocol: 'Six replicate injections of the LOQ solution shall show %RSD NMT 5.0 %.',
        conclusionReport: `Six replicate injections of the LOQ solution yielded %RSD of ${loqRsd} % (NMT 5.0 %). The limit of quantitation is verified.`,
      },
      conclusionProtocol: 'LOD and LOQ will be established based on signal-to-noise ratio and verified by precision at LOQ.',
      conclusionReport: `LOD S/N is 4.8:1 and LOQ S/N is 14.2:1. Six replicate injections at LOQ yielded %RSD of ${loqRsd} % (NMT 5.0 %). LOD and LOQ are validated.`,
    },

    intermediatePrecision: {
      rows: intermediatePrecisionRows,
      stats: {
        analyst1Mean: precMath.analyst1.meanPercent,
        analyst1Sd: precMath.analyst1.sd,
        analyst1Rsd: precMath.analyst1.rsd,
        analyst2Mean: precMath.analyst2.meanPercent,
        analyst2Sd: precMath.analyst2.sd,
        analyst2Rsd: precMath.analyst2.rsd,
        cumulativeMean: precMath.cumulative.meanPercent,
        cumulativeSd: precMath.cumulative.sd,
        cumulativeRsd: precMath.cumulative.rsd,
        diffBetweenMeans: Number(Math.abs(precMath.analyst1.meanPercent - precMath.analyst2.meanPercent).toFixed(2)),
        conclusionProtocol: 'Two analysts will perform independent precision testing on different days. Cumulative %RSD must be NMT 2.0 %.',
        conclusionReport: `Analyst 1 %RSD is ${precMath.analyst1.rsd} %, Analyst 2 %RSD is ${precMath.analyst2.rsd} %, and cumulative %RSD for twelve determinations is ${precMath.cumulative.rsd} % (NMT 2.0 %). Intermediate precision is established.`,
      },
    },

    accuracy: {
      rows: accuracyRecoveryRows,
      stats: {
        levelStats: [
          { levelPpm: p75, meanRecovery: accMath.levels[0]?.meanRecovery || 99.8, sdRecovery: 0.4, rsdRecovery: 0.4 },
          { levelPpm: p100, meanRecovery: accMath.levels[1]?.meanRecovery || 99.9, sdRecovery: 0.35, rsdRecovery: 0.35 },
          { levelPpm: p125, meanRecovery: accMath.levels[2]?.meanRecovery || 100.1, sdRecovery: 0.38, rsdRecovery: 0.38 },
        ],
        overallMeanRecovery: accMath.overallMean,
        overallRsd: accMath.overallRsd,
        conclusionProtocol: `Recovery will be assessed at ${p75} ppm, ${p100} ppm, and ${p125} ppm in triplicate. Mean recovery must be 98.0 % – 102.0 % with %RSD ≤ 2.0 %.`,
        conclusionReport: `Mean recoveries are: 75 % level = ${accMath.levels[0]?.meanRecovery} %, 100 % level = ${accMath.levels[1]?.meanRecovery} %, 125 % level = ${accMath.levels[2]?.meanRecovery} %. Overall %RSD is ${accMath.overallRsd} % (NMT 2.0 %). Method accuracy is validated.`,
      },
    },

    overallConclusionProtocol: `To validate the analytical method for the determination of Organic Impurity (Related Substances) in ${seed.productName} by ${
      seed.technique === 'GC' ? 'gas chromatography' : 'high performance liquid chromatography'
    }, and to demonstrate that the procedure is suitable for its intended purpose and gives specific, linear, accurate, and precise results under standard laboratory operating conditions as per ${seed.reference}.`,

    overallConclusionReport: `The analytical method for the determination of Organic Impurities (Related Substances) in ${seed.productName} has been validated in accordance with ${
      seed.reference.includes('ICH Q2(R2)') ? seed.reference : `${seed.reference} and ICH Q2(R2)`
    }. All validation parameters meet predefined acceptance criteria. The method is declared validated for routine QC testing.`,

    completionRecord: [
      {
        particulars: 'Protocol Preparation',
        details: 'Prepared by Chemist QC',
        signatureDate: `Signed / ${protocolPrepDate}`,
        detailsProtocol: 'Prepared by Chemist QC',
        signatureDateProtocol: `Signed / ${protocolPrepDate}`,
        detailsReport: 'Prepared by Chemist QC',
        signatureDateReport: `Signed / ${protocolPrepDate}`,
      },
      {
        particulars: 'Protocol Approval',
        details: 'Approved by Head QA/QC',
        signatureDate: `Signed / ${protocolApprovalDate}`,
        detailsProtocol: 'Approved by Head QA/QC',
        signatureDateProtocol: `Signed / ${protocolApprovalDate}`,
        detailsReport: 'Approved by Head QA/QC',
        signatureDateReport: `Signed / ${protocolApprovalDate}`,
      },
      {
        particulars: 'Verification Execution',
        details: `Executed by Analytical Team (${executionDate})`,
        signatureDate: `Signed / ${executionDate}`,
        detailsProtocol: 'To be executed as per approved protocol',
        signatureDateProtocol: '—',
        detailsReport: 'Executed by Analytical Team',
        signatureDateReport: `Signed / ${executionDate}`,
      },
      {
        particulars: 'Report Preparation',
        details: 'Compiled with all chromatographic data and integration reports',
        signatureDate: `Signed / ${reportPrepDate}`,
        detailsProtocol: 'To be compiled with chromatograms upon execution',
        signatureDateProtocol: '—',
        detailsReport: 'Compiled with all chromatographic data and integration reports',
        signatureDateReport: `Signed / ${reportPrepDate}`,
      },
      {
        particulars: 'Final Report Approval',
        details: 'Authorised by Head QA/QC',
        signatureDate: `Signed / ${finalApprovalDate}`,
        detailsProtocol: 'To be authorised upon completion',
        signatureDateProtocol: '—',
        detailsReport: 'Authorised by Head QA/QC',
        signatureDateReport: `Signed / ${finalApprovalDate}`,
      },
    ],

    abbreviations: [
      { abbreviation: 'AMV', expansion: 'Analytical Method Validation' },
      { abbreviation: 'RS', expansion: 'Related Substances' },
      { abbreviation: 'HPLC', expansion: 'High Performance Liquid Chromatography' },
      { abbreviation: 'UV', expansion: 'Ultraviolet Detector' },
      { abbreviation: 'LA', expansion: 'Label Amount / Claim' },
      { abbreviation: 'LOD', expansion: 'Limit of Detection' },
      { abbreviation: 'LOQ', expansion: 'Limit of Quantification' },
      { abbreviation: 'RSD', expansion: 'Relative Standard Deviation' },
      { abbreviation: 'SD', expansion: 'Standard Deviation' },
      { abbreviation: 'S/N', expansion: 'Signal-to-Noise Ratio' },
      { abbreviation: 'BP', expansion: 'British Pharmacopoeia' },
      { abbreviation: 'USP', expansion: 'United States Pharmacopeia' },
      { abbreviation: 'ICH', expansion: 'International Council for Harmonisation' },
    ],

    revisionHistory: [
      {
        version: '00',
        effectiveDate: reportDate,
        docNumber: reportNumber,
        reason: `Analytical Method Validation study report issued as ${reportNumber} for Organic Impurities in ${safeProductName} by ${seed.technique}. Validates chromatographic system parameters (Stationary phase ${seed.column}, mobile phase ${seed.carrierGasOrMobilePhase}, detector ${seed.detectorTempOrWavelength}, flow rate ${seed.injectionTempOrFlowRate}) with complete system suitability, LOQ, LOD, linearity, precision, and accuracy under ICH Q2(R2).`,
      },
    ],
  };

  // Rule 6: Filter abbreviations so only terms actually appearing in the document text are listed
  const docText = JSON.stringify({ ...doc, abbreviations: [] });
  const isVerif = (doc.referenceDetails.reference || '').includes('1226') || (doc.referenceDetails.typeOfStudy || '').toLowerCase().includes('verification');
  doc.abbreviations = filterUsedAbbreviations(doc.abbreviations || [], docText, isVerif);

  return postProcessSanitizeDocument(doc, 'related_substances');
}
