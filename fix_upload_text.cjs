const fs = require('fs');

let inputForm = fs.readFileSync('src/components/AMVInputForm.tsx', 'utf8');
inputForm = inputForm.replace('<span className="text-[10px] text-zinc-500 mt-1">Image or Document</span>', '<span className="text-[10px] text-zinc-500 mt-1">PDF Document or Image</span>');

// If that string doesn't exactly match, let's just do a regex replace
inputForm = inputForm.replace(/<span className="text-\[10px\] text-zinc-500 mt-1">.*?<\/span>/, '<span className="text-[10px] text-zinc-500 mt-1">PDF or Image (Auto-Extract limits)</span>');

fs.writeFileSync('src/components/AMVInputForm.tsx', inputForm);
