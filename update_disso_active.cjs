const fs = require('fs');
const file = 'src/services/dissolutionPharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('dynamicActiveSubstance = extracted.activeSubstance')) {
  code = code.replace(
    "let dynamicLabelClaim = extracted.labelClaim;",
    "let dynamicLabelClaim = extracted.labelClaim;\n  let dynamicActiveSubstance = extracted.activeSubstance;"
  );
  
  // also let's look at where the drugKeyName is used.
  //   const drugKeyName = (mono.productName.split(' ')[0] || 'Active').replace(/[^a-zA-Z]/g, '');
  // we can change it to use dynamicActiveSubstance
  code = code.replace(
    "const drugKeyName = (mono.productName.split(' ')[0] || 'Active').replace(/[^a-zA-Z]/g, '');",
    "const drugKeyName = (dynamicActiveSubstance || mono.productName.split(' ')[0] || 'Active').replace(/[^a-zA-Z]/g, '');"
  );
  
  fs.writeFileSync(file, code);
  console.log('updated');
}
