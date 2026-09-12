const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "const triggerGenerateAMV = (\n    targetProduct?: string,\n    targetMethod?: ValidationMethodType,\n    customOverrides?: FPSOverrides | null,\n    targetApi?: string\n  ) => {",
  "const triggerGenerateAMV = (\n    targetProduct?: string,\n    targetMethod?: ValidationMethodType,\n    customOverrides?: FPSOverrides | null,\n    targetApi?: string,\n    targetDocumentNo?: string\n  ) => {"
);

content = content.replace(
  "const checkResult = checkReportNoExists(documentNo, activeProduct);",
  "const activeDocumentNo = targetDocumentNo || documentNo;\n    const checkResult = checkReportNoExists(activeDocumentNo, activeProduct);"
);

content = content.replace(
  "const confirmMsg = `Report No. \"${documentNo}\"",
  "const confirmMsg = `Report No. \"${activeDocumentNo}\""
);

content = content.replace(
  "triggerGenerateAMV(targetProduct, targetMethod, customOverrides, targetApi);",
  "triggerGenerateAMV(targetProduct, targetMethod, customOverrides, targetApi, checkResult.suggestedNextNo);"
);

content = content.replace(
  "saveReportRecord(documentNo, activeProduct);",
  "saveReportRecord(activeDocumentNo, activeProduct);"
);

// We need to pass activeDocumentNo to the build functions
content = content.replace(
  /reportNo: documentNo/g,
  "reportNo: activeDocumentNo"
);
content = content.replace(
  /protocolNo: documentNo/g,
  "protocolNo: activeDocumentNo"
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
