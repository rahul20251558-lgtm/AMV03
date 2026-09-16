import { getRSMonograph } from './src/services/rsPharmaDatabase';
import { parseProductStrength } from './src/services/pharmaMathEngine';

const seed = getRSMonograph('Paracetamol Tablets BP 500 mg');
let highest = 0.50;
let disregardPercent = 0.05;
for (const limit of seed.monographLimits) {
  if (limit.criterion.toLowerCase().includes('disregard')) {
    const match = limit.limit.match(/([\d.]+)\s*%/);
    if (match) disregardPercent = parseFloat(match[1]);
  } else {
    // If not disregard, find max percentage limit
    const match = limit.limit.match(/([\d.]+)\s*%/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val > highest) highest = val;
    }
  }
}
console.log('highest:', highest);

const ts = seed.solutionPreparation.testSolution;
let sampleWeightMg = 500;
const wtMatch = ts.match(/(\d+(?:\.\d+)?)\s*mg/i);
if (wtMatch) sampleWeightMg = parseFloat(wtMatch[1]);
let finalVolumeMl = 50.0;
const volMatch = ts.match(/(\d+(?:\.\d+)?)\s*mL/i);
if (volMatch) finalVolumeMl = parseFloat(volMatch[1]);

console.log('sampleWeightMg:', sampleWeightMg);
console.log('finalVolumeMl:', finalVolumeMl);

const testConc = (sampleWeightMg * 1000) / finalVolumeMl;
console.log('testConc:', testConc);

// highest = 50! Wait...
