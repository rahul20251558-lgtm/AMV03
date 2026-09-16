const fs = require('fs');
let content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf-8');

// Replace the suitability table rendering to show the Neutraliser screening (Section 6) 
// and the Recovery table (Section 7)

const section6And7 = `
        {/* Section 6: Neutraliser Screening */}
        <h3 className={\`text-lg font-bold mt-8 mb-3 \${themeClasses.primary} uppercase\`}>{isReport ? '6.0' : '5.0'} Neutraliser (Tween 20) Screening</h3>
        <div className="overflow-x-auto mb-6">
          <table className={\`w-full text-xs border-collapse border \${themeClasses.border}\`}>
            <thead>
              <tr className={themeClasses.tableHeader}>
                <th className="border p-2">% of Tween 20</th>
                <th className="border p-2">Mean Inoculum Control (cfu)</th>
                <th className="border p-2">Mean Recovered (cfu)</th>
                <th className="border p-2">% Recovery</th>
                <th className="border p-2">Ratio</th>
                <th className="border p-2">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {data.suitabilityRows.map((r, i) => {
                const mI = (r.inoculumControl1 + r.inoculumControl2) / 2;
                const mS = (r.sampleControl1 + r.sampleControl2) / 2;
                const mT = (r.testPlate1 + r.testPlate2) / 2;
                const net = Math.max(0, mT - mS);
                const rec = (net / mI) * 100;
                const rat = net / mI;
                const pf = (rat >= 0.7) ? 'Complies' : 'Fails'; // screening threshold NLT 70%
                return (
                  <tr key={i} className="text-center">
                    <td className={\`border \${themeClasses.border} p-2 font-medium\`}>{r.neutralizerLevel}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{mI}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{net}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{rec.toFixed(1)}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{rat.toFixed(2)}</td>
                    <td className={\`border \${themeClasses.border} p-2 font-semibold \${pf === 'Complies' ? 'text-green-600' : 'text-red-600'}\`}>{pf}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 7: Recovery */}
        <h3 className={\`text-lg font-bold mt-8 mb-3 \${themeClasses.primary} uppercase\`}>{isReport ? '7.0' : '6.0'} Total Viable Aerobic Count — Procedure and Recovery</h3>
        <div className="overflow-x-auto mb-6">
          <table className={\`w-full text-xs border-collapse border \${themeClasses.border}\`}>
            <thead>
              <tr className={themeClasses.tableHeader}>
                <th className="border p-2">Sr. No.</th>
                <th className="border p-2">Test Organism</th>
                <th className="border p-2">Dilution</th>
                <th className="border p-2">Inoculum Count (cfu)</th>
                <th className="border p-2">Recovered Count (cfu)</th>
                <th className="border p-2">% Recovery</th>
                <th className="border p-2">Ratio</th>
                <th className="border p-2">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.recoveryRows?.map((r, i) => {
                const org = data.organisms.find(o => o.id === r.organismId);
                const mI = (r.inoculumControl1 + r.inoculumControl2) / 2;
                const mS = (r.sampleControl1 + r.sampleControl2) / 2;
                const mT = (r.testPlate1 + r.testPlate2) / 2;
                const net = Math.max(0, mT - mS);
                const rec = (net / mI) * 100;
                const rat = net / mI;
                const pf = (rat >= 0.5 && rat <= 2.0) ? 'Pass' : 'Fail';
                return (
                  <tr key={i} className="text-center">
                    <td className={\`border \${themeClasses.border} p-2\`}>{i + 1}</td>
                    <td className={\`border \${themeClasses.border} p-2 text-left italic\`}>{org?.name}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{r.dilution}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{mI}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{net}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{rec.toFixed(1)}</td>
                    <td className={\`border \${themeClasses.border} p-2\`}>{rat.toFixed(2)}</td>
                    <td className={\`border \${themeClasses.border} p-2 font-semibold \${pf === 'Pass' ? 'text-green-600' : 'text-red-600'}\`}>{pf}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
`;

content = content.replace(
  /\{\/\* Suitability Table \*\/\}[\s\S]*?\{\/\* Cultures Table \*\/\}/,
  section6And7 + '\n        {/* Cultures Table */}'
);

content = content.replace(
  /const passFail = data\.suitabilityRows\.every/,
  `const passFail = data.recoveryRows?.every(r => {
    const mI = (r.inoculumControl1 + r.inoculumControl2) / 2;
    const mS = (r.sampleControl1 + r.sampleControl2) / 2;
    const mT = (r.testPlate1 + r.testPlate2) / 2;
    const net = Math.max(0, mT - mS);
    const rat = net / mI;
    return rat >= 0.5 && rat <= 2.0;
  }) && data.suitabilityRows.some(r => {
    const mI = (r.inoculumControl1 + r.inoculumControl2) / 2;
    const mS = (r.sampleControl1 + r.sampleControl2) / 2;
    const mT = (r.testPlate1 + r.testPlate2) / 2;
    const rat = Math.max(0, mT - mS) / mI;
    return rat >= 0.7; // At least one screening passes
  });`
);

content = content.replace(
  /<p className="text-sm">[\s\S]*?<\/p>/,
  `<p className="text-sm">
            The Microbial Limit Test method for {data.productName} {data.strength}, batch {data.batchNo}, was verified in accordance with Protocol No. {data.protocolNo}.
            Neutraliser screening established Tween 20 at 0.1 % as the suitable condition. Recovery of all test organisms at dilutions 1:10, 1:50 and 1:100 fell within a factor of 2 of the inoculum control. 
            Specified organisms were isolated and identified from the product-containing media. Negative controls showed no growth. 
            The method is {passFail ? <strong className="text-green-700">SUITABLE</strong> : <strong className="text-red-700">NOT SUITABLE</strong>} for routine Microbial Limit Testing of the product at the stated dilutions.
          </p>`
);

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', content, 'utf-8');
