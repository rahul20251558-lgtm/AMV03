const fs = require('fs');

let content = fs.readFileSync('src/services/dissolutionPharmaDatabase.ts', 'utf-8');

const stabBlockRegex = /\/\/ 10\. Solution Stability Data \([\s\S]*?const rowsRoomTemp: DissolutionSolutionStabilityRow\[\] = \[/m;

const newStabBlock = `// 10. Solution Stability Data (0h, 12h, 24h, 48h)
  const randStab = createSeededRandom(mono.productName.toLowerCase() + "_stability");
  const initStdArea = A_std;
  const initSmpArea = Math.round(initStdArea * (0.998 + (randStab() - 0.5) * 0.01));
  const initialDissolved = Number(((initSmpArea / A_std) * cWorkingNominal * vMedNum * df * P * F * 100 / (strengthNum * 1000)).toFixed(2));

  const calcDiff = (curr: number, init: number): string => {
    const diff = (Math.abs(curr - init) / init) * 100;
    return \`\${diff.toFixed(2)} %\`;
  };

  const calcDissolved = (smp: number, std: number): string => {
    const val = (smp / std) * cWorkingNominal * vMedNum * df * P * F * 100 / (strengthNum * 1000);
    return \`\${val.toFixed(2)} %\`;
  };

  // Room temperature (20–25 °C)
  const rtStdArea12 = Math.round(initStdArea * (1 - 0.0035 - randStab() * 0.0015));
  const rtSmpArea12 = Math.round(initSmpArea * (1 - 0.0032 - randStab() * 0.0015));

  const rtStdArea24 = Math.round(initStdArea * (1 - 0.0075 - randStab() * 0.002));
  const rtSmpArea24 = Math.round(initSmpArea * (1 - 0.0072 - randStab() * 0.002));

  const rtStdArea48 = Math.round(initStdArea * (1 - 0.012 - randStab() * 0.0025));
  const rtSmpArea48 = Math.round(initSmpArea * (1 - 0.0115 - randStab() * 0.0025));

  const rowsRoomTemp: DissolutionSolutionStabilityRow[] = [`;

content = content.replace(stabBlockRegex, newStabBlock);

// Also fix workedCalcPercent
content = content.replace(/const workedCalcPercent = Number\(\(\(sampleAreaVal \/ meanStdAreaVal\) \* \(cWorkingNominal \/ 1000\) \* \(vMedNum \* df\) \* \(100 \/ strengthNum\)\)\.toFixed\(2\)\);/, 
  'const workedCalcPercent = Number(((sampleAreaVal / A_std) * (cWorkingNominal / 1000) * (vMedNum * df) * (100 / strengthNum) * P * F).toFixed(2));');

// And formula in the text
content = content.replace(/% Dissolved = \(A_smp \/ A_std\) × \(C_std \/ 1000\) × \(V_medium × DF\) × \(100 \/ LC\)/g, 
  '% Dissolved = (A_smp / A_std) × (C_std / 1000) × (V_medium × DF) × P × F × (100 / LC)');
content = content.replace(/1000 = Conversion factor/g, 'P = Reference standard potency (decimal); F = Salt-to-base conversion factor; 1000 = Conversion factor');

fs.writeFileSync('src/services/dissolutionPharmaDatabase.ts', content, 'utf-8');
