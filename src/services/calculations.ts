export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

export const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
};

export const rsd = (v: number[]) => (sd(v) / mean(v)) * 100;

// Calculate concentration in ppm from weight and dilution
export const toPpm = (weightMg: number, volumeMl: number, purity = 1) =>
  (weightMg * purity * 1000) / volumeMl;

// Linear regression calculator
export function regress(x: number[], y: number[]) {
  const n = x.length, mx = mean(x), my = mean(y);
  const sxx = x.reduce((a, xi) => a + (xi - mx) ** 2, 0);
  const sxy = x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0);
  const syy = y.reduce((a, yi) => a + (yi - my) ** 2, 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = (sxy * sxy) / (sxx * syy);
  const resid = x.map((xi, i) => y[i] - (slope * xi + intercept));
  const residualSD = Math.sqrt(resid.reduce((a, r) => a + r * r, 0) / (n - 2));
  return {
    slope, 
    intercept, 
    r2, 
    residualSD,
    lod: (3.3 * residualSD) / slope,
    loq: (10 * residualSD) / slope,
  };
}

// For RS method - area ratio to internal standard
export const areaRatio = (peak: number, isPeak: number) => peak / isPeak;

// Calculate recovery percentage
export const recovery = (recoveredMg: number, spikedMg: number) =>
  (recoveredMg / spikedMg) * 100;

// Convert Area to Concentration using the calibration curve (prevents offset)
export const areaToConc = (area: number, slope: number, intercept: number) =>
  (area - intercept) / slope;
