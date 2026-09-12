const fs = require('fs');

// 1. types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf-8');
if (!typesContent.includes('potencyDecimal')) {
  const toAdd = `
  potencyDecimal?: number;
  saltFactor?: number;
`;
  typesContent = typesContent.replace(/export interface AMVDocumentData \{/, 'export interface AMVDocumentData {' + toAdd);
  typesContent = typesContent.replace(/export interface DissolutionAMVDocumentData \{/, 'export interface DissolutionAMVDocumentData {' + toAdd);
  typesContent = typesContent.replace(/export interface RSAMVDocumentData \{/, 'export interface RSAMVDocumentData {' + toAdd);
}
// Linearity columns
typesContent = typesContent.replace(/nominalWeightMg: number;/g, 'stockConc: number;\n  aliquot: number;\n  finalVolume: number;');
fs.writeFileSync('src/types.ts', typesContent, 'utf-8');

// 2. mathUtils.ts
let mathContent = fs.readFileSync('src/services/mathUtils.ts', 'utf-8');
const prngFuncs = `
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function computePctDissolved(area: number, aStd: number, cStd: number, vMedium: number, df: number, p: number, f: number, lcMg: number): number {
  return (area / aStd) * cStd * vMedium * df * p * f * 100 / (lcMg * 1000);
}

export function computeAssayPct(aT: number, aS: number, wS: number, p: number, f: number, dS: number, dT: number, wT: number, avgWt: number, lc: number): number {
  return (aT / aS) * (wS * p * f / dS) * (dT / wT) * (avgWt / lc) * 100;
}

export function computeImpPct(aImp: number, aStd: number, cStd: number, cSmp: number, rrf: number): number {
  return (aImp / aStd) * (cStd / cSmp) * (100 / rrf);
}

export const SALT_FACTORS: Record<string, number> = {
  'Amlodipine besylate': 0.7239,
  'Rosuvastatin calcium': 0.9575,
  'Metoprolol succinate': 0.8663,
  'Diltiazem HCl': 0.8938,
  'free acid/base': 1.0000
};
`;

if (!mathContent.includes('hashStr')) {
  mathContent = mathContent + prngFuncs;
  fs.writeFileSync('src/services/mathUtils.ts', mathContent, 'utf-8');
}

console.log('Patch 1 applied');
