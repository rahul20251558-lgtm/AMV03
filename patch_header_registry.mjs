import fs from 'fs';
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const anchor = '{/* SSOT Inspector Button */}';
const registryBtn = `
            {/* Registry Button */}
            <button
              type="button"
              onClick={onOpenRegistry}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors shadow-2xs"
              title="Open Document Number Registry"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden md:inline">Registry</span>
            </button>
            
            `;

code = code.replace(anchor, registryBtn + anchor);
fs.writeFileSync('src/components/Header.tsx', code);
