const fs = require('fs');

let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(safeProductName);",
  "const { strengthNum, unit } = parseProductStrength(safeProductName, options?.targetApi);"
);

// We should also replace the targetName one, if it's called from buildFullRSAMVData
// Let's pass targetApi to getRSMonograph and inferRSMonograph, maybe?
// Let's check `generateAccuracyRecoveryDataRS`.
content = content.replace(
  "export function generateAccuracyRecoveryDataRS(productName: string, levels: number[]):",
  "export function generateAccuracyRecoveryDataRS(productName: string, levels: number[], targetApi?: string):"
);
content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(targetName);",
  "const { strengthNum, unit } = parseProductStrength(targetName, targetApi);"
);

// Where generateAccuracyRecoveryDataRS is called:
content = content.replace(
  "const accMath = generateAccuracyRecoveryDataRS(safeProductName, [50, 100, 150]);",
  "const accMath = generateAccuracyRecoveryDataRS(safeProductName, [50, 100, 150], options?.targetApi);"
);

fs.writeFileSync('src/services/rsPharmaDatabase.ts', content, 'utf-8');
