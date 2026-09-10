const fs = require('fs');
const file = 'src/services/pharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "export function generateAMVDataForProduct(",
  "export function generateAMVDataForProduct(\n  productName: string,\n  existingCodes?: Partial<UniqueCodes>,\n  fpsOverrides?: any\n) {\n  const mono = getBaseMonograph(productName);\n  if (fpsOverrides) {\n    if (fpsOverrides.column) mono.chromatographicConditions.column = fpsOverrides.column;\n    if (fpsOverrides.mobilePhase) mono.chromatographicConditions.mobilePhase = fpsOverrides.mobilePhase;\n    if (fpsOverrides.flowRate) mono.chromatographicConditions.flowRate = fpsOverrides.flowRate;\n    if (fpsOverrides.wavelength) mono.chromatographicConditions.detectionWavelength = fpsOverrides.wavelength;\n    if (fpsOverrides.injectionVolume) mono.chromatographicConditions.injectionVolume = fpsOverrides.injectionVolume;\n    if (fpsOverrides.columnTemperature) mono.chromatographicConditions.columnTemperature = fpsOverrides.columnTemperature;\n    if (fpsOverrides.runTime) mono.chromatographicConditions.runTime = fpsOverrides.runTime;\n    if (fpsOverrides.diluent) mono.chromatographicConditions.diluent = fpsOverrides.diluent;\n    if (fpsOverrides.workingConcentration) mono.chromatographicConditions.workingConcentration = fpsOverrides.workingConcentration;\n  }\n  return buildFullAMVDataFromMonograph(productName, mono, existingCodes);\n}\n/*"
);

code = code.replace("export function generateAMVDataForProduct(", "*/\nexport function generateAMVDataForProduct(");
fs.writeFileSync(file, code);
