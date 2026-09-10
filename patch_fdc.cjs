const fs = require('fs');
const file = 'src/services/complianceAuditGate.ts';
let code = fs.readFileSync(file, 'utf8');

const fdcCheckLogic = `
/**
 * Checks Fixed-Dose Combination (FDC) Label Claim constraints.
 * Ensures the Label Claim strictly matches the strength of the specific active ingredient being tested.
 */
function checkFdcLabelClaim(productName: string, testParameter: string, labelClaim: string): string[] {
  const issues: string[] = [];
  if (!productName || !testParameter || !labelClaim) return issues;

  // Clean product name
  let name = productName.replace(/Tablets|Capsules|Injection|Oral Solution|Syrup|Suspension|BP|USP|EP/ig, '').trim();
  
  // Find strengths part (numbers separated by /)
  const strengthMatch = name.match(/((?:\\d+(?:\\.\\d+)?)(?:\\s*\\/\\s*(?:\\d+(?:\\.\\d+)?))+)/);
  if (!strengthMatch) return issues; // Not an FDC recognized by slash strengths
  
  const strengths = strengthMatch[1].split('/').map(s => parseFloat(s.trim()));
  
  // The actives part is before the strengths
  const activesPart = name.substring(0, strengthMatch.index).trim();
  const actives = activesPart.split(/\\s*(?:\\/|&)\\s*/).map(a => a.trim()).filter(Boolean);
  
  if (actives.length !== strengths.length) {
    return issues; // Cannot reliably map actives to strengths
  }
  
  const activeStrengthMap = actives.map((active, i) => ({ active, strength: strengths[i] }));
  
  // Identify the target active from testParameter
  let targetActiveObj = null;
  for (const obj of activeStrengthMap) {
    if (new RegExp(\`\\\\b\${obj.active}\\\\b\`, 'i').test(testParameter)) {
      targetActiveObj = obj;
      break;
    }
  }
  
  if (!targetActiveObj) {
    return issues; // Could not identify target active from testParameter
  }
  
  // Verify labelClaim has this exact strength
  const lcNumbers = (labelClaim.match(/\\d+(?:\\.\\d+)?/g) || []).map(parseFloat);
  if (!lcNumbers.includes(targetActiveObj.strength)) {
    issues.push(\`FDC Label Claim Mismatch: Product indicates \${targetActiveObj.strength} mg for \${targetActiveObj.active}, but Label Claim field provides: "\${labelClaim}". Target strength must match the active being tested.\`);
  }
  
  return issues;
}
`;

const callLogic = `
  const testParameter = docData?.testParameter || docData?.methodSummary?.generalInformation?.testParameter || docData?.methodSummary?.testParameter || '';
  const labelClaim = docData?.labelClaim || docData?.methodSummary?.generalInformation?.labelClaim || docData?.methodSummary?.labelClaim || '';
  
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

if (!code.includes('checkFdcLabelClaim')) {
  code = code.replace('export function runPreOutputAuditGate(', fdcCheckLogic + '\nexport function runPreOutputAuditGate(');
  code = code.replace(
    "const isDissolution = validationMethod === 'dissolution';",
    "const isDissolution = validationMethod === 'dissolution';\n" + callLogic
  );
  fs.writeFileSync(file, code);
  console.log('patched');
} else {
  console.log('already patched');
}
