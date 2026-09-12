const fs = require('fs');

const viewers = [
  'src/components/DissolutionDocumentViewer.tsx', 
  'src/components/AMVDocumentViewer.tsx', 
  'src/components/RSAMVDocumentViewer.tsx'
];

for (const viewer of viewers) {
  let content = fs.readFileSync(viewer, 'utf-8');
  
  if (!content.includes('dataMode?:')) {
    content = content.replace(/export interface .*?Props \{/, (match) => match + '\n  dataMode?: string;\n  seed?: string;');
    content = content.replace(/export const .*?: React.FC<.*?> = \(\{/, (match) => match + '\n  dataMode,\n  seed,');
  }

  // Inject Watermark
  const watermarkDiv = `
        {dataMode === 'DEMO' && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-col justify-center items-center opacity-10" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
             {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="text-6xl font-black text-slate-800 rotate-[-45deg] whitespace-nowrap mb-40">
                  DRAFT - SYNTHETIC DATA - NOT FOR GMP USE
               </div>
             ))}
          </div>
        )}
  `;

  // Place it right after <div id="amv-document-export-root" ...>
  content = content.replace(/<div\s+id="amv-document-export-root"[\s\S]*?>/, (match) => match + watermarkDiv);

  // Inject footer DRAFT text
  content = content.replace(/Page \{page\} of \{total\}/, (match) => 
    `{dataMode === 'DEMO' ? 'DRAFT / Seed: ' + (seed || 'SYNTHETIC') + ' | ' : ''}` + match);

  fs.writeFileSync(viewer, content, 'utf-8');
}

// Update App.tsx to pass dataMode and seed
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/<DissolutionDocumentViewer/, '<DissolutionDocumentViewer dataMode={dataMode} seed={productName+batchNo} ');
app = app.replace(/<RSAMVDocumentViewer/, '<RSAMVDocumentViewer dataMode={dataMode} seed={productName+batchNo} ');
app = app.replace(/<AMVDocumentViewer/, '<AMVDocumentViewer dataMode={dataMode} seed={productName+batchNo} ');
fs.writeFileSync('src/App.tsx', app, 'utf-8');

