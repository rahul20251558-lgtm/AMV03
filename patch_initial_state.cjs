const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const initialCodes = `const initialCodes = generateUniqueValidationCodes('Tibolone Tablets BP 2.5 mg');`;
if (!content.includes('const initialCodes = generateUniqueValidationCodes')) {
    content = content.replace(
        "const [documentNo, setDocumentNo] = useState('WC/QC/AMV/0316');\n  const [batchNo, setBatchNo] = useState('TB2501');\n  const [standardLot, setStandardLot] = useState('WS/DIS/2026/019');\n  const [companyName, setCompanyName] = useState('WESTCOAST PHARMACEUTICAL WORKS LTD.');\n  const [reportDate, setReportDate] = useState('20-Apr-2026');",
        `const initialCodes = generateUniqueValidationCodes('Tibolone Tablets BP 2.5 mg');
  const [documentNo, setDocumentNo] = useState(initialCodes.documentNo);
  const [batchNo, setBatchNo] = useState(initialCodes.validationBatchNo);
  const [standardLot, setStandardLot] = useState(initialCodes.standardLotNo);
  const [companyName, setCompanyName] = useState('WESTCOAST PHARMACEUTICAL WORKS LTD.');
  const [reportDate, setReportDate] = useState('20-Apr-2026');`
    );

    content = content.replace(
        `buildFullDissolutionAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: 'WC/QC/AMV/0316',
      batchNo: 'TB2501',
      standardLot: 'WS/DIS/2026/019',`,
        `buildFullDissolutionAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: initialCodes.documentNo,
      batchNo: initialCodes.validationBatchNo,
      standardLot: initialCodes.standardLotNo,`
    );

    content = content.replace(
        `buildFullRSAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: 'WC/QC/RS/0316',
      batchNo: 'TB2501',
      standardLot: 'WS/DIS/2026/019',`,
        `buildFullRSAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: initialCodes.documentNo,
      batchNo: initialCodes.validationBatchNo,
      standardLot: initialCodes.standardLotNo,`
    );

    content = content.replace(
        `generateAMVDataForProduct('Tibolone Tablets BP 2.5 mg', {
      documentNo: 'WC/QC/AMV/0316',
      validationBatchNo: 'TB2501',
      standardLotNo: 'WS/DIS/2026/019',`,
        `generateAMVDataForProduct('Tibolone Tablets BP 2.5 mg', {
      documentNo: initialCodes.documentNo,
      validationBatchNo: initialCodes.validationBatchNo,
      standardLotNo: initialCodes.standardLotNo,`
    );

    fs.writeFileSync('src/App.tsx', content, 'utf-8');
    console.log("Patched App.tsx initial states");
}
