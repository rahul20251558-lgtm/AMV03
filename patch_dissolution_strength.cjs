const fs = require('fs');

let content = fs.readFileSync('src/services/dissolutionPharmaDatabase.ts', 'utf-8');

// The call inside buildFullDissolutionAMVData:
content = content.replace(
  "const { strengthNum, unit } = parseProductStrength(mono.productName || productName);",
  "const { strengthNum, unit } = parseProductStrength(mono.productName || productName, overrides?.targetApi);"
);

// We need to pass targetApi to getDissolutionMonograph or at least override the strength inside buildFullDissolutionAMVData!
// Wait, buildFullDissolutionAMVData does this:
// const { strengthNum, unit } = parseProductStrength(mono.productName || productName, overrides?.targetApi);
// That should calculate strengthNum correctly!
// Is there any other place in buildFullDissolutionAMVData where strengthNum is retrieved from mono directly?
// No, the grep output showed that it uses parseProductStrength in buildFullDissolutionAMVData:
// const { strengthNum, unit } = parseProductStrength(mono.productName || productName);

fs.writeFileSync('src/services/dissolutionPharmaDatabase.ts', content, 'utf-8');
