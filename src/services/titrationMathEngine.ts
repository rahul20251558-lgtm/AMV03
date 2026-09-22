/**
 * Mathematical Calculation Engine for Titrimetric Method Verification / Validation
 * 
 * Complies with USP <1226> / <1225> and ICH Q2(R2) rules:
 * - Sample SD with denominator (n - 1)
 * - %RSD to 2 decimal places
 * - Linear regression with r to 4 decimal places and r² to 4 decimal places
 * - Standard Burette Readings mathematically derived from stoichiometry:
 *     V = (W * Purity) / (N * F) + Blank
 */

export interface StatsResult {
  mean: number;
  sd: number;
  rsd: number;
}

export function calcStats(values: number[]): StatsResult {
  if (!values || values.length === 0) {
    return { mean: 0, sd: 0, rsd: 0 };
  }
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  if (n <= 1) {
    return { mean: Number(mean.toFixed(4)), sd: 0, rsd: 0 };
  }
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  const rsd = mean !== 0 ? (sd / mean) * 100 : 0;
  return {
    mean: Number(mean.toFixed(4)),
    sd: Number(sd.toFixed(4)),
    rsd: Number(rsd.toFixed(2)),
  };
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r: number;
  rSquared: number;
}

export function calcLinearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) {
    return { slope: 0, intercept: 0, r: 0, rSquared: 0 };
  }

  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = meanY - slope * meanX;
  const denom = Math.sqrt(ssXX * ssYY);
  const r = denom !== 0 ? ssXY / denom : 0;
  const rSquared = r * r;

  return {
    slope: Number(slope.toFixed(6)),
    intercept: Number(intercept.toFixed(4)),
    r: Number(r.toFixed(4)),
    rSquared: Number(rSquared.toFixed(4)),
  };
}

/**
 * Calculates theoretical or observed burette reading (mL)
 * V = (W_mg * Purity) / (N * F) + Blank_mL
 */
export function calcBuretteReading(
  weightMg: number,
  normality: number,
  equivalencyFactor: number,
  blankMl = 0.05,
  purityDecimal = 1.0,
  noiseVariance = 0
): number {
  if (normality <= 0 || equivalencyFactor <= 0) return 0;
  const theoretical = (weightMg * purityDecimal) / (normality * equivalencyFactor) + blankMl;
  const finalVal = theoretical + noiseVariance;
  return Number(Math.max(0.1, finalVal).toFixed(2));
}

/**
 * Calculates content percentage of Label Amount (Assay %)
 * Result = [(V - B) * N * F * 100] / W * (Avg_Wt / LabelClaim)
 */
export function calcContentPercentOfLA(
  sampleVolumeMl: number,
  blankVolumeMl: number,
  normality: number,
  equivalencyFactor: number,
  sampleWeightMg: number,
  avgTabletWeightMg: number,
  labelClaimMg: number
): number {
  if (sampleWeightMg <= 0 || labelClaimMg <= 0) return 0;
  const netVol = Math.max(0, sampleVolumeMl - blankVolumeMl);
  const activeFoundMg = netVol * normality * equivalencyFactor;
  const assayPercent = (activeFoundMg / sampleWeightMg) * (avgTabletWeightMg / labelClaimMg) * 100;
  return Number(assayPercent.toFixed(2));
}

/**
 * Calculates recovery percentage from accuracy spike
 */
export function calcRecoveryPercent(
  buretteReadingMl: number,
  blankVolumeMl: number,
  normality: number,
  equivalencyFactor: number,
  spikedMg: number
): { recoveredMg: number; recoveryPercent: number } {
  if (spikedMg <= 0) return { recoveredMg: 0, recoveryPercent: 0 };
  const netVol = Math.max(0, buretteReadingMl - blankVolumeMl);
  const recoveredMg = netVol * normality * equivalencyFactor;
  const recoveryPercent = (recoveredMg / spikedMg) * 100;
  return {
    recoveredMg: Number(recoveredMg.toFixed(2)),
    recoveryPercent: Number(recoveryPercent.toFixed(2)),
  };
}
