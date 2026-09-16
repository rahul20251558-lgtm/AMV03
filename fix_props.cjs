const fs = require('fs');
let content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf8');

content = content.replace(
  "data, docType, theme, dataMode, fontFamily, fontSize, onUpdateData\n}) => {",
  `data, docType, theme, dataMode, fontFamily, fontSize, onUpdateData,
  onFontFamilyChange, onFontSizeChange, onDocTypeChange, onThemeChange,
  onDownloadProtocol, onDownloadReport, onDownloadBoth\n}) => {
  const isProtocol = docType === 'protocol';`
);

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', content);
