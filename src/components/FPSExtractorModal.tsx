import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, X, Loader2, Sparkles, Check, UploadCloud, Sliders, CheckCircle2, History } from 'lucide-react';
import { ValidationMethodType } from '../types';
import {
  parseFpsMoaText,
  extractTextFromPdfArrayBuffer,
  extractTextFromPdfBase64,
  GROUND_TRUTH_VILDAGLIPTIN_RAW_TEXT,
  ExtractedFpsMoaData,
} from '../services/fpsPdfParser';

export interface FPSOverrides {
  column?: string;
  mobilePhase?: string;
  flowRate?: string;
  wavelength?: string;
  injectionVolume?: string;
  columnTemperature?: string;
  runTime?: string;
  diluent?: string;
  workingConcentration?: string;
  productName?: string;
  specNo?: string;
  moaNo?: string;
  dissolutionLimit?: string;
  assayRange?: string;
  rsLimits?: string;
  uduLimit?: string;
  auditNotes?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileData: { base64: string; mimeType: string } | null;
  onConfirm: (overrides: FPSOverrides, detectedProductName?: string) => void;
  validationMethod: ValidationMethodType;
}

export const FPSExtractorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fileData,
  onConfirm,
  validationMethod,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [overrides, setOverrides] = useState<FPSOverrides>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [detectedProduct, setDetectedProduct] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedFpsMoaData | null>(null);
  const [selectedConcentration, setSelectedConcentration] = useState<string>('');
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [originalExtractedValues, setOriginalExtractedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && fileData) {
      extractClientSideFromData(fileData);
    } else if (isOpen) {
      setIsExtracting(false);
    }
  }, [isOpen, fileData]);

  // Client-Side Extraction: 0 server bytes uploaded (Vercel Part G compliant)
  const extractClientSideFromData = async (data: { base64: string; mimeType: string }) => {
    setIsExtracting(true);
    setStatusMessage('Reading analytical method specification (client-side)...');

    try {
      let rawText = '';
      if (data.mimeType.includes('pdf')) {
        rawText = await extractTextFromPdfBase64(data.base64);
      } else {
        // Plain text fallback
        rawText = window.atob(data.base64.replace(/^data:.*?;base64,/, ''));
      }

      const parsed = parseFpsMoaText(rawText);
      applyParsedData(parsed);
      setStatusMessage('Parameters successfully extracted client-side!');
    } catch (err: any) {
      console.warn('PDF client parse fallback:', err);
      // Fallback: Check if file contained readable ASCII strings
      try {
        const decoded = window.atob(data.base64.replace(/^data:.*?;base64,/, ''));
        const parsed = parseFpsMoaText(decoded);
        applyParsedData(parsed);
        setStatusMessage('Parameters extracted via stream reader.');
      } catch (_e) {
        setStatusMessage('Manual parameter entry available below.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManualFileUpload = (file: File) => {
    const reader = new FileReader();
    setIsExtracting(true);
    setStatusMessage('Extracting text with in-browser PDF parser...');

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const text = await extractTextFromPdfArrayBuffer(arrayBuffer);
        const parsed = parseFpsMoaText(text);
        applyParsedData(parsed);
        setStatusMessage('Parameters successfully extracted from uploaded file!');
      } catch (err: any) {
        console.warn('Manual file parse error:', err);
        setStatusMessage('Please review or enter parameters manually.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const applyParsedData = (parsed: ExtractedFpsMoaData) => {
    setExtractedData(parsed);

    const initialOverrides: FPSOverrides = {
      column: parsed.column,
      mobilePhase: parsed.mobilePhase,
      flowRate: parsed.flowRate,
      wavelength: parsed.wavelength,
      injectionVolume: parsed.injectionVolume,
      columnTemperature: parsed.columnTemperature,
      runTime: parsed.runTime,
      diluent: parsed.diluent,
      workingConcentration: parsed.workingConcentration,
      specNo: parsed.specNo,
      moaNo: parsed.moaNo,
      dissolutionLimit: parsed.dissolutionLimit,
      assayRange: parsed.assayRange,
      rsLimits: parsed.rsLimits,
      uduLimit: parsed.uduLimit,
    };

    setOverrides(initialOverrides);
    setOriginalExtractedValues({
      column: parsed.column,
      mobilePhase: parsed.mobilePhase,
      flowRate: parsed.flowRate,
      wavelength: parsed.wavelength,
      injectionVolume: parsed.injectionVolume,
      columnTemperature: parsed.columnTemperature,
      runTime: parsed.runTime,
      diluent: parsed.diluent,
      workingConcentration: parsed.workingConcentration,
    });

    if (parsed.productName) {
      setDetectedProduct(parsed.productName);
    }
    if (parsed.workingConcentration) {
      setSelectedConcentration(parsed.workingConcentration);
    }
  };

  const handleLoadGroundTruth = () => {
    setIsExtracting(true);
    setStatusMessage('Loading Vildagliptin 100 mg Ground-Truth Spec (Spec.No. VD/QC/SP/0529)...');
    setTimeout(() => {
      const parsed = parseFpsMoaText(GROUND_TRUTH_VILDAGLIPTIN_RAW_TEXT);
      applyParsedData(parsed);
      setIsExtracting(false);
      setStatusMessage('Ground-Truth Specification Loaded!');
    }, 150);
  };

  const handleFieldChange = (key: keyof FPSOverrides, value: string) => {
    const prev = overrides[key] || '';
    const orig = originalExtractedValues[key as string];

    setOverrides((prevOverrides) => ({ ...prevOverrides, [key]: value }));

    // Record audit trace if user manually modifies an auto-extracted parameter
    if (orig && orig !== value) {
      const logEntry = `Field "${key}": modified from "${orig}" to "${value}" on ${new Date().toLocaleTimeString()}`;
      setAuditLog((prevLog) => {
        const filtered = prevLog.filter((l) => !l.startsWith(`Field "${key}":`));
        return [...filtered, logEntry];
      });
    }
  };

  const handleSelectConcentration = (val: string) => {
    setSelectedConcentration(val);
    handleFieldChange('workingConcentration', val);
  };

  if (!isOpen) return null;

  const specLabel = extractedData?.specNo ? `Spec.No. ${extractedData.specNo}` : '';
  const moaLabel = extractedData?.moaNo ? `MOA.No. ${extractedData.moaNo}` : '';
  const combinedSource = [specLabel, moaLabel].filter(Boolean).join(' / ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100/80 rounded-lg">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">Specification Parameter Synchronization</h3>
              <p className="text-xs text-zinc-500">
                100% Client-Side In-Browser FPS / MOA Text Extraction (Vercel Serverless Compliant)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors text-zinc-500 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {isExtracting ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p className="font-medium text-sm text-zinc-800">{statusMessage}</p>
              <p className="text-xs text-zinc-400 mt-1">Executing zero-latency client-side PDF parsing...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dynamic Information Banner */}
              <div className="bg-blue-50/90 text-blue-950 p-3.5 rounded-lg text-xs flex items-start gap-2.5 border border-blue-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Direct Specification Synchronization</p>
                  <p className="text-blue-800 mt-0.5 leading-relaxed">
                    {combinedSource ? (
                      <>Values auto-filled from uploaded FPS/MOA (<strong>{combinedSource}</strong>). Review before confirming.</>
                    ) : (
                      <>Values specified here will strictly override compendial standards across all validation sections, formulas, and SST limits.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Detected Product & Quick Load Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-zinc-600">
                    {detectedProduct ? (
                      <>Detected Product: <strong className="text-zinc-900">{detectedProduct}</strong></>
                    ) : (
                      'No file parsed yet. Upload PDF or load standard reference.'
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadGroundTruth}
                    className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-md border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Ground-Truth: Vildagliptin 100 mg (VD/QC/SP/0529)
                  </button>
                </div>
              </div>

              {/* Drag & Drop File Re-upload Trigger */}
              <div className="border border-dashed border-zinc-300 rounded-lg p-3 bg-zinc-50/50 hover:bg-blue-50/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span>Parse a different FPS / MOA PDF in-browser:</span>
                </div>
                <label className="cursor-pointer px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs rounded-md border border-zinc-300 shadow-2xs transition-colors">
                  Browse PDF
                  <input
                    type="file"
                    accept=".pdf,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleManualFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Working Concentration Ambiguity Disambiguation (Part I3) */}
              {extractedData && extractedData.concentrationOptions.length > 1 && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      Select Working Concentration from MOA:
                    </span>
                    <span className="text-[11px] font-normal text-amber-700">Both Standard & Sample solutions detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.concentrationOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectConcentration(opt.value)}
                        className={`text-xs px-3 py-1.5 rounded-md border font-mono transition-all flex items-center gap-1.5 ${
                          selectedConcentration === opt.value
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-semibold'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-amber-100/50'
                        }`}
                      >
                        {selectedConcentration === opt.value && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted FPS Acceptance Limits (Part H4) */}
              {extractedData && (extractedData.dissolutionLimit || extractedData.assayRange || extractedData.rsLimits) && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Synchronized FPS Acceptance Limits:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {extractedData.dissolutionLimit && (
                      <div className="p-2 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Dissolution</span>
                        <span className="font-mono text-zinc-800 text-[11px]">{extractedData.dissolutionLimit}</span>
                      </div>
                    )}
                    {extractedData.assayRange && (
                      <div className="p-2 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Assay Range</span>
                        <span className="font-mono text-zinc-800 text-[11px]">{extractedData.assayRange}</span>
                      </div>
                    )}
                    {extractedData.rsLimits && (
                      <div className="p-2 bg-white rounded border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Related Substances</span>
                        <span className="font-mono text-zinc-800 text-[11px]">{extractedData.rsLimits}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Fields: HPLC Method Parameters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
                    HPLC Method Parameters (MOA Assay Section)
                  </span>
                  {auditLog.length > 0 && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <History className="w-3 h-3" />
                      {auditLog.length} manual edit(s) tracked
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'column', label: 'Column (Stationary Phase & Dimensions)' },
                    { key: 'mobilePhase', label: 'Mobile Phase & Buffers' },
                    { key: 'flowRate', label: 'Flow Rate' },
                    { key: 'wavelength', label: 'Detection Wavelength (Assay UV)' },
                    { key: 'injectionVolume', label: 'Injection Volume' },
                    { key: 'columnTemperature', label: 'Column Temperature' },
                    { key: 'runTime', label: 'Run Time (Blank if not in Assay MOA)' },
                    { key: 'diluent', label: 'Diluent' },
                    { key: 'workingConcentration', label: 'Working Concentration' },
                  ].map(({ key, label }) => {
                    const isModified =
                      originalExtractedValues[key] !== undefined &&
                      originalExtractedValues[key] !== (overrides[key as keyof FPSOverrides] || '');

                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-zinc-600 tracking-wide uppercase">
                            {label}
                          </label>
                          {isModified && (
                            <span className="text-[10px] text-amber-600 font-medium">Modified</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={overrides[key as keyof FPSOverrides] || ''}
                          onChange={(e) => handleFieldChange(key as keyof FPSOverrides, e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-md text-xs focus:bg-white focus:ring-1 outline-none transition-all font-mono ${
                            isModified
                              ? 'bg-amber-50/50 border border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-amber-950'
                              : 'bg-zinc-50 border border-zinc-200 focus:border-blue-500 focus:ring-blue-500 text-zinc-900'
                          }`}
                          placeholder="Enter value..."
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {auditLog.length > 0 ? (
              <span className="text-amber-700 font-medium">Audit note will be appended to report annexure.</span>
            ) : (
              <span>Ready to synchronize with active document.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const finalOverrides: FPSOverrides = {
                  ...overrides,
                  auditNotes: auditLog,
                };
                onConfirm(finalOverrides, detectedProduct);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              Confirm & Apply Overrides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
