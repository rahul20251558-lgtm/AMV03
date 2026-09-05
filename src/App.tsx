import React, { useState } from 'react';
import {
  AMVDocumentData,
  RSAMVDocumentData,
  DissolutionAMVDocumentData,
  DocumentType,
  ThemeFormat,
  ValidationMethodType,
  FontFamilyType,
  FontSizePt,
} from './types';
import {
  generateAMVDataForProduct,
  generateUniqueValidationCodes,
} from './services/pharmaDatabase';
import { buildFullRSAMVData } from './services/rsPharmaDatabase';
import { buildFullDissolutionAMVData } from './services/dissolutionPharmaDatabase';
import { recalculateAMVData } from './services/mathUtils';
import { generateAndDownloadAMVDocx } from './services/amvDocxGenerator';
import { generateAndDownloadRSAMVDocx } from './services/rsDocxGenerator';
import { generateAndDownloadDissolutionDocx } from './services/dissolutionDocxGenerator';
import { Header } from './components/Header';
import { AMVInputForm } from './components/AMVInputForm';
import { AMVDocumentViewer } from './components/AMVDocumentViewer';
import { RSAMVDocumentViewer } from './components/RSAMVDocumentViewer';
import { DissolutionDocumentViewer } from './components/DissolutionDocumentViewer';

