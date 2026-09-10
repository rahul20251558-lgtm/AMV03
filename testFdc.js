const productName = "Amlodipine / Valsartan / Hydrochlorothiazide Tablets 10/160/12.5 mg";
const testParameter = "Assay of Valsartan";
const labelClaim = "Each tablet contains Valsartan 160 mg";

function checkFdc(productName, testParameter, labelClaim) {
  // Extract actives and strengths from product name
  // Assuming pattern: Active1 / Active2 [/ Active3...] [Form] Strength1/Strength2[/Strength3...] [unit]
  
  // Clean product name
  let name = productName.replace(/Tablets|Capsules|Injection|Oral Solution|Syrup|Suspension|BP|USP|EP/ig, '').trim();
  
  // Find strengths part (numbers separated by /)
  const strengthMatch = name.match(/((?:\d+(?:\.\d+)?)(?:\s*\/\s*(?:\d+(?:\.\d+)?))+)/);
  if (!strengthMatch) return; // Not an FDC recognized by slash strengths
  
  const strengths = strengthMatch[1].split('/').map(s => parseFloat(s.trim()));
  
  // The actives part is before the strengths
  const activesPart = name.substring(0, strengthMatch.index).trim();
  const actives = activesPart.split(/\s*(?:\/|&)\s*/).map(a => a.trim()).filter(Boolean);
  
  if (actives.length !== strengths.length) {
    console.log("Mismatched actives and strengths length", actives, strengths);
    return;
  }
  
  const activeStrengthMap = actives.map((active, i) => ({ active, strength: strengths[i] }));
  console.log("Map:", activeStrengthMap);
  
  // Identify the target active from testParameter
  let targetActiveObj = null;
  for (const obj of activeStrengthMap) {
    if (new RegExp(`\\b${obj.active}\\b`, 'i').test(testParameter)) {
      targetActiveObj = obj;
      break;
    }
  }
  
  if (!targetActiveObj) {
    console.log("Could not identify target active from testParameter");
    return;
  }
  
  console.log("Target active:", targetActiveObj);
  
  // Verify labelClaim has this exact strength
  const lcNumbers = (labelClaim.match(/\d+(?:\.\d+)?/g) || []).map(parseFloat);
  if (!lcNumbers.includes(targetActiveObj.strength)) {
    console.log(`ERROR: Label Claim does not contain the strength ${targetActiveObj.strength} for ${targetActiveObj.active}. Found: ${lcNumbers}`);
  } else {
    console.log(`SUCCESS: Label Claim contains ${targetActiveObj.strength} for ${targetActiveObj.active}.`);
  }
}

checkFdc(productName, testParameter, labelClaim);
checkFdc("Amlodipine / Valsartan / Hydrochlorothiazide Tablets 10/160/12.5 mg", "Assay of Amlodipine", "Each tablet contains Amlodipine 10 mg");
checkFdc("Amlodipine / Valsartan / Hydrochlorothiazide Tablets 10/160/12.5 mg", "Assay of Hydrochlorothiazide", "Each tablet contains HCTZ 12.5 mg");
checkFdc("Amlodipine / Valsartan / Hydrochlorothiazide Tablets 10/160/12.5 mg", "Assay of Valsartan", "Each tablet contains Valsartan 10 mg"); // Should fail

