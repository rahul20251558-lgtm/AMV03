const fs = require('fs');

let content = fs.readFileSync('src/services/pharmaMathEngine.ts', 'utf-8');

// Replace createSeededRandom
content = content.replace(/export function createSeededRandom[\s\S]*?return function \(\) \{[\s\S]*?\}\s*\}/, `export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(a: number) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function createSeededRandom(seedStr: string) {
  return mulberry32(hashStr(seedStr));
}`);


// Add PrecisionCalcContext interface
if (!content.includes('PrecisionCalcContext')) {
  content = content.replace(/export interface GeneratedPrecisionRow \{/, `
export interface PrecisionCalcContext {
  targetPct: number;
  LC_mg: number;
  A_std: number;
  C_std?: number;
  V_medium?: number;
  DF?: number;
  P?: number;
  F?: number;
  // For Assay
  W_S?: number;
  D_S?: number;
  D_T?: number;
  W_T?: number;
  AVG_WT?: number;
  // For RS
  C_smp?: number;
  RRF?: number;
  methodType: 'dissolution' | 'assay' | 'related_substances';
}

export interface GeneratedPrecisionRow {`);
}

// Complete rewrite of generatePrecisionData to follow the calculation order rule
const precisionRegex = /export function generatePrecisionData\([\s\S]*?return \{\s*analyst1:[\s\S]*?cumulative:[\s\S]*?\}\s*;\s*\}/;
const newPrecision = `export function generatePrecisionData(
  productName: string,
  strengthMg: number,
  nominalArea: number,
  targetMeanPercent: number = 99.8,
  isDissolution: boolean = false,
  ctx?: PrecisionCalcContext
) {
  const rand = createSeededRandom(\`\${productName.toLowerCase()}_precision\`);
  const rsdPercent = 0.35 + rand() * 0.55; 
  const numSamples = 6;
  const rows: GeneratedPrecisionRow[] = [];
  const analyst2Rows: GeneratedPrecisionRow[] = [];
  
  function getAreaAndPct(targetPct: number, sampleWt: number, r: () => number) {
    let areaRaw = 0;
    let pct = 0;
    if (ctx && ctx.methodType === 'dissolution') {
      areaRaw = (targetPct / 100) * (ctx.LC_mg * 1000) * ctx.A_std / ((ctx.C_std||1) * (ctx.V_medium||1) * (ctx.DF||1) * (ctx.P||1) * (ctx.F||1));
      const area = Math.round(areaRaw + (r() - 0.5) * (nominalArea * 0.002));
      pct = (area / ctx.A_std) * (ctx.C_std||1) * (ctx.V_medium||1) * (ctx.DF||1) * (ctx.P||1) * (ctx.F||1) * 100 / (ctx.LC_mg * 1000);
      return { area, pct: Number(pct.toFixed(2)) };
    } else if (ctx && ctx.methodType === 'assay') {
      areaRaw = targetPct / 100 * ctx.A_std / ( ((ctx.W_S||1) * (ctx.P||1) * (ctx.F||1) / (ctx.D_S||1)) * ((ctx.D_T||1) / sampleWt) * ((ctx.AVG_WT||1) / ctx.LC_mg) );
      const area = Math.round(areaRaw + (r() - 0.5) * (nominalArea * 0.002));
      pct = (area / ctx.A_std) * ((ctx.W_S||1) * (ctx.P||1) * (ctx.F||1) / (ctx.D_S||1)) * ((ctx.D_T||1) / sampleWt) * ((ctx.AVG_WT||1) / ctx.LC_mg) * 100;
      return { area, pct: Number(pct.toFixed(2)) };
    } else if (ctx && ctx.methodType === 'related_substances') {
      areaRaw = (targetPct / 100) * ctx.A_std / ( ((ctx.C_std||1) / (ctx.C_smp||1)) * (1 / (ctx.RRF||1)) );
      const area = Math.round(areaRaw + (r() - 0.5) * (nominalArea * 0.002));
      pct = (area / ctx.A_std) * ((ctx.C_std||1) / (ctx.C_smp||1)) * (100 / (ctx.RRF||1));
      return { area, pct: Number(pct.toFixed(2)) };
    }
    // Fallback if ctx is missing
    const exactPct = targetPct;
    const area = Math.round(nominalArea * (targetPct / 100) * (sampleWt / strengthMg));
    return { area, pct: Number(exactPct.toFixed(2)) };
  }

  // Analyst 1
  for (let i = 1; i <= numSamples; i++) {
    const sampleWt = isDissolution ? strengthMg : Number((strengthMg + (rand() - 0.5) * 0.4).toFixed(2));
    const truePct = targetMeanPercent + (rand() - 0.5) * rsdPercent;
    
    const { area, pct } = getAreaAndPct(truePct, sampleWt, rand);
    const content = Number(((pct / 100) * strengthMg).toFixed(strengthMg >= 50 ? 1 : strengthMg >= 1 ? 2 : 3));

    rows.push({
      determinationNo: i,
      sampleWeightMg: sampleWt,
      peakArea: area,
      contentFoundMg: content,
      percentAssayOrDissolved: pct,
    });
  }

  // Analyst 2
  const rand2 = createSeededRandom(\`\${productName.toLowerCase()}_analyst2\`);
  const targetA2Pct = targetMeanPercent + (rand2() - 0.5) * 0.4;
  for (let i = 1; i <= numSamples; i++) {
    const sampleWt = isDissolution ? strengthMg : Number((strengthMg + (rand2() - 0.5) * 0.4).toFixed(2));
    const truePct = targetA2Pct + (rand2() - 0.5) * rsdPercent;
    
    const { area, pct } = getAreaAndPct(truePct, sampleWt, rand2);
    const content = Number(((pct / 100) * strengthMg).toFixed(strengthMg >= 50 ? 1 : strengthMg >= 1 ? 2 : 3));

    analyst2Rows.push({
      determinationNo: i,
      sampleWeightMg: sampleWt,
      peakArea: area,
      contentFoundMg: content,
      percentAssayOrDissolved: pct,
    });
  }

  const meanContent = Number((rows.reduce((a,b)=>a+b.contentFoundMg, 0) / numSamples).toFixed(strengthMg >= 50 ? 2 : 3));
  const meanPercent = Number((rows.reduce((a,b)=>a+b.percentAssayOrDissolved, 0) / numSamples).toFixed(2));
  const variance = rows.reduce((acc, curr) => acc + Math.pow(curr.percentAssayOrDissolved - meanPercent, 2), 0) / (numSamples - 1);
  const sd = Number(Math.sqrt(variance).toFixed(3));
  const rsd = Number(((sd / meanPercent) * 100).toFixed(2));

  const meanA2Percent = Number((analyst2Rows.reduce((a,b)=>a+b.percentAssayOrDissolved, 0) / numSamples).toFixed(2));
  const varianceA2 = analyst2Rows.reduce((acc, curr) => acc + Math.pow(curr.percentAssayOrDissolved - meanA2Percent, 2), 0) / (numSamples - 1);
  const sdA2 = Number(Math.sqrt(varianceA2).toFixed(3));
  const rsdA2 = Number(((sdA2 / meanA2Percent) * 100).toFixed(2));

  const allPercents = [...rows.map(r => r.percentAssayOrDissolved), ...analyst2Rows.map(r => r.percentAssayOrDissolved)];
  const cumulMean = Number((allPercents.reduce((a, b) => a + b, 0) / 12).toFixed(2));
  const cumulVar = allPercents.reduce((acc, p) => acc + Math.pow(p - cumulMean, 2), 0) / 11;
  const cumulSd = Number(Math.sqrt(cumulVar).toFixed(3));
  const cumulRsd = Number(((cumulSd / cumulMean) * 100).toFixed(2));

  return {
    analyst1: { rows, meanContent, meanPercent, sd, rsd },
    analyst2: { rows: analyst2Rows, meanPercent: meanA2Percent, sd: sdA2, rsd: rsdA2 },
    cumulative: { meanPercent: cumulMean, sd: cumulSd, rsd: cumulRsd },
  };
}`;
content = content.replace(precisionRegex, newPrecision);

fs.writeFileSync('src/services/pharmaMathEngine.ts', content);
console.log('Patch 2 applied');
