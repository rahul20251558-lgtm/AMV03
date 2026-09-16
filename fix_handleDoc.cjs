const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandle = `  const handleDocumentNoChange = (newDocNo: string) => {
    setDocumentNo(newDocNo);
    setDissolutionData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setRsData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setAssayData((prev) => ({ ...prev, documentNo: newDocNo }));
  };`;

const newHandle = `  const handleDocumentNoChange = (newDocNo: string) => {
    setDocumentNo(newDocNo);
    setDissolutionData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setRsData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setAssayData((prev) => ({ ...prev, documentNo: newDocNo }));
    setMltData((prev) => ({ ...prev, protocolNo: newDocNo, reportNo: newDocNo.includes('AMV-') ? newDocNo.replace('AMV-', 'AMVR-') : newDocNo + '-R' }));
  };`;

content = content.replace(oldHandle, newHandle);
fs.writeFileSync('src/App.tsx', content);
