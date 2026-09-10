const fs = require('fs');

const modalCode = `import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { ValidationMethodType } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js\`;

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
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileData: { base64: string; mimeType: string } | null;
  onConfirm: (overrides: FPSOverrides) => void;
  validationMethod: ValidationMethodType;
}

export const FPSExtractorModal: React.FC<Props> = ({ isOpen, onClose, fileData, onConfirm, validationMethod }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [overrides, setOverrides] = useState<FPSOverrides>({});
  
  useEffect(() => {
    if (isOpen && fileData) {
      if (fileData.mimeType === 'application/pdf') {
        extractPdfText(fileData.base64);
      } else if (fileData.mimeType.startsWith('image/')) {
        extractImageText(fileData.base64);
      }
    }
  }, [isOpen, fileData]);

  const parseExtractedText = (text: string) => {
      // Auto-parse using simple regex
      const parsed: FPSOverrides = {};
      
      const colMatch = text.match(/Column[\\s\\S]*?(?:USP.*?|[\\d\\.]+[- ]mm.*?|[\\d\\.]+ mm.*?µm[^\\n]+)/i);
      if (colMatch) parsed.column = colMatch[0].replace(/Column[^\\w]*/i, '').split('\\n')[0].trim();
      
      const mpMatch = text.match(/Mobile [Pp]hase[^\\w]*(.*?)(?:\\n|$)/);
      if (mpMatch) parsed.mobilePhase = mpMatch[1].trim();
      
      const flowMatch = text.match(/Flow [Rr]ate[^\\d]*([\\d\\.]+\\s*mL\\/min)/i);
      if (flowMatch) parsed.flowRate = flowMatch[1].trim();
      
      const waveMatch = text.match(/(?:Detection Wavelength|Detector)[^\\w]*(.*?)(?:\\n|$)/i);
      if (waveMatch) parsed.wavelength = waveMatch[1].trim();
      
      const injMatch = text.match(/Injection [Vv]olume[^\\d]*([\\d\\.]+\\s*(?:µL|uL|mcL))/i);
      if (injMatch) parsed.injectionVolume = injMatch[1].trim();
      
      const tempMatch = text.match(/Column [Tt]emperature[^\\w]*([\\d\\.]+\\s*(?:°C|C|°))/i);
      if (tempMatch) {
         let t = tempMatch[1].trim();
         if (!t.includes('C')) t += ' C';
         parsed.columnTemperature = t.replace('°', ' °');
      }
      
      const runMatch = text.match(/Run [Tt]ime[^\\d]*([\\d\\.]+\\s*min)/i);
      if (runMatch) parsed.runTime = runMatch[1].trim();
      
      const dilMatch = text.match(/Diluent[^\\w]*(.*?)(?:\\n|$)/i);
      if (dilMatch) parsed.diluent = dilMatch[1].trim();
      
      const wcMatch = text.match(/Working Concentration[^\\w]*(.*?)(?:\\n|$)/i);
      if (wcMatch) parsed.workingConcentration = wcMatch[1].trim();
      
      setOverrides(parsed);
  };

  const extractPdfText = async (base64: string) => {
    setIsExtracting(true);
    try {
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const pdf = await pdfjsLib.getDocument({ data: array }).promise;
      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\\n';
      }
      setExtractedText(fullText);
      parseExtractedText(fullText);
    } catch (err) {
      console.error('PDF extraction failed', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractImageText = async (base64: string) => {
    setIsExtracting(true);
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(base64);
      const text = ret.data.text;
      setExtractedText(text);
      await worker.terminate();
      parseExtractedText(text);
    } catch (err) {
      console.error('Image extraction failed', err);
    } finally {
      setIsExtracting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-zinc-900">FPS Parameter Synchronization</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto">
          {isExtracting ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <p className="font-medium text-sm">Extracting parameters from document...</p>
              <p className="text-xs text-zinc-400 mt-2">Running offline completely within your browser.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2 border border-blue-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <p>Please review and correct the extracted parameters. These values will perfectly override the standard baseline data to guarantee accurate mathematics for the AMV.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys({
                  column: 'Column',
                  mobilePhase: 'Mobile Phase',
                  flowRate: 'Flow Rate',
                  wavelength: 'Wavelength',
                  injectionVolume: 'Injection Volume',
                  columnTemperature: 'Column Temp',
                  runTime: 'Run Time',
                  diluent: 'Diluent',
                  workingConcentration: 'Working Conc.'
                }).map((key) => {
                  const label = {
                    column: 'Column',
                    mobilePhase: 'Mobile Phase',
                    flowRate: 'Flow Rate',
                    wavelength: 'Wavelength',
                    injectionVolume: 'Injection Volume',
                    columnTemperature: 'Column Temp',
                    runTime: 'Run Time',
                    diluent: 'Diluent',
                    workingConcentration: 'Working Conc.'
                  }[key as keyof FPSOverrides];
                  
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">{label}</label>
                      <input 
                        type="text" 
                        value={overrides[key as keyof FPSOverrides] || ''}
                        onChange={(e) => setOverrides({...overrides, [key]: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm font-mono"
                        placeholder="Not found..."
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button 
            disabled={isExtracting}
            onClick={() => onConfirm(overrides)} 
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm & Sync Overrides
          </button>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/FPSExtractorModal.tsx', modalCode);
