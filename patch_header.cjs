const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Add isExportDisabled prop
if (!content.includes('isExportDisabled?: boolean;')) {
  content = content.replace(/export interface HeaderProps \{/, 'export interface HeaderProps {\n  isExportDisabled?: boolean;');
  content = content.replace(/export const Header: React\.FC<HeaderProps> = \(\{/, 'export const Header: React.FC<HeaderProps> = ({\n  isExportDisabled,');
}

// Disable buttons
content = content.replace(/<button\s*type="button"\s*onClick=\{onDownloadDocx\}/, 
  '<button type="button" disabled={isExportDisabled} onClick={onDownloadDocx}');
content = content.replace(/<button\s*type="button"\s*onClick=\{onPrint\}/, 
  '<button type="button" disabled={isExportDisabled} onClick={onPrint}');

// Add styling for disabled
content = content.replace(/className="flex items-center gap-1\.5 px-3 py-1\.5 text-xs font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs"/,
  'className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors shadow-xs ${isExportDisabled ? "bg-slate-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}');

content = content.replace(/className="flex items-center gap-1\.5 px-2\.5 py-1\.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"/,
  'className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isExportDisabled ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "text-zinc-700 bg-white border-zinc-300 hover:bg-zinc-50"}`}');

fs.writeFileSync('src/components/Header.tsx', content, 'utf-8');

// Now update App.tsx to pass !isValidated
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/<Header\s*theme=\{theme\}/, '<Header isExportDisabled={!isValidated} theme={theme}');
fs.writeFileSync('src/App.tsx', app, 'utf-8');

