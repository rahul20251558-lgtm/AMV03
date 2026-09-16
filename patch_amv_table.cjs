const fs = require('fs');

let viewer = fs.readFileSync('src/components/AMVDocumentViewer.tsx', 'utf8');

// Remove the 4 rows from the table
viewer = viewer.replace(/<tr>\s*<td className="p-1\.5 font-semibold bg-zinc-50 border border-zinc-300">Run Time<\/td>.*?<\/tr>/s, '');
viewer = viewer.replace(/<tr>\s*<td className="p-1\.5 font-semibold bg-zinc-50 border border-zinc-300">Diluent<\/td>.*?<\/tr>/s, '');
viewer = viewer.replace(/<tr>\s*<td className="p-1\.5 font-semibold bg-zinc-50 border border-zinc-300">Working Concentration<\/td>.*?<\/tr>/s, '');
viewer = viewer.replace(/<tr>\s*<td className="p-1\.5 font-semibold bg-zinc-50 border border-zinc-300">Approx\. Retention Time<\/td>.*?<\/tr>/s, '');

// Insert paragraph below table
const paragraphHtml = `          </div>
          <p className="text-xs text-justify mt-4 mb-2 leading-relaxed">
            The run time for the analysis is <b>{c.runTime}</b>. The diluent used is <b>{c.diluent}</b> to achieve a working concentration of <b>{c.workingConcentration}</b>. The approximate retention time of the main peak is <b>{c.approxRetentionTime || '6.5 min'}</b>.
          </p>
          <p className="text-[11px] italic text-zinc-500 mt-1.5">
            Note: {c.note || 'Dissolve 1.36 g of Potassium Dihydrogen Phosphate in 1000 mL water, adjust pH to 6.0 with 0.1M KOH.'}
          </p>`;

viewer = viewer.replace(/<\/div>\s*<p className="text-\[11px\] italic text-zinc-500 mt-1\.5">\s*Note: \{c\.note \|\|.*?\}\s*<\/p>/s, paragraphHtml);

fs.writeFileSync('src/components/AMVDocumentViewer.tsx', viewer);

console.log("Patched Viewer");
