const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');

content = content.replace(/  isExportDisabled\?: boolean;\n/g, '');
content = content.replace(/  isExportDisabled,\n/g, '');
content = content.replace(/disabled=\{isExportDisabled\} /g, '');
content = content.replace(/className=\{\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors shadow-xs \$\{isExportDisabled \? "bg-slate-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"\}\`\}/g, 'className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs"');
content = content.replace(/className=\{\`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors \$\{isExportDisabled \? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "text-zinc-700 bg-white border-zinc-300 hover:bg-zinc-50"\}\`\}/g, 'className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"');

fs.writeFileSync('src/components/Header.tsx', content, 'utf-8');
