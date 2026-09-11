import React, { useState, useMemo } from 'react';
import {
  AMVDocumentData,
  RSAMVDocumentData,
  DissolutionAMVDocumentData,
  DocumentType,
  ThemeFormat,
  ValidationMethodType,
  FontFamilyType,
  FontSizePt,
  DataMode,
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
import { runPreOutputAuditGate, ComplianceGateResult } from './services/complianceAuditGate';
import { extractSSOTBlock } from './services/selfAuditEngine';
import { Header } from './components/Header';
import { AMVInputForm } from './components/AMVInputForm';
import { FPSExtractorModal, FPSOverrides } from './components/FPSExtractorModal';
import { AMVDocumentViewer } from './components/AMVDocumentViewer';
import { RSAMVDocumentViewer } from './components/RSAMVDocumentViewer';
import { DissolutionDocumentViewer } from './components/DissolutionDocumentViewer';
import { ComplianceAuditModal } from './components/ComplianceAuditModal';
import { MajorChangePromptModal } from './components/MajorChangePromptModal';
import { SSOTModal } from './components/SSOTModal';
import { MasterPromptModal } from './components/MasterPromptModal';
import {
  extractCoreMethodParameters,
  compareCoreMethodParameters,
  getBaselineLookupKey,
  DEFAULT_METHOD_BASELINES,
  validateRevisionReasonForMajorChanges,
  MethodDiffItem,
} from './services/methodVersionHistory';

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
  const [dataMode, setDataMode] = useState<DataMode>('DEMO'); // 'TEMPLATE' (default blank raw data) or 'DEMO' (verified analytical demonstration with watermark)
  const [isLoading, setIsLoading] = useState(false);

  // COA and FPS Upload states
  const [coaUploaded, setCoaUploaded] = useState(false);
  const [fpsUploaded, setFpsUploaded] = useState(false);
  const [fpsFileData, setFpsFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isFpsModalOpen, setIsFpsModalOpen] = useState(false);
  const [fpsOverrides, setFpsOverrides] = useState<FPSOverrides | null>(null);

  // Pre-Output Compliance & Contamination Audit Gate State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSSOTModalOpen, setIsSSOTModalOpen] = useState(false);
  const [auditNonce, setAuditNonce] = useState(0);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isMajorChangeModalOpen, setIsMajorChangeModalOpen] = useState(false);
  const [isMajorChangeJustificationNeeded, setIsMajorChangeJustificationNeeded] = useState(false);

  const [pendingExport, setPendingExport] = useState<'protocol' | 'report' | 'both' | null>(null);

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

    // Instant real-time regeneration on product change (0 ms lag)
    if (validationMethod === 'dissolution') {
      const localDiss = buildFullDissolutionAMVData(newProduct, {
        verifiedMonograph: fpsOverrides ? {
          ...fpsOverrides,
          ...(fpsOverrides.diluent ? { medium: fpsOverrides.diluent } : {}),
        } : undefined,
        protocolNo: cleanDocNo,
        batchNo: codes.validationBatchNo,
        companyName,
      });
      setDissolutionData(localDiss);
      checkAndPromptMajorChanges(localDiss, 'dissolution', newProduct);
    } else if (validationMethod === 'related_substances') {
      const localRS = buildFullRSAMVData(newProduct, {
        verifiedMonograph: fpsOverrides ? fpsOverrides : undefined,
        protocolNo: cleanDocNo,
        batchNo: codes.validationBatchNo,
        companyName,
      });
      setRsData(localRS);
      checkAndPromptMajorChanges(localRS, 'related_substances', newProduct);
    } else {
      const localData = generateAMVDataForProduct(newProduct, {
        documentNo: cleanDocNo,
        validationBatchNo: codes.validationBatchNo,
        standardLotNo: codes.standardLotNo,
        companyName,
      }, fpsOverrides);
      const recalculated = recalculateAMVData(localData);
      setAssayData(recalculated);
      checkAndPromptMajorChanges(recalculated, 'assay', newProduct);
    }
  };

  const handleConfirmFpsOverrides = (overrides: FPSOverrides, detectedProductName?: string) => {
    setFpsOverrides(overrides);
    setFpsUploaded(true);
    setIsFpsModalOpen(false);

    const activeProduct = (detectedProductName && detectedProductName.trim().length > 0)
      ? detectedProductName.trim()
      : productName;

    if (detectedProductName && detectedProductName.trim().length > 0) {
      setProductName(activeProduct);
    }

    if (validationMethod === 'dissolution') {
      const localDiss = buildFullDissolutionAMVData(activeProduct, {
        verifiedMonograph: overrides ? {
          ...overrides,
          ...(overrides.diluent ? { medium: overrides.diluent } : {}),
        } : undefined,
        protocolNo: documentNo,
        batchNo,
        companyName,
      });
      setDissolutionData(localDiss);
      setDocumentNo(localDiss.protocolNo);
      setBatchNo(localDiss.batchNoUsed);
      checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);
    } else if (validationMethod === 'related_substances') {
      const localRS = buildFullRSAMVData(activeProduct, {
        verifiedMonograph: overrides ? overrides : undefined,
        protocolNo: documentNo,
        batchNo,
        companyName,
      });
      setRsData(localRS);
      setDocumentNo(localRS.protocolNo);
      setBatchNo(localRS.batchNoUsed);
      checkAndPromptMajorChanges(localRS, 'related_substances', activeProduct);
    } else {
      const localData = generateAMVDataForProduct(activeProduct, {
        documentNo,
        validationBatchNo: batchNo,
        standardLotNo: standardLot,
        companyName,
      }, overrides);
      const recalculated = recalculateAMVData(localData);
      setAssayData(recalculated);
      setDocumentNo(recalculated.documentNo);
      setBatchNo(recalculated.batchNoUsed || batchNo);
      checkAndPromptMajorChanges(recalculated, 'assay', activeProduct);
    }
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

  // Automated diff check to prompt user for Reason for Change if major parameters altered
  const checkAndPromptMajorChanges = (
    data: any,
    method: 'dissolution' | 'related_substances' | 'assay',
    pName: string
  ) => {
    const currentParams = extractCoreMethodParameters(data, method);
    const baselineKey = getBaselineLookupKey(pName, method);
    const baselineParams = DEFAULT_METHOD_BASELINES[baselineKey];
    const diffs = compareCoreMethodParameters(currentParams, baselineParams);
    const revs = data.revisionHistory || [];
    const latestReason = revs.length > 0 ? revs[revs.length - 1].reason || '' : '';
    const val = validateRevisionReasonForMajorChanges(latestReason, diffs);
    if (diffs.length > 0 && !val.isValid) {
      setIsMajorChangeModalOpen(true);
      setIsMajorChangeJustificationNeeded(true);
    } else {
      setIsMajorChangeJustificationNeeded(false);
    }
  };

  // Generate AMV Data for current product (Dissolution, RS, or Assay) - 100% Instant & Offline
  const handleGenerate = () => {
    setIsLoading(true);

    try {
      if (validationMethod === 'dissolution') {
        const localDiss = buildFullDissolutionAMVData(productName, {
          verifiedMonograph: fpsOverrides ? {
            ...fpsOverrides,
            ...(fpsOverrides.diluent ? { medium: fpsOverrides.diluent } : {}),
          } : undefined,
          protocolNo: documentNo,
          batchNo,
          companyName,
        });
        setDissolutionData(localDiss);
        setDocumentNo(localDiss.protocolNo);
        setBatchNo(localDiss.batchNoUsed);
        checkAndPromptMajorChanges(localDiss, 'dissolution', productName);
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
      setBatchNo(recalculated.batchNoUsed || batchNo);
      checkAndPromptMajorChanges(recalculated, 'assay', productName);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRevisionReason = (newReason: string) => {
    if (validationMethod === 'dissolution') {
      setDissolutionData((prev) => {
        const revs = [...prev.revisionHistory];
        if (revs.length > 0) {
          revs[revs.length - 1] = { ...revs[revs.length - 1], reason: newReason };
        } else {
          revs.push({
            version: '01',
            effectiveDate: prev.reportDate || '21-Apr-2026',
            reason: newReason,
            docNumber: prev.reportNo || prev.protocolNo,
          });
        }
        return { ...prev, revisionHistory: revs };
      });
    } else if (validationMethod === 'related_substances') {
      setRsData((prev) => {
        const revs = [...prev.revisionHistory];
        if (revs.length > 0) {
          revs[revs.length - 1] = { ...revs[revs.length - 1], reason: newReason };
        } else {
          revs.push({
            version: '01',
            effectiveDate: prev.reportDate || '17/07/2024',
            reason: newReason,
            docNumber: prev.reportNo || prev.protocolNo,
          });
        }
        return { ...prev, revisionHistory: revs };
      });
    } else {
      setAssayData((prev) => {
        const revs = [...prev.revisionHistory];
        if (revs.length > 0) {
          revs[revs.length - 1] = { ...revs[revs.length - 1], reason: newReason };
        } else {
          revs.push({
            version: '01',
            effectiveDate: prev.effectiveDate || '21-Apr-2026',
            reason: newReason,
            docNumber: prev.reportNo || prev.documentNo,
          });
        }
        return { ...prev, revisionHistory: revs };
      });
    }
    setAuditNonce((n) => n + 1);
  };

  


  



  const getCurrentDocData = () => {
    if (validationMethod === 'dissolution') return dissolutionData;
    if (validationMethod === 'related_substances') return rsData;
    return assayData;
  };

  const activeMethodDiffs = useMemo(() => {
    const data = getCurrentDocData();
    const currentParams = extractCoreMethodParameters(data, validationMethod);
    const baselineKey = getBaselineLookupKey(productName, validationMethod);
    const baselineParams = DEFAULT_METHOD_BASELINES[baselineKey];
    if (!baselineParams) return [];
    return compareCoreMethodParameters(currentParams, baselineParams);
  }, [dissolutionData, rsData, assayData, validationMethod, productName]);

  const activeRevisionReason = useMemo(() => {
    const data = getCurrentDocData();
    const revs = data.revisionHistory || [];
    return revs.length > 0 ? revs[revs.length - 1].reason || '' : '';
  }, [dissolutionData, rsData, assayData, validationMethod]);

  // Live computed compliance audit result
  const auditResult = useMemo(() => {
    const data = getCurrentDocData();
    return runPreOutputAuditGate(data, validationMethod);
  }, [dissolutionData, rsData, assayData, validationMethod, auditNonce]);

  // Single Source of Truth (SSOT) Parameters (§1.2)
  const currentSSOT = useMemo(() => {
    return extractSSOTBlock(getCurrentDocData(), validationMethod);
  }, [dissolutionData, rsData, assayData, validationMethod]);

  const handleReAudit = () => {
    setAuditNonce((n) => n + 1);
  };

  // Run Pre-Output Compliance & Contamination Audit Gate before export
  const verifyComplianceGate = (targetExport: 'protocol' | 'report' | 'both'): boolean => {
    // If major parameter shifts exist and justification is lacking, open Major Change Modal
    if (activeMethodDiffs.length > 0) {
      const val = validateRevisionReasonForMajorChanges(activeRevisionReason, activeMethodDiffs);
      if (!val.isValid) {
        setIsMajorChangeModalOpen(true);
        return false;
      }
    }

    if (!auditResult.passed) {
      setPendingExport(targetExport);
      setIsAuditModalOpen(true);
      return false;
    }
    return true;
  };

  // Download .docx handlers protected by Compliance Gate
  const handleDownloadProtocol = async () => {
    if (!verifyComplianceGate('protocol')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
    }
  };

  const handleDownloadReport = async () => {
    if (!verifyComplianceGate('report')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
    }
  };

  const handleDownloadBoth = async () => {
    if (!verifyComplianceGate('both')) return;
    if (validationMethod === 'dissolution') {
      await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
      setTimeout(async () => {
        await generateAndDownloadDissolutionDocx(dissolutionData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
      }, 600);
    } else if (validationMethod === 'related_substances') {
      await generateAndDownloadRSAMVDocx(rsData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
      setTimeout(async () => {
        await generateAndDownloadRSAMVDocx(rsData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
      }, 600);
    } else {
      await generateAndDownloadAMVDocx(assayData, { docType: 'protocol', theme, fontFamily, fontSize, dataMode });
      setTimeout(async () => {
        await generateAndDownloadAMVDocx(assayData, { docType: 'report', theme, fontFamily, fontSize, dataMode });
      }, 600);
    }
  };

  const handleOpenAuditGate = () => {
    setPendingExport(null);
    setIsAuditModalOpen(true);
  };

  const handleProceedExportFromModal = async () => {
    if (pendingExport === 'protocol') {
      await handleDownloadProtocol();
    } else if (pendingExport === 'report') {
      await handleDownloadReport();
    } else if (pendingExport === 'both') {
      await handleDownloadBoth();
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
        dataMode={dataMode}
        onDataModeChange={setDataMode}
        fontFamily={fontFamily}
        fontSize={fontSize}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onDownloadDocx={() =>
          docType === 'protocol' ? handleDownloadProtocol() : handleDownloadReport()
        }
        onPrint={() => window.print()}
        onOpenAuditGate={handleOpenAuditGate}
        onOpenSSOTModal={() => setIsSSOTModalOpen(true)}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        auditPassed={auditResult ? auditResult.passed : true}
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
          coaUploaded={coaUploaded}
          onCoaUpload={(file) => {
            console.log('Simulating COA data extraction from:', file.name);
            // Simulated parse delay
            setIsLoading(true);
            setCoaUploaded(true);
            setIsLoading(false);
          }}
          fpsUploaded={fpsUploaded}
          onOpenFpsModal={() => setIsFpsModalOpen(true)}
          onFpsUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const match = result.match(/^data:(.*?);base64,(.*)$/);
              if (match) {
                setFpsFileData({ mimeType: match[1], base64: match[2] });
                setIsFpsModalOpen(true);
              }
            };
            reader.readAsDataURL(file);
          }}
        />

        {/* Major Parameter Shift Notification Banner */}
        {isMajorChangeJustificationNeeded && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">
                  Major Method Parameter Changes Detected ({activeMethodDiffs.length})
                </span>
                <span className="text-amber-700 ml-2">
                  ICH Q2(R2) &amp; ALCOA+ Data Integrity require an explicit, non-generic parameter explanation in Revision History.
                </span>
              </div>
            </div>
            <button
              type="button"
              id="prompt-major-change-banner-btn"
              onClick={() => setIsMajorChangeModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0"
            >
              Enter Reason for Change
            </button>
          </div>
        )}

        {/* Live Document Viewer & Exporter: Dissolution vs AMV (RS Format) vs Assay Format */}
        {validationMethod === 'dissolution' ? (
          <DissolutionDocumentViewer
            data={dissolutionData}
            docType={docType}
            theme={theme}
            dataMode={dataMode}
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
            dataMode={dataMode}
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
            dataMode={dataMode}
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

      {/* Pre-Output Compliance & Contamination Audit Modal */}
      <ComplianceAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditResult={auditResult}
        onReAudit={handleReAudit}
        onProceedExport={pendingExport ? handleProceedExportFromModal : undefined}
        onOpenMajorChangeModal={() => setIsMajorChangeModalOpen(true)}
        exportType={pendingExport || undefined}
      />

      {/* Mandatory Major Method Parameter Change Explanation Modal */}
      <MajorChangePromptModal
        isOpen={isMajorChangeModalOpen}
        onClose={() => setIsMajorChangeModalOpen(false)}
        diffs={activeMethodDiffs}
        currentReason={activeRevisionReason}
        onApplyReason={handleApplyRevisionReason}
        productName={productName}
        documentNo={documentNo}
      />

      {/* Single Source of Truth (SSOT) Parameters Inspector Modal (§1.2) */}
      <SSOTModal
        isOpen={isSSOTModalOpen}
        onClose={() => setIsSSOTModalOpen(false)}
        ssot={currentSSOT}
      />

      {/* Finished Product Specification (FPS) & MOA Modal */}
      <FPSExtractorModal
        isOpen={isFpsModalOpen}
        onClose={() => setIsFpsModalOpen(false)}
        fileData={fpsFileData}
        onConfirm={handleConfirmFpsOverrides}
        validationMethod={validationMethod}
      />

      {/* Master System Prompt & User Input Template Modal (§10) */}
      <MasterPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSelectProduct={(method, name) => {
          setValidationMethod(method);
          setProductName(name);
          setIsPromptModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
