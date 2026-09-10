const fs = require('fs');
const file = 'src/services/complianceAuditGate.ts';
let code = fs.readFileSync(file, 'utf8');

const callLogic = `
  const testParameter = docData?.testParameter || docData?.methodSummary?.generalInformation?.testParameter || '';
  const labelClaim = docData?.labelClaim || docData?.methodSummary?.generalInformation?.labelClaim || '';
  
  const fdcIssues = checkFdcLabelClaim(productName, testParameter, labelClaim);
  if (fdcIssues.length > 0) {
    fdcIssues.forEach(msg => {
      blockers.push(msg);
      checks.push({
        id: 'audit-00-fdc-mismatch',
        category: 'Product Identity',
        title: 'FDC Label Claim Match',
        status: 'failed',
        message: msg,
      });
    });
  } else if (productName.includes('/')) {
    checks.push({
      id: 'audit-00-fdc-mismatch',
      category: 'Product Identity',
      title: 'FDC Label Claim Match',
      status: 'passed',
      message: 'Label Claim strictly matches the strength of the target active ingredient.',
    });
  }
`;

if (!code.includes('checkFdcLabelClaim(productName, testParameter, labelClaim)')) {
  // Insert right after checking isDissolution
  code = code.replace(
    "const isDissolution = validationMethod === 'dissolution';",
    "const isDissolution = validationMethod === 'dissolution';\n" + callLogic
  );
  fs.writeFileSync(file, code);
}
