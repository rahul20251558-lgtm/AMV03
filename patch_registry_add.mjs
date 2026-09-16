import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `
        if (activeMethod === 'dissolution') {
          
        addRegistryEntry({
          docNo: activeDocumentNo,
          product: activeProduct,
          strength: activeStrength,
          testType: activeMethod,
          batchNo: codes.validationBatchNo,
          date: new Date().toLocaleDateString()
        });
        checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);`;

const replacement = `
        addRegistryEntry({
          docNo: activeDocumentNo,
          product: activeProduct,
          strength: activeStrength,
          testType: activeMethod,
          batchNo: codes.validationBatchNo,
          date: new Date().toLocaleDateString()
        });
        
        if (activeMethod === 'dissolution') {
        checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/App.tsx', code);
