const productName = "AMLODIPINE, VALSARTAN AND HYDROCHLOROTHIAZIDE TABLETS USP (10/160/12.5MG)";
let name = productName.replace(/Tablets|Capsules|Injection|Oral Solution|Syrup|Suspension|BP|USP|EP/ig, '').trim();
const strengthMatch = name.match(/((?:\d+(?:\.\d+)?)(?:\s*\/\s*(?:\d+(?:\.\d+)?))+)/);
if (strengthMatch) {
  const strengths = strengthMatch[1].split('/').map(s => parseFloat(s.trim()));
  const activesPart = name.substring(0, strengthMatch.index).trim();
  const actives = activesPart.split(/\s*(?:\/|&|\,|AND)\s*/i).map(a => a.trim()).filter(Boolean);
  
  console.log({ strengths, activesPart, actives, match: actives.length === strengths.length });
}
