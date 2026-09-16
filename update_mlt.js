const fs = require('fs');
const content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf8');

let newContent = content.replace(
  "import { MLTDocumentData, DocumentType, ThemeFormat, DataMode, FontFamilyType, FontSizePt } from '../types';",
  `import { MLTDocumentData, DocumentType, ThemeFormat, DataMode, FontFamilyType, FontSizePt } from '../types';
import { FontAndSizeControl } from './FontAndSizeControl';
import { Download, Printer, Layers } from 'lucide-react';`
);

newContent = newContent.replace(
  /const fontStyle = \{[\s\S]*?\};/,
  `const fontStyle: React.CSSProperties = {
    fontFamily:
      fontFamily === 'Times New Roman'
        ? '"Times New Roman", Times, "Liberation Serif", Georgia, serif'
        : fontFamily === 'Arial'
        ? 'Arial, Helvetica, "Liberation Sans", sans-serif'
        : fontFamily === 'Calibri'
        ? 'Calibri, "Segoe UI", Candara, sans-serif'
        : fontFamily,
    fontSize: \`\${fontSize}pt\`,
    lineHeight: 1.5,
  };`
);

newContent = newContent.replace(
  /const themeClasses = [\s\S]*?accent: 'border-zinc-800' \};/,
  `const isBlue = theme === 'blue';
  
  const tableHeaderClass = isBlue
    ? 'bg-[#1F4E79] text-white font-bold border-[#1F4E79]'
    : 'bg-zinc-100 text-zinc-900 font-bold border-zinc-300';

  const sectionHeadingClass = isBlue
    ? 'text-[#1F4E79] border-[#1F4E79]'
    : 'text-zinc-900 border-zinc-800';

  const themeClasses = theme === 'blue' 
    ? { primary: 'text-[#1F4E79]', bg: 'bg-[#1F4E79]/5', border: 'border-zinc-400', tableHeader: 'bg-[#1F4E79] text-white', accent: 'border-[#1F4E79]' }
    : { primary: 'text-zinc-900', bg: 'bg-zinc-50', border: 'border-zinc-400', tableHeader: 'bg-zinc-100 text-zinc-900 font-bold', accent: 'border-zinc-800' };`
);

newContent = newContent.replace(
  /<div className="bg-white shadow-2xl mx-auto w-full max-w-\[900px\] min-h-\[1100px\] relative overflow-hidden" style=\{fontStyle\}>[\s\S]*?<\/div>[\s\S]*?<div className="relative z-10 p-10 sm:p-14 text-zinc-900">[\s\S]*?\{\/\* HEADER BLOCK \*\/\}[\s\S]*?<div className="text-center mb-6">[\s\S]*?<h3 className="text-md font-semibold mb-4">[\s\S]*?\(For Microbial Limit Test\)[\s\S]*?<\/h3>[\s\S]*?<\/div>/,
  `<div style={fontStyle} className="space-y-6 text-zinc-900">
      {/* Top Document Action Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => onDocTypeChange('protocol')}
              className={\`px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${
                docType === 'protocol'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }\`}
            >
              AMV Protocol
            </button>
            <button
              type="button"
              onClick={() => onDocTypeChange('report')}
              className={\`px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${
                docType === 'report'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }\`}
            >
              AMV Report
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => onThemeChange('blue')}
              className={\`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all \${
                theme === 'blue'
                  ? 'bg-[#1F4E79] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }\`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              Executive Blue
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('simple')}
              className={\`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all \${
                theme === 'simple'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }\`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              Simple Format (No Color)
            </button>
          </div>

          <FontAndSizeControl
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamilyChange={onFontFamilyChange}
            onFontSizeChange={onFontSizeChange}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadProtocol}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
            title="Download Word .docx for Protocol"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Protocol (.docx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs flex items-center gap-1.5"
            title="Download Word .docx for Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Report (.docx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadBoth}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-colors flex items-center gap-1.5"
            title="Download Both Protocol and Report in one click"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            <span>Both (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PAGE 1 */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {/* Company Title */}
        <div className="text-center pb-1 pt-1">
          <h1 className={\`text-xl sm:text-2xl font-bold uppercase tracking-wide \${sectionHeadingClass}\`}>
            {data.companyName}
          </h1>
        </div>

        {/* Solid Divider Line */}
        <div className={\`w-full h-1 my-3 \${isBlue ? 'bg-[#1F4E79]' : 'bg-zinc-800'}\`}></div>

        {/* Document Title */}
        <div className="text-center py-1 mb-3">
          <h2 className={\`text-sm sm:text-base font-bold uppercase tracking-wider \${sectionHeadingClass}\`}>
            {isProtocol
              ? 'ANALYTICAL METHOD VERIFICATION PROTOCOL (For Microbial Limit Test)'
              : 'ANALYTICAL METHOD VERIFICATION REPORT (For Microbial Limit Test)'}
          </h2>
          {dataMode === 'DEMO' && (
            <div className="inline-block mt-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold text-xs tracking-wider uppercase">
              DEMO / FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE
            </div>
          )}
        </div>`
);

// We need to also change all <h3 className={`text-lg font-bold mb-2 uppercase ${themeClasses.primary}`}>
// to use sectionHeadingClass and standard text sizes

newContent = newContent.replace(/className=\{\`text-lg font-bold mb-2 uppercase \$\{themeClasses\.primary\}\`\}/g, "className={`text-xs font-bold uppercase mb-1 ${sectionHeadingClass}`}");
newContent = newContent.replace(/<table className=\{\`w-full text-sm border-collapse border \$\{themeClasses\.border\}/g, "<table className={`w-full text-xs border-collapse border border-zinc-300");
newContent = newContent.replace(/<table className=\{\`w-full text-xs border-collapse border \$\{themeClasses\.border\}/g, "<table className={`w-full text-xs border-collapse border border-zinc-300");

// Update all <tr className={themeClasses.tableHeader}>
newContent = newContent.replace(/className=\{themeClasses\.tableHeader\}/g, "className={tableHeaderClass}");

// We need to make sure the end of the div matches up
// Wait, the very end of the file currently is:
//         <div className="text-center font-bold text-lg mt-8 text-zinc-600">
//           — END OF DOCUMENT —
//         </div>
//       </div>
//     </div>
//   );
//
// But since I changed the opening of the main container, the nesting might be off.
newContent = newContent.replace(/— END OF DOCUMENT —[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\);/, `— END OF DOCUMENT —
        </div>
      </div>
    </div>
  );`);

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', newContent);
