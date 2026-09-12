const fs = require('fs');

let content = fs.readFileSync('src/components/AMVInputForm.tsx', 'utf-8');

// Replace button colors
content = content.replace(
  /theme === 'blue'\s*\?\s*'bg-\\[#1F4E79\\] hover:bg-\\[#183e60\\] disabled:bg-zinc-400'\s*:\s*'bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400'/g,
  `(!isLoading && newAMVReadyInfo) ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600 text-white' : (theme === 'blue' ? 'bg-[#1F4E79] hover:bg-[#183e60] disabled:bg-zinc-400' : 'bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400')`
);

// Replace button content
content = content.replace(
  /<Sparkles className="w-4 h-4" \/>\s*<span>\s*\{isDissolution\s*\?\s*'Generate Dissolution Protocol & Report'\s*:\s*isRS\s*\?\s*'Generate RS Protocol & Report'\s*:\s*'Generate Full AMV'\}\s*<\/span>/g,
  `{(!isLoading && newAMVReadyInfo) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✓ Ready! Generate Again</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isDissolution
                          ? 'Generate Dissolution Protocol & Report'
                          : isRS
                          ? 'Generate RS Protocol & Report'
                          : 'Generate Full AMV'}
                      </span>
                    </>
                  )}`
);

fs.writeFileSync('src/components/AMVInputForm.tsx', content, 'utf-8');
