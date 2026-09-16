const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldMLT = `const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo, {
          protocolNo: codes.documentNo,
          reportNo: codes.documentNo.replace('/AMV/', '/AMVR/'),
          companyName,
          reportDate,
        } as any);
        setMltData(localMLT);`;

const newMLT = `const localMLT = generateMLTAMVDataForProduct(activeProduct, codes.validationBatchNo, {
          protocolNo: codes.documentNo,
          reportNo: codes.documentNo.includes('AMV-') ? codes.documentNo.replace('AMV-', 'AMVR-') : codes.documentNo + '-R',
          companyName,
          reportDate,
        } as any);
        setMltData(synchronizeDocumentReportDates(localMLT, reportDate));`;

content = content.replace(oldMLT, newMLT);

// We should also verify if I replaced `codes.documentNo.replace` previously. I think I did not run the patch. Let's do it safely.
