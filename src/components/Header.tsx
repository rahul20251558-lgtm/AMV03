import React from 'react';
import { ThemeFormat, DocumentType, ValidationMethodType, FontFamilyType, FontSizePt } from '../types';
import { FileText, Award, Palette, CheckCircle2, Download, Printer, Sparkles } from 'lucide-react';
import { FontAndSizeControl } from './FontAndSizeControl';

interface HeaderProps {
  theme: ThemeFormat;
  onThemeChange: (theme: ThemeFormat) => void;
  activeDocType: DocumentType;
  onDocTypeChange: (docType: DocumentType) => void;
  validationMethod: ValidationMethodType;
  onValidationMethodChange: (method: ValidationMethodType) => void;
  fontFamily: FontFamilyType;
  fontSize: FontSizePt;
  onFontFamilyChange: (font: FontFamilyType) => void;
  onFontSizeChange: (size: FontSizePt) => void;
  onDownloadDocx: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  activeDocType,
  onDocTypeChange,
  validationMethod,
  onValidationMethodChange,
  fontFamily,
  fontSize,
  onFontFamilyChange,
  onFontSizeChange,
  onDownloadDocx,
  onPrint,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Regulatory Standards */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${
                theme === 'blue' ? 'bg-[#1F4E79]' : 'bg-zinc-800'
              }`}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  Pharmaceutical AMV Suite &amp; Word Generator
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> cGMP Compliant
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-0.5 font-mono">
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">
                  ICH Q2(R2)
                </span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">
                  BP Appendix XII B1
                </span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">
                  BP Appendix III D
                </span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">
                  USP &lt;621&gt; / &lt;711&gt;
                </span>
              </div>
            </div>
          </div>

          {/* Quick Document Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Method Type Toggle: Dissolution vs Related Substances vs Assay */}
            <div className="inline-flex rounded-lg border border-blue-200 bg-blue-50/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => onValidationMethodChange('dissolution')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  validationMethod === 'dissolution'
                    ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
                title="Dissolution Method Verification Protocol & Report format (BP Appendix XII B1)"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Dissolution</span>
              </button>
              <button
                type="button"
                onClick={() => onValidationMethodChange('related_substances')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  validationMethod === 'related_substances'
                    ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
                title="Related Substances (RS) / Organic Impurities Protocol & Report format"
              >
                <span>Related Substances</span>
              </button>
              <button
                type="button"
                onClick={() => onValidationMethodChange('assay')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  validationMethod === 'assay'
                    ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
                title="Assay by HPLC Validation Protocol & Report format"
              >
                Assay (HPLC)
              </button>
            </div>

            {/* Document Mode Toggle */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => onDocTypeChange('protocol')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeDocType === 'protocol'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Protocol
              </button>
              <button
                type="button"
                onClick={() => onDocTypeChange('report')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeDocType === 'report'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Report
              </button>
            </div>

            {/* Document Theme Option (Executive Blue vs Simple Format No Color) */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 text-xs font-medium">
              <button
                type="button"
                title="Executive Blue Header Style"
                onClick={() => onThemeChange('blue')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  theme === 'blue'
                    ? 'bg-[#1F4E79] text-white shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block"></span>
                Executive Blue
              </button>
              <button
                type="button"
                title="Simple Format - No Blue, Pure Clean Monochrome"
                onClick={() => onThemeChange('simple')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  theme === 'simple'
                    ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block"></span>
                Simple Format
              </button>
            </div>

            {/* Typography Controls: Font Family & Font Size (matching uploaded image: Times New Roman 12) */}
            <FontAndSizeControl
              fontFamily={fontFamily}
              fontSize={fontSize}
              onFontFamilyChange={onFontFamilyChange}
              onFontSizeChange={onFontSizeChange}
            />

            {/* Quick Export Actions */}
            <button
              type="button"
              onClick={onDownloadDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .docx</span>
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
