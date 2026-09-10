const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const original = `    if (diffs.length > 0 && !val.isValid) {
      setIsMajorChangeModalOpen(true);
    }`;

const replaced = `    if (diffs.length > 0 && !val.isValid) {
      setIsMajorChangeModalOpen(true);
      setIsMajorChangeJustificationNeeded(true);
    } else {
      setIsMajorChangeJustificationNeeded(false);
    }`;

code = code.replace(original, replaced);

fs.writeFileSync('src/App.tsx', code);
