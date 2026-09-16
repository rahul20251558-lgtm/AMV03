const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// For handleDownloadProtocol
content = content.replace(
  /const handleDownloadProtocol = async \(\) => \{[\s\S]*?\} else if \(validationMethod === 'microbial_limit_test'\) \{[\s\S]*?\} else if \(validationMethod === 'related_substances'\) \{/m,
  `const handleDownloadProtocol = async () => {
    if (!verifyComplianceGate('protocol')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'microbial_limit_test') {
      await generateAndDownloadMLTDocx(mltData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'related_substances') {`
);

// For handleDownloadReport
content = content.replace(
  /const handleDownloadReport = async \(\) => \{[\s\S]*?\} else if \(validationMethod === 'microbial_limit_test'\) \{[\s\S]*?\} else if \(validationMethod === 'related_substances'\) \{/m,
  `const handleDownloadReport = async () => {
    if (!verifyComplianceGate('report')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'microbial_limit_test') {
      await generateAndDownloadMLTDocx(mltData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'related_substances') {`
);

// For handleDownloadBoth
content = content.replace(
  /const handleDownloadBoth = async \(\) => \{[\s\S]*?\} else if \(validationMethod === 'microbial_limit_test'\) \{[\s\S]*?\} else if \(validationMethod === 'related_substances'\) \{/m,
  `const handleDownloadBoth = async () => {
    if (!verifyComplianceGate('both')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
      setTimeout(async () => {
        await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
      }, 600);
    } else if (validationMethod === 'microbial_limit_test') {
      await generateAndDownloadMLTDocx(mltData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
      setTimeout(async () => {
        await generateAndDownloadMLTDocx(mltData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
      }, 600);
    } else if (validationMethod === 'related_substances') {`
);

fs.writeFileSync('src/App.tsx', content);
