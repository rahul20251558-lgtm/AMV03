const fs = require('fs');
let content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf8');

content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{mI\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : mI}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{mS\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : mS}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{mT\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : mT}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{net\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : net}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{pct\} %<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : `${pct} %`}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{rat\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : rat}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-semibold text-emerald-700">\{remark\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-semibold text-emerald-700">{isProtocol ? "" : remark}</td>'
);

// Update Suitability table
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-semibold">\{r\.positiveControl\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-semibold">{isProtocol ? "" : r.positiveControl}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-semibold">\{r\.negativeControl\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-semibold">{isProtocol ? "" : r.negativeControl}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-semibold">\{r\.testProduct\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-semibold">{isProtocol ? "" : r.testProduct}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-bold text-emerald-700">\{r\.identificationResult\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-bold text-emerald-700">{isProtocol ? "" : r.identificationResult}</td>'
);

// Update Neutraliser Evaluation (section 6 in MLTDocumentViewer)
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.testPlate1\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.testPlate1}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.testPlate2\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.testPlate2}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.sampleControl1\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.sampleControl1}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.sampleControl2\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.sampleControl2}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.inoculumControl1\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.inoculumControl1}</td>'
);
content = content.replace(
  /<td className="border border-zinc-300 p-2 text-center font-mono">\{r\.inoculumControl2\}<\/td>/g,
  '<td className="border border-zinc-300 p-2 text-center font-mono">{isProtocol ? "" : r.inoculumControl2}</td>'
);

// Also add a conclusion conditionally
content = content.replace(
  /<h4 className="font-bold mb-2">10\.2 OVERALL CONCLUSION<\/h4>\s*<p className="font-bold text-zinc-900 bg-emerald-50 p-4 border border-emerald-200 rounded text-xs">[\s\S]*?<\/p>/,
  `<h4 className="font-bold mb-2">10.2 OVERALL CONCLUSION</h4>
        <p className="font-bold text-zinc-900 bg-emerald-50 p-4 border border-emerald-200 rounded text-xs">
          {isProtocol ? 'To be verified after execution.' : (data.conclusion || 'The Microbial Limit Test analytical method is verified and found suitable for its intended purpose.')}
        </p>`
);

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', content);
