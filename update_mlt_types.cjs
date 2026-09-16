const fs = require('fs');
let content = fs.readFileSync('src/types_mlt.ts', 'utf-8');

const recoveryRowType = `
export interface MLTRecoveryRow {
  organismId: string;
  dilution: string; // '1:10', '1:50', '1:100'
  inoculumControl1: number;
  inoculumControl2: number;
  sampleControl1: number;
  sampleControl2: number;
  testPlate1: number;
  testPlate2: number;
}
`;

content = content.replace(/export interface MLTSuitabilityRow/, recoveryRowType + '\nexport interface MLTSuitabilityRow');

content = content.replace(/suitabilityRows: MLTSuitabilityRow\[\];/, "suitabilityRows: MLTSuitabilityRow[];\n  recoveryRows: MLTRecoveryRow[];\n  controlsRows: any[];");

fs.writeFileSync('src/types_mlt.ts', content, 'utf-8');
