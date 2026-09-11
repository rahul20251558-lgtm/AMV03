import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
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
  const [reportDate, setReportDate] = useState('20-Apr-2026');
  const [docType, setDocType] = useState<DocumentType>('report');
  const [theme, setTheme] = useState<ThemeFormat>('blue'); // 'blue' (Executive Blue) or 'simple' (Simple Format No Color)
  const [fontFamily, setFontFamily] = useState<FontFamilyType>('Times New Roman'); // Matches authentic monograph
  const [fontSize, setFontSize] = useState<FontSizePt>(12); // Standard 12pt pharma standard
  const [dataMode, setDataMode] = useState<DataMode>('DEMO'); // 'TEMPLATE' (default blank raw data) or 'DEMO' (verified analytical demonstration with watermark)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [newAMVReadyInfo, setNewAMVReadyInfo] = useState<{
    productName: string;
    method: ValidationMethodType;
    docNo: string;
    timestamp: string;
  } | null>(null);

  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const generationStepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
      if (generationStepTimerRef.current) clearTimeout(generationStepTimerRef.current);
    };
  }, []);

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

  // Initialize authentic Dissolution document state (Single Shared Product: Tibolone Tablets BP 2.5 mg)
  const [dissolutionData, setDissolutionData] = useState<DissolutionAMVDocumentData>(() =>
    buildFullDissolutionAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: 'WC/QC/AMV/0316',
      batchNo: 'TB2501',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
      reportDate: '20-Apr-2026',
    })
  );

  // Initialize authentic RS document state for the same shared product
  const [rsData, setRsData] = useState<RSAMVDocumentData>(() =>
    buildFullRSAMVData('Tibolone Tablets BP 2.5 mg', {
      protocolNo: 'WC/QC/AMV/0316',
      batchNo: 'TB2501',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
      reportDate: '20-Apr-2026',
    })
  );

  // Initialize authentic Assay document state for the same shared product
  const [assayData, setAssayData] = useState<AMVDocumentData>(() =>
    generateAMVDataForProduct('Tibolone Tablets BP 2.5 mg', {
      documentNo: 'WC/QC/AMV/0316',
      validationBatchNo: 'TB2501',
      standardLotNo: 'WS/DIS/2026/019',
      companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
      reportDate: '20-Apr-2026',
      effectiveDate: '20-Apr-2026',
    })
  );

  // Dedicated reactive field handlers to instantly reflect user input changes across ALL active documents
  const handleCompanyNameChange = (newCompany: string) => {
    setCompanyName(newCompany);
    setDissolutionData((prev) => ({ ...prev, companyName: newCompany }));
    setRsData((prev) => ({ ...prev, companyName: newCompany }));
    setAssayData((prev) => ({ ...prev, companyName: newCompany }));
  };

  const handleDocumentNoChange = (newDocNo: string) => {
    setDocumentNo(newDocNo);
    setDissolutionData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setRsData((prev) => ({ ...prev, protocolNo: newDocNo }));
    setAssayData((prev) => ({ ...prev, documentNo: newDocNo }));
  };

  const handleBatchNoChange = (newBatchNo: string) => {
    setBatchNo(newBatchNo);
    setDissolutionData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
    setRsData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
    setAssayData((prev) => ({ ...prev, batchNoUsed: newBatchNo }));
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

  const handleReportDateChange = (newDate: string) => {
    setReportDate(newDate);
    setDissolutionData((prev) => ({
      ...prev,
      reportDate: newDate,
      effectiveDate: newDate,
      signOffs: prev.signOffs ? {
        ...prev.signOffs,
        approvedBy: { ...prev.signOffs.approvedBy, date: newDate },
      } : prev.signOffs,
    }));
    setRsData((prev) => ({
      ...prev,
      reportDate: newDate,
      effectiveDate: newDate,
      signOffs: prev.signOffs ? {
        ...prev.signOffs,
        approvedBy: { ...prev.signOffs.approvedBy, date: newDate },
      } : prev.signOffs,
    }));
    setAssayData((prev) => ({
      ...prev,
      reportDate: newDate,
      effectiveDate: newDate,
      signOffs: prev.signOffs ? {
        ...prev.signOffs,
        approvedBy: { ...prev.signOffs.approvedBy, date: newDate },
      } : prev.signOffs,
    }));
  };

  // Handle switching between Dissolution, Related Substances, and Assay methods
  // Preserves the single shared product name, strength, batch and report date
  const handleValidationMethodChange = (newMethod: ValidationMethodType) => {
    setValidationMethod(newMethod);
  };

  const handleProductNameChange = (newProduct: string) => {
    setProductName(newProduct);
  };

  // Trigger full AMV generation for a target or current product with realistic loading and progress feedback
  const triggerGenerateAMV = (
    targetProduct?: string,
    targetMethod?: ValidationMethodType,
    customOverrides?: FPSOverrides | null
  ) => {
    const activeProduct = (targetProduct && targetProduct.trim().length > 0)
      ? targetProduct.trim()
      : (productName.trim() || 'Tibolone Tablets BP 2.5 mg');
    const activeMethod = targetMethod || validationMethod;
    const activeOverrides = customOverrides !== undefined ? customOverrides : fpsOverrides;

    // Clear any previous timers
    if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
    if (generationStepTimerRef.current) clearTimeout(generationStepTimerRef.current);

    setProductName(activeProduct);
    setIsLoading(true);
    setLoadingStepText(`Validating compendial monograph & chromatographic parameters for "${activeProduct}"...`);

    // Prepare fresh codes for this product
    const codes = generateUniqueValidationCodes(activeProduct);
    const prefix =
      activeMethod === 'dissolution'
        ? 'WC/QC/AMV'
        : activeMethod === 'related_substances'
        ? 'WC/QC/RS'
        : 'WC/QC/AMV';
    const cleanDocNo = codes.documentNo.replace('WC/QC/AMV', prefix);
    setDocumentNo(cleanDocNo);
    setBatchNo(codes.validationBatchNo);
    setStandardLot(codes.standardLotNo);

    // Mid-way step progress feedback
    generationStepTimerRef.current = setTimeout(() => {
      setLoadingStepText(`Computing System Suitability, Linearity (r > 0.999) & Precision Tables for "${activeProduct}"...`);
    }, 320);

    // Finalize generation after realistic calculation window (~700ms)
    generationTimerRef.current = setTimeout(() => {
      try {
        const localDiss = buildFullDissolutionAMVData(activeProduct, {
          verifiedMonograph: activeOverrides ? {
            ...activeOverrides,
            ...(activeOverrides.diluent ? { medium: activeOverrides.diluent } : {}),
          } : undefined,
          protocolNo: cleanDocNo,
          batchNo: codes.validationBatchNo,
          companyName,
          reportDate,
        });
        setDissolutionData(localDiss);

        const localRS = buildFullRSAMVData(activeProduct, {
          verifiedMonograph: activeOverrides ? activeOverrides : undefined,
          protocolNo: cleanDocNo,
          batchNo: codes.validationBatchNo,
          companyName,
          reportDate,
        });
        setRsData(localRS);

        const localData = generateAMVDataForProduct(activeProduct, {
          documentNo: cleanDocNo,
          validationBatchNo: codes.validationBatchNo,
          standardLotNo: codes.standardLotNo,
          companyName,
          reportDate,
          effectiveDate: reportDate,
        }, activeOverrides);
        const recalculated = recalculateAMVData(localData);
        setAssayData(recalculated);

        if (activeMethod === 'dissolution') {
          checkAndPromptMajorChanges(localDiss, 'dissolution', activeProduct);
        } else if (activeMethod === 'related_substances') {
          checkAndPromptMajorChanges(localRS, 'related_substances', activeProduct);
        } else {
          checkAndPromptMajorChanges(recalculated, 'assay', activeProduct);
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setNewAMVReadyInfo({
          productName: activeProduct,
          method: activeMethod,
          docNo: cleanDocNo,
          timestamp: timeStr,
        });
      } catch (err) {
        console.error('Generation failed:', err);
      } finally {
        setIsLoading(false);
        setLoadingStepText('');
      }
    }, 700);
  };

  const handleConfirmFpsOverrides = (overrides: FPSOverrides, detectedProductName?: string) => {
    setFpsOverrides(overrides);
    setFpsUploaded(true);
    setIsFpsModalOpen(false);

    const activeProduct = (detectedProductName && detectedProductName.trim().length > 0)
      ? detectedProductName.trim()
      : productName;

    triggerGenerateAMV(activeProduct, validationMethod, overrides);
  };

  // Roll new dynamic identifiers
  const handleRefreshCodes = () => {
    triggerGenerateAMV(productName);
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

  // Generate AMV Data for current product (Dissolution, RS, or Assay)
  const handleGenerate = (targetProduct?: string) => {
    triggerGenerateAMV(targetProduct || productName);
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
          reportDate={reportDate}
          onReportDateChange={handleReportDateChange}
          standardLot={standardLot}
          onStandardLotChange={handleStandardLotChange}
          companyName={companyName}
          onCompanyNameChange={handleCompanyNameChange}
          validationMethod={validationMethod}
          onValidationMethodChange={handleValidationMethodChange}
          onGenerate={handleGenerate}
          onSelectSuggestion={triggerGenerateAMV}
          onRefreshCodes={handleRefreshCodes}
          isLoading={isLoading}
          loadingStepText={loadingStepText}
          newAMVReadyInfo={newAMVReadyInfo}
          onDismissSuccessInfo={() => setNewAMVReadyInfo(null)}
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

        {/* Document Viewer Container with Active Status Header & Loading Overlay */}
        <div id="amv-document-viewer-container" className="relative space-y-2">
          {/* Active Product Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active AMV Monograph: {productName}
              </span>
              <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline-block">
                {documentNo} &bull; Batch: {batchNo}
              </span>
            </div>
            {newAMVReadyInfo && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                AMV Ready ({newAMVReadyInfo.timestamp})
              </span>
            )}
          </div>

          {/* Loading Overlay with Spinning Pharmaceutical Synthesizer */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center min-h-[450px] rounded-2xl border border-blue-200 shadow-xl">
              <div className="bg-white p-7 rounded-2xl shadow-2xl border border-zinc-200 flex flex-col items-center max-w-md w-full animate-in zoom-in-95 duration-150">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 border border-blue-100 shadow-2xs">
                  <RefreshCw className="w-7 h-7 text-[#1F4E79] animate-spin" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  Synthesizing New AMV Document
                </h3>
                <p className="text-xs font-semibold text-[#1F4E79] mt-1">
                  {productName}
                </p>
                <p className="text-xs text-zinc-600 mt-2.5 max-w-xs">
                  {loadingStepText || 'Processing chromatographic system, system suitability & statistical calculations...'}
                </p>
                <div className="w-full bg-zinc-100 h-2 rounded-full mt-4 overflow-hidden border border-zinc-200">
                  <div className="h-full bg-[#1F4E79] rounded-full animate-pulse w-4/5" />
                </div>
                <div className="flex items-center justify-between w-full mt-3 text-[10px] font-mono text-zinc-400">
                  <span>ICH Q2(R2) Validation</span>
                  <span className="text-blue-700 font-semibold">ALCOA+ Compliant</span>
                </div>
              </div>
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
        </div>
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
          triggerGenerateAMV(name, method);
          setIsPromptModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
