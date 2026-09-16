import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `const checkResult = checkReportNoExists(activeDocumentNo, activeProduct);`;
const validationBlock = `
    const activeMethod = targetMethod || validationMethod;
    const strengthMatch = activeProduct.match(/([0-9.]+)\\s*(mg|g|mcg|µg|ml|%|w\\/v|w\\/w)/i);
    const activeStrength = strengthMatch ? strengthMatch[0] : '';
    
    // Add local codes to get batchNo before validation
    const localCodes = generateUniqueValidationCodes(activeProduct);

    const valResult = validateRegistryBeforeGeneration({
      docNo: activeDocumentNo,
      product: activeProduct,
      strength: activeStrength,
      testType: activeMethod,
      batchNo: localCodes.validationBatchNo,
      date: new Date().toLocaleDateString()
    });

    if (!valResult.valid) {
      alert('Generation Blocked: ' + valResult.error);
      return;
    }
    
    if (valResult.warning) {
      alert(valResult.warning);
    }

    const checkResult = checkReportNoExists(activeDocumentNo, activeProduct);
`;

code = code.replace(anchor, validationBlock);

// Also need to addRegistryEntry
const addRegAnchor = `checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);`;
const addRegBlock = `
        addRegistryEntry({
          docNo: activeDocumentNo,
          product: activeProduct,
          strength: activeStrength,
          testType: activeMethod,
          batchNo: codes.validationBatchNo,
          date: new Date().toLocaleDateString()
        });
        checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);
`;
code = code.replace(addRegAnchor, addRegBlock);

fs.writeFileSync('src/App.tsx', code);
