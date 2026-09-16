const fs = require('fs');
let content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf8');

// Add RunningHeader and RunningFooter definitions right after getComplianceStatus
const runningComponents = `
  const RunningHeader = () => (
    <div className="flex justify-between items-center pb-2 mb-4 border-b border-zinc-300 text-[11px] text-zinc-500 font-sans">
      <span className="font-semibold text-zinc-700">{data.companyName}</span>
      <span>
        {isReport ? 'AMV Report' : 'AMV Protocol'} – {data.productName} | Doc No. {docNo}
      </span>
    </div>
  );

  const RunningFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="pt-3 mt-5 border-t border-zinc-200 text-[11px] text-zinc-400 font-sans space-y-1">
      {dataMode === 'DEMO' && (
        <div className="text-center font-bold text-[11px] text-amber-700 tracking-wider uppercase">
          DEMO / FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE
        </div>
      )}
      <div className="text-center">Page {pageNum} of 4</div>
    </div>
  );
`;

content = content.replace(/const getComplianceStatus = \(\) => \{[\s\S]*?return allPass \? 'Complies' : 'Fails';\s*\};/,
  match => match + runningComponents);

// Now split pages.
// Find `{/* 4. METHOD SUMMARY */}` and split there.
content = content.replace(
  /\{\/\* 4\. METHOD SUMMARY \*\/\}/,
  `<RunningFooter pageNum={1} />
      </div>
      {/* PAGE 2 */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        <RunningHeader />
        {/* 4. METHOD SUMMARY */}`
);

// Find `{/* 6. NEUTRALISER SCREENING */}` and split there.
content = content.replace(
  /\{\/\* 6\. NEUTRALISER SCREENING \*\/\}/,
  `<RunningFooter pageNum={2} />
      </div>
      {/* PAGE 3 */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        <RunningHeader />
        {/* 6. NEUTRALISER SCREENING */}`
);

// Find `{/* 9. TESTS FOR PATHOGENS */}` and split there.
content = content.replace(
  /\{\/\* 9\. TESTS FOR PATHOGENS \*\/\}/,
  `<RunningFooter pageNum={3} />
      </div>
      {/* PAGE 4 */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        <RunningHeader />
        {/* 9. TESTS FOR PATHOGENS */}`
);

// Add the final footer at the end of the document, before the "END OF DOCUMENT" mark
content = content.replace(
  /<div className="text-center font-bold text-lg mt-8 text-zinc-600">[\s\S]*?— END OF DOCUMENT —[\s\S]*?<\/div>/,
  `<div className="text-center font-bold text-lg mt-8 text-zinc-600">
          — END OF DOCUMENT —
        </div>
        <RunningFooter pageNum={4} />`
);

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', content);
