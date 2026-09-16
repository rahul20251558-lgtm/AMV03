import fs from 'fs';
let content = fs.readFileSync('src/services/mltPharmaDatabase.ts', 'utf-8');
content = `import { parseProductStrength } from './pharmaMathEngine';
import { generateUniqueValidationCodes } from './pharmaDatabase';
` + content;

content = content.replace(
  /export function generateMLTAMVDataForProduct\([^)]+\): MLTDocumentData \{/g,
  `export function generateMLTAMVDataForProduct(
  productName: string,
  batchNo: string,
  overrides?: Partial<MLTDocumentData>
): MLTDocumentData {
  const codes = generateUniqueValidationCodes(productName);
  const derivedBatch = batchNo || codes.batchNo;
  const { strengthNum, unit } = parseProductStrength(productName);
  const safeStrength = \`\${strengthNum} \${unit}\`;
`
);

content = content.replace(
  /const baseData: MLTDocumentData = \{[\s\S]*?productName,[\s\S]*?strength: '10 mg',[\s\S]*?protocolNo: \`MLTP-26-001\`,[\s\S]*?reportNo: \`MLTR-26-001\`,[\s\S]*?return \{ \.\.\.baseData, \.\.\.overrides \};\n\}/g,
  `const baseData: MLTDocumentData = {
    productName,
    strength: safeStrength,
    dosageForm: 'Tablets',
    batchNo: derivedBatch,
    arNo: \`AR-\${derivedBatch}\`,
    mfgDate: formatRelDate(now, -6, 1),
    sampleQty_g: 10,
    protocolNo: codes.documentNo.replace('AMV-', 'MLTP-'),
    protocolDate,
    reportNo: codes.documentNo.replace('AMV-', 'MLTR-'),
    reportDate,
    analysisStartDate,
    analysisEndDate,
    specTAMC_cfu_per_g: 1000,
    specTYMC_cfu_per_g: 100,
    specifiedOrganismsSpec: 'Escherichia coli: Absent in 1 g',
    references: ['USP <61>', 'USP <62>', 'USP <1111>'],
    organisms,
    media,
    equipment,
    samplePrepDiluent: 'Buffered Sodium Chloride-Peptone Solution pH 7.0',
    samplePrepFactor: 10,
    aliquot_mL: 10,
    diluent_mL: 90,
    inoculumCfuPerMl: 800,
    inoculumVolumeAdded_mL: 0.1,
    suitabilityRows,
    recoveryRows,
    controlsRows: [],
    specifiedOrganismRows,
    routineMethodSelected: 'Membrane Filtration',
    companyName: 'Pharma QC Labs',
    preparedBy: 'Microbiologist',
    checkedBy: 'Microbiology Reviewer',
    reviewedBy: 'QA Manager',
    approvedBy: 'Lab Head',
  };
  return { ...baseData, ...overrides };
}`
);
fs.writeFileSync('src/services/mltPharmaDatabase.ts', content);
