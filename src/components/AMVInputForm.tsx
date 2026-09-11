import React, { useState } from 'react';
import { Search, Sparkles, RefreshCw, Layers, Calendar, FileCode2, FlaskConical, Beaker, Building2, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { ThemeFormat, ValidationMethodType } from '../types';

interface AMVInputFormProps {
  productName: string;
  onProductNameChange: (val: string) => void;
  documentNo: string;
  onDocumentNoChange: (val: string) => void;
  batchNo: string;
  onBatchNoChange: (val: string) => void;
  standardLot: string;
  onStandardLotChange: (val: string) => void;
  companyName: string;
  onCompanyNameChange: (val: string) => void;
  reportDate?: string;
  onReportDateChange?: (val: string) => void;
  validationMethod: ValidationMethodType;
  onValidationMethodChange: (method: ValidationMethodType) => void;
  onGenerate: () => void;
  onRefreshCodes: () => void;
  isLoading: boolean;
  theme: ThemeFormat;
  coaUploaded?: boolean;
  onCoaUpload?: (file: File) => void;
  fpsUploaded?: boolean;
  onFpsUpload?: (file: File) => void;
  onOpenFpsModal?: () => void;
}

const RS_QUICK_SUGGESTIONS = [
  'Sodium Valproate Oral Solution BP',
  'Paracetamol Tablets 500 mg',
  'Metformin HCl Tablets 500 mg',
  'Ciprofloxacin Tablets 500 mg',
  'Acarbose Tablets 100 mg',
  'Atorvastatin Calcium Tablets 20 mg',
  'Pantoprazole Sodium Gastro-Resistant Tablets 40 mg',
  'Ibuprofen Tablets 400 mg',
];

const ASSAY_QUICK_SUGGESTIONS = [
  'Acarbose Tablets 100 mg',
  'Rosuvastatin Tablets 10 mg',
  'Rosuvastatin Calcium Tablets USP 20 mg',
  'Paracetamol Tablets 500 mg',
  'Ciprofloxacin Tablets 500 mg',
  'Ibuprofen Tablets 400 mg',
  'Metformin HCl Tablets 500 mg',
  'Atorvastatin Tablets 20 mg',
  'Pantoprazole Gastro-Resistant Tablets 40 mg',
  'Amlodipine Besylate Tablets 5 mg',
];

const DISSOLUTION_QUICK_SUGGESTIONS = [
  'Tibolone Tablets BP 2.5 mg',
  'Paracetamol Tablets 500 mg',
  'Ibuprofen Tablets 400 mg',
  'Metformin HCl Tablets 500 mg',
  'Acarbose Tablets 100 mg',
  'Atorvastatin Tablets 20 mg',
  'Ciprofloxacin Tablets 500 mg',
];

export const AMVInputForm: React.FC<AMVInputFormProps> = ({
  productName,
  onProductNameChange,
  documentNo,
  onDocumentNoChange,
  batchNo,
  onBatchNoChange,
  standardLot,
  onStandardLotChange,
  companyName,
  onCompanyNameChange,
  reportDate,
  onReportDateChange,
  validationMethod,
  onValidationMethodChange,
  onGenerate,
  onRefreshCodes,
  isLoading,
  theme,
  coaUploaded,
  onCoaUpload,
  fpsUploaded,
  onFpsUpload,
  onOpenFpsModal,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isRS = validationMethod === 'related_substances';
  const isDissolution = validationMethod === 'dissolution';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onGenerate();
  };

  const currentSuggestions = isDissolution
    ? DISSOLUTION_QUICK_SUGGESTIONS
    : isRS
    ? RS_QUICK_SUGGESTIONS
    : ASSAY_QUICK_SUGGESTIONS;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Banner with Method Switcher */}
      <div
        className={`px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 ${
          theme === 'blue' ? 'bg-[#1F4E79]/5' : 'bg-zinc-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${theme === 'blue' ? 'text-[#1F4E79]' : 'text-zinc-700'}`} />
            <h2 className="text-sm font-semibold text-zinc-900">
              {isDissolution
                ? 'Dissolution Method Verification Engine (BP Appendix XII B1)'
                : isRS
                ? 'Related Substances (AMV) Validation Engine'
                : 'Assay by HPLC Validation Engine'}
            </h2>
          </div>

          <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onValidationMethodChange('dissolution')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                isDissolution
                  ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dissolution</span>
            </button>
            <button
              type="button"
              onClick={() => onValidationMethodChange('related_substances')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                isRS
                  ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Related Substances</span>
            </button>
            <button
              type="button"
              onClick={() => onValidationMethodChange('assay')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                !isRS && !isDissolution
                  ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Beaker className="w-3.5 h-3.5" />
              <span>Assay (HPLC)</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-zinc-600 hover:text-zinc-900 font-medium underline underline-offset-2"
        >
          {showAdvanced ? 'Hide Identifiers' : 'Customize Doc & Batch No.'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Main Product Search Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              {isDissolution
                ? 'Enter Product Name / Formulation for Dissolution Method Verification'
                : isRS
                ? 'Enter Any Product Name / Formulation for RS AMV (Compendial or Custom/Other Product)'
                : 'Enter Product Name / Formulation (or API with Strength)'}
            </label>
            {isDissolution ? (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                BP Appendix XII B1 Protocol &amp; Report
              </span>
            ) : isRS ? (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Full 16-Section Monograph Protocol &amp; Report
              </span>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => onProductNameChange(e.target.value)}
                placeholder={
                  isDissolution
                    ? 'e.g. Tibolone Tablets BP 2.5 mg, Paracetamol Tablets 500 mg, Ibuprofen Tablets 400 mg...'
                    : isRS
                    ? 'e.g. Sodium Valproate Oral Solution BP, Paracetamol, Metformin, or your other product...'
                    : 'e.g. Acarbose Tablets 100 mg, Paracetamol Tablets 500 mg, Metformin HCl 500 mg...'
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-zinc-900 font-medium transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !productName.trim()}
              className={`px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
                theme === 'blue'
                  ? 'bg-[#1F4E79] hover:bg-[#183e60] disabled:bg-zinc-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Validation Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isDissolution
                      ? 'Generate Dissolution Protocol & Report'
                      : isRS
                      ? 'Generate RS Protocol & Report'
                      : 'Generate Full AMV'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestions Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {isRS
                ? 'Quick Compendial RS Formulations (or type any custom/other product above):'
                : 'Quick Compendial Formulations:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onProductNameChange(item);
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  productName === item
                    ? theme === 'blue'
                      ? 'bg-[#1F4E79] text-white border-[#1F4E79] font-medium'
                      : 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Document Upload Zone (COA & FPS) */}
        <div className="pt-3 border-t border-zinc-200">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Optional Reference Documents (COA & Spec)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* COA Upload */}
            <div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors ${coaUploaded ? 'border-green-400 bg-green-50' : 'border-zinc-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0] && onCoaUpload) {
                    onCoaUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none gap-1">
                {coaUploaded ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium text-green-700">COA Uploaded</span>
                    <span className="text-[10px] text-green-600">Results aligned to routine batch</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-medium text-zinc-700">Upload Batch COA</span>
                    <span className="text-[10px] text-zinc-500">Extracts actual precision baseline (PDF/DOCX)</span>
                  </>
                )}
              </div>
            </div>

            {/* FPS / MOA PDF Upload & Synchronizer */}
            <div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-all ${fpsUploaded ? 'border-green-400 bg-green-50/80 hover:bg-green-100/60' : 'border-zinc-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
              <input 
                type="file" 
                accept=".pdf,text/plain" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Click to browse or drop FPS / MOA PDF"
                onChange={(e) => {
                  if (e.target.files?.[0] && onFpsUpload) {
                    onFpsUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none gap-1">
                {fpsUploaded ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 mb-1" />
                    <span className="text-xs font-semibold text-green-800">FPS / MOA Synchronized</span>
                    <span className="text-[10px] text-green-700">Client-side parsed • Click to view overrides</span>
                  </>
                ) : (
                  <>
                    <FileCode2 className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-semibold text-zinc-700">Auto-fill from FPS/MOA PDF</span>
                    <span className="text-[10px] text-zinc-500">Zero-upload client-side extraction</span>
                  </>
                )}
              </div>
              {onOpenFpsModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFpsModal();
                  }}
                  className="mt-1 relative z-20 text-[10px] text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 hover:bg-blue-100/50 px-2 py-0.5 rounded transition-colors"
                >
                  {fpsUploaded ? 'Edit Parameters' : 'Open Synchronizer / Presets'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Identifiers Configuration (Company Name, Unique Document No, Batch No, Standard Lot, Report Date) */}
        {showAdvanced && (
          <div className="pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-zinc-50/70 p-3 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Company / Site Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                placeholder="Company Name"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded font-sans font-medium text-zinc-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileCode2 className="w-3 h-3" /> Document / Protocol No.
              </label>
              <input
                type="text"
                value={documentNo}
                onChange={(e) => onDocumentNoChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded font-mono font-medium text-zinc-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Validation Batch No.
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => onBatchNoChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded font-mono font-medium text-zinc-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Standard Lot No.
              </label>
              <input
                type="text"
                value={standardLot}
                onChange={(e) => onStandardLotChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded font-mono font-medium text-zinc-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Report Date
              </label>
              <input
                type="text"
                value={reportDate || ''}
                onChange={(e) => onReportDateChange && onReportDateChange(e.target.value)}
                placeholder="20-Apr-2026"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded font-sans font-medium text-zinc-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={onRefreshCodes}
                className="w-full px-3 py-1.5 text-xs font-medium rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                title="Regenerate dynamic cGMP document and batch numbers"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                <span>Roll New Identifiers</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
