const fs = require('fs');

const modalCode = fs.readFileSync('src/components/FPSExtractorModal.tsx', 'utf8');

// The workerSrc is set using cdnjs, but maybe it's failing to load or parse. Let's make sure it handles errors properly.
// The issue is probably with the accept attribute in AMVInputForm.tsx, which I just fixed in previous step.

