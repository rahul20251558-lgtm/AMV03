function extractLabelClaim(productName, targetActive) {
  // Clean product name of common pharmaceutical terms and brackets
  let name = productName.replace(/Tablets|Capsules|Injection|Oral Solution|Syrup|Suspension|BP|USP|EP/ig, '');
  name = name.replace(/[()]/g, ' ').trim();
  
  // Find strengths part (numbers separated by / or just a single number)
  const fdcStrengthMatch = name.match(/((?:\d+(?:\.\d+)?)(?:\s*\/\s*(?:\d+(?:\.\d+)?))+)/);
  const singleStrengthMatch = name.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|µg|ml|\%)/i);

  if (fdcStrengthMatch) {
    const strengths = fdcStrengthMatch[1].split('/').map(s => parseFloat(s.trim()));
    const activesPart = name.substring(0, fdcStrengthMatch.index).trim();
    // Split actives by , & AND /
    const actives = activesPart.split(/\s*(?:\/|&|\,|AND)\s*/i).map(a => a.trim()).filter(Boolean);
    
    if (actives.length === strengths.length) {
      const activeStrengthMap = actives.map((active, i) => ({ active, strength: strengths[i] }));
      
      let targetActiveObj = null;
      for (const obj of activeStrengthMap) {
        if (new RegExp(`\\b${obj.active}\\b`, 'i').test(targetActive)) {
          targetActiveObj = obj;
          break;
        }
      }
      
      if (targetActiveObj) {
         return `Each tablet contains ${targetActiveObj.active} ${targetActiveObj.strength} mg`;
      }
    }
  } else if (singleStrengthMatch) {
    const strength = singleStrengthMatch[1];
    const unit = singleStrengthMatch[2];
    return `Each tablet contains ${targetActive} ${strength} ${unit}`;
  }
  
  return null;
}

console.log(extractLabelClaim("AMLODIPINE, VALSARTAN AND HYDROCHLOROTHIAZIDE TABLETS USP (10/160/12.5MG)", "Amlodipine Besylate"));
console.log(extractLabelClaim("Tibolone Tablets BP 2.5 mg", "Tibolone"));
console.log(extractLabelClaim("Paracetamol 500mg Tablets", "Paracetamol"));
