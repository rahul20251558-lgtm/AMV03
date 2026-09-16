import fs from 'fs';
let content = fs.readFileSync('src/services/rsPharmaDatabase.ts', 'utf-8');

// The lowest level is rangeFrom, and its label is its percentage of rangeTo.
content = content.replace(
  /const lvlPct = Number\(\(\(c \/ highest\) \* 100\)\.toFixed\(1\)\);/g,
  `const lvlPct = Number(((c / rangeTo) * 100).toFixed(1));`
);

fs.writeFileSync('src/services/rsPharmaDatabase.ts', content);

let calc = fs.readFileSync('src/services/calculations.ts', 'utf-8');
// Fix formatRSquared
calc = calc.replace(
  /export function formatR\(val: number \| undefined \| null\): string \{[\s\S]*?\}/g,
  `export function formatR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  let str = val.toPrecision(6);
  if (str === '1.00000' || val >= 0.999999) return '0.999999';
  if (str === '1' || str === '1.0') return '0.999999';
  return str;
}`
);
fs.writeFileSync('src/services/calculations.ts', calc);
