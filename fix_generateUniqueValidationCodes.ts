import fs from 'fs';
let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

const replacement = `
export function generateUniqueValidationCodes(productName: string): UniqueCodes & { batchNo: string } {
  const hash = hashString(productName);
  
  const pad = (n: number) => n.toString().padStart(3, '0');
  
  const docBase = Math.abs(hash) % 10000;
  const documentNo = \`AMV-UNK-2604-\${pad(docBase)}\`;
  
  const batchBase = Math.abs(hash) % 1000;
  const validationBatchNo = \`B\${pad(batchBase)}\`;
  const standardLotNo = \`RS\${pad(batchBase)}\`;
  const referenceStandardLot = \`REF-\${pad(batchBase)}\`;
  
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
`;

content = content.replace(
  /export function getBaseMonograph/m,
  replacement
);

fs.writeFileSync('src/services/pharmaDatabase.ts', content);
