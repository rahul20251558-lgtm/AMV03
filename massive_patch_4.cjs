const fs = require('fs');

let content = fs.readFileSync('src/services/dissolutionPharmaDatabase.ts', 'utf-8');

const filterBlockRegex = /const filterCentrifugedArea = [\s\S]*?const filterSuitability: DissolutionFilterSuitabilityData = \{/m;

const newFilterBlock = `
  const randFilter = createSeededRandom(mono.productName + mono.batchNoUsed + "filter");
  const filterCentrifugedArea = Math.round(ssMath.meanArea * (0.995 + (randFilter() - 0.5) * 0.01));
  
  function getFilterRow(discard: string, pctTarget: number) {
    const targetAreaRaw = (pctTarget / 100) * filterCentrifugedArea;
    const area = Math.round(targetAreaRaw);
    const pct = Number((area / filterCentrifugedArea * 100).toFixed(2));
    const diff = Number(Math.abs(100 - pct).toFixed(2));
    return {
      discardVolumeMl: discard,
      sampleArea: area,
      percentRecovery: pct,
      percentDiff: diff,
      compliance: 'Complies (Diff \\u2264 2.0 %)'
    };
  }
  
  const filterRows: DissolutionFilterSuitabilityRow[] = [
    getFilterRow('0 mL (Initial Filtrate)', 98.25 + (randFilter()-0.5)*0.5),
    getFilterRow('3 mL (Discarded First 3 mL)', 99.85 + (randFilter()-0.5)*0.2),
    getFilterRow('5 mL (Discarded First 5 mL)', 99.94 + (randFilter()-0.5)*0.1),
    getFilterRow('10 mL (Discarded First 10 mL)', 99.98 + (randFilter()-0.5)*0.05)
  ];

  const filterSuitability: DissolutionFilterSuitabilityData = {`;

content = content.replace(filterBlockRegex, newFilterBlock);

fs.writeFileSync('src/services/dissolutionPharmaDatabase.ts', content, 'utf-8');
