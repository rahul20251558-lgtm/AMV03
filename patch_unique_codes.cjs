const fs = require('fs');

let content = fs.readFileSync('src/services/pharmaDatabase.ts', 'utf-8');

const replacement = `export function generateUniqueValidationCodes(productName: string): UniqueCodes {
  // Derive prefix from product name
  const words = productName.split(/[\\s,-]+/).filter(w => /^[a-zA-Z]+$/.test(w) && w.toLowerCase() !== 'tablets' && w.toLowerCase() !== 'capsules');
  let code = 'UNK';
  if (words.length > 0) {
    if (words.length >= 2 && words[0].length >= 2 && words[1].length >= 1) {
       code = words[0].substring(0, 2).toUpperCase() + words[1].substring(0, 1).toUpperCase();
    } else {
       code = words[0].substring(0, 3).toUpperCase();
    }
  }

  // Sequence based on Date for uniqueness when refreshed/generated
  const now = new Date();
  const yymm = now.getFullYear().toString().substring(2) + (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Use a short random string or milliseconds portion for the seq
  // So it doesn't just stick to the same default for all products.
  const seq = Math.floor(Math.random() * 899) + 100; // 100 to 999

  const docNo = \`AMV-\${code}-\${yymm}-\${seq}\`;
  const batchNo = \`VAL-\${code}-\${yymm}\${seq}\`;
  const stdLot = \`RS-\${code}-\${yymm}\`;

  return {
    documentNo: docNo,
    validationBatchNo: batchNo,
    standardLotNo: stdLot,
    referenceStandardLot: stdLot,
    effectiveDate: "21-Apr-2026",
    supersedes: "New Method Protocol",
    preparedDate: "15-Apr-2026",
    reviewedDate: "18-Apr-2026",
    approvedDate: "20-Apr-2026"
  };
}`;

content = content.replace(/export function generateUniqueValidationCodes\(productName: string\): UniqueCodes \{[\s\S]*?return \{[\s\S]*?\};\n\}/, replacement);

fs.writeFileSync('src/services/pharmaDatabase.ts', content, 'utf-8');
console.log("Patched generateUniqueValidationCodes.");
