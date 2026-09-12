const fs = require('fs');
let content = fs.readFileSync('src/components/DissolutionDocumentViewer.tsx', 'utf-8');

// Replace Weight (mg) / Dilution Vol (mL) in Linearity table
content = content.replace(/<th className="p-2 border border-zinc-300 text-center">Weight \(mg\)<\/th>\s*<th className="p-2 border border-zinc-300 text-center">Dilution Volume \(mL\)<\/th>/,
  '<th className="p-2 border border-zinc-300 text-center">Stock Conc (µg/mL)</th>\n                      <th className="p-2 border border-zinc-300 text-center">Aliquot (mL)</th>\n                      <th className="p-2 border border-zinc-300 text-center">Final Volume (mL)</th>');

content = content.replace(/<td className="p-2 border border-zinc-300 text-center">\{level\.nominalWeightMg\.toFixed\(2\)\}<\/td>\s*<td className="p-2 border border-zinc-300 text-center">\{level\.dilutionVolumeMl\}<\/td>/g, 
  '<td className="p-2 border border-zinc-300 text-center">{level.stockConc.toFixed(2)}</td>\n                        <td className="p-2 border border-zinc-300 text-center">{level.aliquot.toFixed(2)}</td>\n                        <td className="p-2 border border-zinc-300 text-center">{level.finalVolume}</td>');

// Wait, the interface for linearity level is in `src/types.ts` and we updated it. We need to check if there are compilation errors now.
fs.writeFileSync('src/components/DissolutionDocumentViewer.tsx', content);

