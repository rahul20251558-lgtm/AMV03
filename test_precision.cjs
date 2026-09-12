require('ts-node').register();
const { generateDissolutionReport } = require('./src/services/dissolutionPharmaDatabase.ts');

const data = generateDissolutionReport('Rosuvastatin Calcium Tablets 10 mg', {
  companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
  documentNo: 'AMV-WCP-2609-105',
  reportDate: '11-Sep-2026',
  batchNoUsed: 'VAL-ROS-2609105',
  standardLot: 'RS-ROS-2609'
}, 0.9982, 0.9575);

const rows = data.precision.analyst1.rows;
const A_std = data.systemSuitability.stats.meanArea;
const C_std = data.systemSuitability.standardConcUgMl;
const P = 0.9982;
const F = 0.9575;
const LC_mg = 10;
const V_medium = parseInt(data.dissolutionConditions.volume.match(/\d+/)[0], 10);
const DF = 1;

console.log("Precision Table for Analyst 1:");
console.log("Area\t\tPrinted %\tRecomputed %");
rows.forEach(r => {
  const recomputed = (r.peakArea / A_std) * C_std * V_medium * DF * P * F * 100 / (LC_mg * 1000);
  console.log(r.peakArea + "\t\t" + r.percentAssayOrDissolved.toFixed(2) + "\t\t" + recomputed.toFixed(2));
});

