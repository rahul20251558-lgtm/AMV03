const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert getCurrentDocData helper function just before auditResult
const helperFunc = `  const getCurrentDocData = () => {
    if (validationMethod === 'dissolution') return dissolutionData;
    if (validationMethod === 'related_substances') return rsData;
    return assayData;
  };

`;

code = code.replace('  // Live computed compliance audit result', helperFunc + '  // Live computed compliance audit result');

fs.writeFileSync('src/App.tsx', code);
