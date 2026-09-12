const fs = require('fs');

let content = fs.readFileSync('src/services/pharmaMathEngine.ts', 'utf-8');

const linRegex = /export function generateLinearityData\([\s\S]*?return \{\s*levels:[\s\S]*?regression:[\s\S]*?\}\s*;\s*\}/;

const newLinearity = `export function generateLinearityData(
  productName: string,
  nominalPpm: number,
  nominalArea: number,
  levelsPercent: number[] = [50, 75, 100, 125, 150]
) {
  const rand = createSeededRandom(\`\${productName.toLowerCase()}_linearity\`);
  const slope = nominalArea / nominalPpm;
  const intercept = (rand() - 0.5) * (nominalArea * 0.008); 

  const levels: any[] = [];
  const xVals: number[] = [];
  const yVals: number[] = [];
  
  // Choose a stock concentration such that 100% level aliquot is e.g., 5 mL to 50 mL.
  // We want stock * aliquot / final = conc
  const finalVol = 50;
  const aliquot100 = 5.0; // 5 mL
  const stockConc = nominalPpm * (finalVol / aliquot100);

  for (let i = 0; i < levelsPercent.length; i++) {
    const pct = levelsPercent[i];
    const conc = (nominalPpm * pct) / 100;
    
    // Aliquot required to reach this conc from stock
    const aliquot = Number((conc * finalVol / stockConc).toFixed(2));
    
    // Recompute exact conc from aliquot just to be perfectly mathematically consistent
    const exactConc = (stockConc * aliquot) / finalVol;
    
    const noise = (rand() - 0.5) * (nominalArea * 0.0035);
    const area = Math.round(slope * exactConc + intercept + noise);

    xVals.push(exactConc);
    yVals.push(area);

    const concDecimals = exactConc < 0.01 ? 6 : exactConc < 0.1 ? 5 : exactConc < 10 ? 3 : 2;
    levels.push({
      levelName: \`Level \${['I', 'II', 'III', 'IV', 'V', 'VI'][i] || i + 1} (\${pct} %)\`,
      nominalPercent: pct,
      concentrationPpm: Number(exactConc.toFixed(concDecimals)),
      stockConc: Number(stockConc.toFixed(2)),
      aliquot: aliquot,
      finalVolume: finalVol,
      peakArea: area,
    });
  }

  const n = xVals.length;
  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = yVals[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const calcSlope = num / denX;
  const yInt = meanY - calcSlope * meanX;
  const r2 = (num * num) / (denX * denY);
  
  let residualSq = 0;
  for (let i = 0; i < n; i++) {
    const predY = calcSlope * xVals[i] + yInt;
    residualSq += Math.pow(yVals[i] - predY, 2);
  }

  return {
    levels,
    regression: {
      rSquared: Number(r2.toFixed(5)),
      slope: Number(calcSlope.toFixed(2)),
      yIntercept: Number(yInt.toFixed(2)),
      residualSumOfSquares: Number(residualSq.toFixed(2)),
    },
  };
}`;

content = content.replace(linRegex, newLinearity);

fs.writeFileSync('src/services/pharmaMathEngine.ts', content);
