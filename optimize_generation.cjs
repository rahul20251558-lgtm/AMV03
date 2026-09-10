const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the handleGenerate function to skip API calls completely and use local generation directly
const newHandleGenerate = `  // Generate AMV Data for current product (Dissolution, RS, or Assay)
  const handleGenerate = async () => {
    setIsLoading(true);

    // Using 100% Offline Client-Side Engine for Instant Generation
    setTimeout(() => {
      if (validationMethod === 'dissolution') {
        const localDiss = buildFullDissolutionAMVData(productName, {
          verifiedMonograph: fpsOverrides ? { ...fpsOverrides, medium: fpsOverrides.diluent, paddleSpeed: '', qLimit: '', apparatus: '', samplingTime: '' } : undefined,
          protocolNo: documentNo,
          batchNo,
          companyName,
        });
        setDissolutionData(localDiss);
        setDocumentNo(localDiss.protocolNo);
        setBatchNo(localDiss.batchNoUsed);
        checkAndPromptMajorChanges(localDiss, 'dissolution', productName);
        setIsLoading(false);
        return;
      }

      if (validationMethod === 'related_substances') {
        const localRS = buildFullRSAMVData(productName, {
          verifiedMonograph: fpsOverrides ? fpsOverrides : undefined,
          protocolNo: documentNo,
          batchNo,
          companyName,
        });
        setRsData(localRS);
        setDocumentNo(localRS.protocolNo);
        setBatchNo(localRS.batchNoUsed);
        checkAndPromptMajorChanges(localRS, 'related_substances', productName);
        setIsLoading(false);
        return;
      }

      // Assay generation branch
      const localData = generateAMVDataForProduct(productName, {
        documentNo,
        validationBatchNo: batchNo,
        standardLotNo: standardLot,
        companyName,
      }, fpsOverrides);
      
      const recalculated = recalculateAMVData(localData);
      setAssayData(recalculated);
      setDocumentNo(recalculated.documentNo);
      setBatchNo(recalculated.validationBatchNo || recalculated.batchNoUsed || batchNo);
      checkAndPromptMajorChanges(recalculated, 'assay', productName);
      setIsLoading(false);
    }, 100);
  };`;

// Use regex to replace the entire handleGenerate method
code = code.replace(/  \/\/ Generate AMV Data for current product[\s\S]*?checkAndPromptMajorChanges\(recalculated, 'assay', productName\);\n\s*setIsLoading\(false\);\n\s*}\n\s*};\n/, newHandleGenerate + "\n");

fs.writeFileSync('src/App.tsx', code);
