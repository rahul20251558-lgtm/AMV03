const fs = require('fs');
const file = 'src/services/pharmaMathEngine.ts';
let code = fs.readFileSync(file, 'utf8');

const dynamicLabelClaimLogic = `
/**
 * Extracts a strictly matching Label Claim for FDC or single-active products based on the test parameter.
 */
export function extractDynamicLabelClaim(productName: string, testParameter: string, fallbackActive: string, fallbackLabelClaim: string): { activeSubstance: string, labelClaim: string } {
  if (!productName) return { activeSubstance: fallbackActive, labelClaim: fallbackLabelClaim };

  let name = productName.replace(/Tablets|Capsules|Injection|Oral Solution|Syrup|Suspension|BP|USP|EP/ig, '');
  name = name.replace(/[()]/g, ' ').trim();
  
  const fdcStrengthMatch = name.match(/((?:\\d+(?:\\.\\d+)?)(?:\\s*\\/\\s*(?:\\d+(?:\\.\\d+)?))+)/);
  const singleStrengthMatch = name.match(/(\\d+(?:\\.\\d+)?)\\s*(mg|g|mcg|µg|ml|\\%)/i);
  
  // Use testParameter to find active, fallback to fallbackActive
  const targetActive = testParameter || fallbackActive;

  if (fdcStrengthMatch) {
    const strengths = fdcStrengthMatch[1].split('/').map(s => parseFloat(s.trim()));
    const activesPart = name.substring(0, fdcStrengthMatch.index).trim();
    // Support splitting by /, &, ,, and AND
    const actives = activesPart.split(/\\s*(?:\\/|&|\\,|AND)\\s*/i).map(a => a.trim()).filter(Boolean);
    
    if (actives.length === strengths.length) {
      const activeStrengthMap = actives.map((active, i) => ({ active, strength: strengths[i] }));
      
      let targetActiveObj = null;
      for (const obj of activeStrengthMap) {
        if (new RegExp(\`\\\\b\${obj.active}\\\\b\`, 'i').test(targetActive)) {
          targetActiveObj = obj;
          break;
        }
      }
      
      if (targetActiveObj) {
         // Format the active beautifully: "Amlodipine" instead of "AMLODIPINE"
         const formattedActive = targetActiveObj.active.charAt(0).toUpperCase() + targetActiveObj.active.slice(1).toLowerCase();
         return {
           activeSubstance: formattedActive,
           labelClaim: \`Each tablet contains \${formattedActive} \${targetActiveObj.strength} mg\`
         };
      }
    }
  } else if (singleStrengthMatch) {
    const strength = singleStrengthMatch[1];
    const unit = singleStrengthMatch[2].toLowerCase();
    
    // Find active name from test parameter if possible, e.g. "Assay of Paracetamol" -> "Paracetamol"
    let derivedActive = fallbackActive;
    const assayMatch = targetActive.match(/Assay of (.+)/i);
    const dissoMatch = targetActive.match(/Dissolution of (.+)(?: by)?/i);
    const rsMatch = targetActive.match(/(?:Organic Impurities|Related Substances) (?:of|in) (.+)/i);
    
    if (assayMatch) derivedActive = assayMatch[1].trim();
    else if (dissoMatch) derivedActive = dissoMatch[1].trim();
    else if (rsMatch) derivedActive = rsMatch[1].trim();
    else {
      // Just extract active from product name (everything before strength)
      const activesPart = name.substring(0, singleStrengthMatch.index).trim();
      if (activesPart) derivedActive = activesPart;
    }
    
    // Clean up derived active
    derivedActive = derivedActive.replace(/ by HPLC| by UV| BP| USP| EP/ig, '').trim();
    const formattedActive = derivedActive.charAt(0).toUpperCase() + derivedActive.slice(1).toLowerCase();
    
    return {
      activeSubstance: formattedActive,
      labelClaim: \`Each tablet contains \${formattedActive} \${strength} \${unit}\`
    };
  }
  
  return { activeSubstance: fallbackActive, labelClaim: fallbackLabelClaim };
}
`;

if (!code.includes('extractDynamicLabelClaim')) {
  code = code + '\n' + dynamicLabelClaimLogic;
  fs.writeFileSync(file, code);
  console.log('patched');
} else {
  console.log('already patched');
}