export function App() {
  // Method Type: Default to 'dissolution' as requested by the user, with RS and Assay readily available
  const [validationMethod, setValidationMethod] = useState<ValidationMethodType>('dissolution');

  // Input states
  const [productName, setProductName] = useState('Tibolone Tablets BP 2.5 mg');
  const [documentNo, setDocumentNo] = useState('WC/QC/AMV/0316');
  const [batchNo, setBatchNo] = useState('TB2501');
  const [standardLot, setStandardLot] = useState('WS/DIS/2026/019');
  const [companyName, setCompanyName] = useState('WESTCOAST PHARMACEUTICAL WORKS LTD.');
  const [docType, setDocType] = useState<DocumentType>('report');
  const [theme, setTheme] = useState<ThemeFormat>('blue'); // 'blue' (Executive Blue) or 'simple' (Simple Format No Color)
  const [fontFamily, setFontFamily] = useState<FontFamilyType>('Times New Roman'); // Matches authentic monograph
  const [fontSize, setFontSize] = useState<FontSizePt>(12); // Standard 12pt pharma standard
  const [isLoading, setIsLoading] = useState(false);

  // Initialize authentic Dissolution document state
  const [dissolutionData, setDissolutionData] = useState<DissolutionAMVDocumentData>(() =>
    buildFullDissolutionAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: 'WC/QC/AMV/0316',
      batchNo: 'TB2501',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
    })
  );

  // Initialize authentic RS document state for Sodium Valproate
  const [rsData, setRsData] = useState<RSAMVDocumentData>(() =>
    buildFullRSAMVData('Sodium Valproate Oral Solution BP', {
      protocolNo: 'WC/QC/RS/045',
      batchNo: 'SVS-2601',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
    })
  );

  // Initialize authentic Assay document state for Acarbose Tablets
  const [assayData, setAssayData] = useState<AMVDocumentData>(() =>
    generateAMVDataForProduct('Acarbose Tablets 100 mg', {
      documentNo: 'WC/QC/AMV/033',
      validationBatchNo: 'ACT-2601',
      standardLotNo: 'WS/2026/042',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
    })
  );

  // Dedicated reactive field handlers to instantly reflect user input changes across active documents
  const handleCompanyNameChange = (newCompany: string) => {
    setCompanyName(newCompany);
    setDissolutionData((prev) => ({ ...prev, companyName: newCompany }));
    setRsData((prev) => ({ ...prev, companyName: newCompany }));
    setAssayData((prev) => ({ ...prev, companyName: newCompany }));
  };

  const handleDocumentNoChange = (newDocNo: string) => {
    setDocumentNo(newDocNo);
    if (validationMethod === 'dissolution') {
      setDissolutionData((prev) => ({ ...prev, protocolNo: newDocNo }));
    } else if (validationMethod === 'related_substances') {
      setRsData((prev) => ({ ...prev, protocolNo: newDocNo }));
    } else {
      setAssayData((prev) => ({ ...prev, documentNo: newDocNo }));
    }
  };

  const handleBatchNoChange = (newBatchNo: string) => {
    setBatchNo(newBatchNo);
    if (validationMethod === 'dissolution') {
      setDissolutionData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
    } else if (validationMethod === 'related_substances') {
      setRsData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
    } else {
      setAssayData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
    }
  };

  const handleStandardLotChange = (newLot: string) => {
    setStandardLot(newLot);
    setAssayData((prev) => ({
      ...prev,
      reagentsAndStandards: prev.reagentsAndStandards.map((r) =>
        r.name.includes('Standard') || r.name.includes('WS') || r.name.includes('RS')
          ? { ...r, batchNo: newLot }
          : r
      ),
    }));
  };

  // Handle switching between Dissolution, Related Substances, and Assay methods
  const handleValidationMethodChange = (newMethod: ValidationMethodType) => {
    setValidationMethod(newMethod);
    if (newMethod === 'dissolution') {
      const defaultDissProduct = 'Tibolone Tablets BP 2.5 mg';
      setProductName(defaultDissProduct);
      setDocumentNo('WC/QC/AMV/0316');
      setBatchNo('TB2501');
      setStandardLot('WS/DIS/2026/019');
      setDissolutionData(
        buildFullDissolutionAMVData(defaultDissProduct, {
          protocolNo: 'WC/QC/AMV/0316',
          batchNo: 'TB2501',
          companyName,
        })
      );
    } else if (newMethod === 'related_substances') {
      const defaultRSProduct = 'Sodium Valproate Oral Solution BP';
      setProductName(defaultRSProduct);
      setDocumentNo('WC/QC/RS/045');
      setBatchNo('SVS-2601');
      setStandardLot('WS/RS/2026/018');
      setRsData(
        buildFullRSAMVData(defaultRSProduct, {
          protocolNo: 'WC/QC/RS/045',
          batchNo: 'SVS-2601',
          companyName,
        })
      );
    } else {
      const defaultAssayProduct = 'Acarbose Tablets 100 mg';
      setProductName(defaultAssayProduct);
      setDocumentNo('WC/QC/AMV/033');
      setBatchNo('ACT-2601');
      setStandardLot('WS/2026/042');
      setAssayData(
        generateAMVDataForProduct(defaultAssayProduct, {
          documentNo: 'WC/QC/AMV/033',
          validationBatchNo: 'ACT-2601',
          standardLotNo: 'WS/2026/042',
          companyName,
        })
      );
    }
  };

  const handleProductNameChange = (newProduct: string) => {
    setProductName(newProduct);
    const codes = generateUniqueValidationCodes(newProduct);
    const prefix =
      validationMethod === 'dissolution'
        ? 'WC/QC/AMV'
        : validationMethod === 'related_substances'
        ? 'WC/QC/RS'
        : 'WC/QC/AMV';
    const cleanDocNo = codes.documentNo.replace('WC/QC/AMV', prefix);
    setDocumentNo(cleanDocNo);
    setBatchNo(codes.validationBatchNo);
    setStandardLot(codes.standardLotNo);
  };

  // Roll new dynamic identifiers
  const handleRefreshCodes = () => {
    const codes = generateUniqueValidationCodes(productName);
    const prefix =
      validationMethod === 'dissolution'
        ? 'WC/QC/AMV'
        : validationMethod === 'related_substances'
        ? 'WC/QC/RS'
        : 'WC/QC/AMV';
    const cleanDocNo = codes.documentNo.replace('WC/QC/AMV', prefix);
    setDocumentNo(cleanDocNo);
    setBatchNo(codes.validationBatchNo);
    setStandardLot(codes.standardLotNo);

    if (validationMethod === 'dissolution') {
      setDissolutionData((prev) => ({
        ...prev,
        protocolNo: cleanDocNo,
        batchNoUsed: codes.validationBatchNo,
      }));
    } else if (validationMethod === 'related_substances') {
      setRsData((prev) => ({
        ...prev,
        protocolNo: cleanDocNo,
        batchNoUsed: codes.validationBatchNo,
      }));
    } else {
      setAssayData((prev) =>
        recalculateAMVData({
          ...prev,
          documentNo: cleanDocNo,
          batchNoUsed: codes.validationBatchNo,
          reagentsAndStandards: prev.reagentsAndStandards.map((r) =>
            r.name.includes('RS') ? { ...r, batchNo: codes.referenceStandardLot } : r
          ),
        })
      );
    }
  };

  // Generate AMV Data for current product (Dissolution, RS, or Assay)
  const handleGenerate = async () => {
    setIsLoading(true);

    if (validationMethod === 'dissolution') {
      try {
        const response = await fetch('/api/generate-dissolution-amv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName,
            protocolNo: documentNo,
            batchNo,
            companyName,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.data) {
            setDissolutionData(json.data);
            setDocumentNo(json.data.protocolNo);
            setBatchNo(json.data.batchNoUsed);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable, using Dissolution compendium synthesis engine:', err);
      }

      // Built-in Dissolution Synthesis Engine
      const localDiss = buildFullDissolutionAMVData(productName, {
        protocolNo: documentNo,
        batchNo,
        companyName,
      });
      setDissolutionData(localDiss);
      setDocumentNo(localDiss.protocolNo);
      setBatchNo(localDiss.batchNoUsed);
      setIsLoading(false);
      return;
    }

    if (validationMethod === 'related_substances') {
      try {
        const response = await fetch('/api/generate-rs-amv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName,
            protocolNo: documentNo,
            batchNo,
            companyName,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.data) {
            setRsData(json.data);
            setDocumentNo(json.data.protocolNo);
            setBatchNo(json.data.batchNoUsed);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable, using RS compendium synthesis engine:', err);
      }

      // Built-in RS Synthesis Engine (supports compendial & any "other product")
      const localRS = buildFullRSAMVData(productName, {
        protocolNo: documentNo,
        batchNo,
        companyName,
      });
      setRsData(localRS);
      setDocumentNo(localRS.protocolNo);
      setBatchNo(localRS.batchNoUsed);
      setIsLoading(false);
      return;
    }

    // Assay generation branch
    try {
      const response = await fetch('/api/generate-amv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          documentNo,
          batchNo,
          companyName,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          const recalculated = recalculateAMVData(json.data);
          setAssayData(recalculated);
          setDocumentNo(recalculated.documentNo);
          setBatchNo(recalculated.batchNoUsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using compendium database:', err);
    }

    const localData = generateAMVDataForProduct(productName, {
      documentNo,
      validationBatchNo: batchNo,
      standardLotNo: standardLot,
      companyName,
    });
    setAssayData(localData);
    setDocumentNo(localData.documentNo);
    setBatchNo(localData.batchNoUsed);
    setIsLoading(false);
  };

  // Download .docx handlers
  const handleDownloadProtocol = async () => {
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize });
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'protocol', theme, fontFamily, fontSize });
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'protocol', theme, fontFamily, fontSize });
    }
  };

  const handleDownloadReport = async () => {
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize });
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'report', theme, fontFamily, fontSize });
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'report', theme, fontFamily, fontSize });
    }
  };

  const handleDownloadBoth = async () => {
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize });
      setTimeout(async () => {
        await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize });
      }, 600);
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'protocol', theme, fontFamily, fontSize });
      setTimeout(async () => {
        await generateAndDownloadRSAMVDocx(rsData, { docType: 'report', theme, fontFamily, fontSize });
      }, 600);
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'protocol', theme, fontFamily, fontSize });
      setTimeout(async () => {
        await generateAndDownloadAMVDocx(assayData, { docType: 'report', theme, fontFamily, fontSize });
      }, 600);
    }
  };

  const handleUpdateAssayData = (updated: AMVDocumentData) => {
    const recalculated = recalculateAMVData(updated);
    setAssayData(recalculated);
  };

  const handleUpdateRSData = (updated: RSAMVDocumentData) => {
    setRsData(updated);
  };

  const handleUpdateDissolutionData = (updated: DissolutionAMVDocumentData) => {
    setDissolutionData(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 pb-16">
      {/* Header */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        activeDocType={docType}
        onDocTypeChange={setDocType}
        validationMethod={validationMethod}
        onValidationMethodChange={handleValidationMethodChange}
        fontFamily={fontFamily}
        fontSize={fontSize}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onDownloadDocx={() =>
          docType === 'protocol' ? handleDownloadProtocol() : handleDownloadReport()
        }
        onPrint={() => window.print()}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Input & Product Selection Form */}
        <AMVInputForm
          productName={productName}
          onProductNameChange={handleProductNameChange}
          documentNo={documentNo}
          onDocumentNoChange={handleDocumentNoChange}
          batchNo={batchNo}
          onBatchNoChange={handleBatchNoChange}
          standardLot={standardLot}
          onStandardLotChange={handleStandardLotChange}
          companyName={companyName}
          onCompanyNameChange={handleCompanyNameChange}
          validationMethod={validationMethod}
          onValidationMethodChange={handleValidationMethodChange}
          onGenerate={handleGenerate}
          onRefreshCodes={handleRefreshCodes}
          isLoading={isLoading}
          theme={theme}
        />

        {/* Live Document Viewer & Exporter: Dissolution vs AMV (RS Format) vs Assay Format */}
        {validationMethod === 'dissolution' ? (
          <DissolutionDocumentViewer
            data={dissolutionData}
            docType={docType}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamilyChange={setFontFamily}
            onFontSizeChange={setFontSize}
            onDocTypeChange={setDocType}
            onThemeChange={setTheme}
            onDownloadProtocol={handleDownloadProtocol}
            onDownloadReport={handleDownloadReport}
            onDownloadBoth={handleDownloadBoth}
            onUpdateData={handleUpdateDissolutionData}
          />
        ) : validationMethod === 'related_substances' ? (
          <RSAMVDocumentViewer
            data={rsData}
            docType={docType}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamilyChange={setFontFamily}
            onFontSizeChange={setFontSize}
            onDocTypeChange={setDocType}
            onThemeChange={setTheme}
            onDownloadProtocol={handleDownloadProtocol}
            onDownloadReport={handleDownloadReport}
            onDownloadBoth={handleDownloadBoth}
            onUpdateData={handleUpdateRSData}
          />
        ) : (
          <AMVDocumentViewer
            data={assayData}
            docType={docType}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamilyChange={setFontFamily}
            onFontSizeChange={setFontSize}
            onDocTypeChange={setDocType}
            onThemeChange={setTheme}
            onDownloadProtocol={handleDownloadProtocol}
            onDownloadReport={handleDownloadReport}
            onDownloadBoth={handleDownloadBoth}
            onUpdateData={handleUpdateAssayData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
