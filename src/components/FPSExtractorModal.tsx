import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, X, Loader2, Sparkles, Check } from 'lucide-react';
import { ValidationMethodType } from '../types';

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

  useEffect(() => {
    if (isOpen && fileData) {
      extractWithServer(fileData);
    } else if (isOpen) {
      setIsExtracting(false);
    }
  }, [isOpen, fileData]);

  const extractWithServer = async (data: { base64: string; mimeType: string }) => {
    setIsExtracting(true);
    setStatusMessage('Reading analytical method specification...');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch('/api/extract-fps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: data }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const resJson = await response.json();
        if (resJson && resJson.overrides && Object.keys(resJson.overrides).length > 0) {
          const o = resJson.overrides;
          const cleanOverrides: FPSOverrides = {
            column: o.column || '',
            mobilePhase: o.mobilePhase || '',
            flowRate: o.flowRate || '',
            wavelength: o.wavelength || '',
            injectionVolume: o.injectionVolume || '',
            columnTemperature: o.columnTemperature || '',
            runTime: o.runTime || '',
            diluent: o.diluent || '',
            workingConcentration: o.workingConcentration || '',
          };
          setOverrides(cleanOverrides);
          if (o.productName) {
            setDetectedProduct(o.productName);
          }
          setStatusMessage('Parameters successfully extracted!');
          setIsExtracting(false);
          return;
        }
      }
    } catch (_err) {
      // Handled silently for speed
    }

    clearTimeout(timer);
    setIsExtracting(false);
    setStatusMessage('Review parameters below or enter custom values');
  };

  const handlePresetVildagliptin = () => {
    setOverrides({
      column: 'Inertsil ODS-3V, C18 (250 mm x 4.6 mm, 5 µm)',
      mobilePhase: '10 mM Potassium Dihydrogen Phosphate Buffer (pH 6.5) : Acetonitrile (82:18 v/v)',
      flowRate: '1.0 mL/min',
      wavelength: '210 nm',
      injectionVolume: '10 µL',
      columnTemperature: '30 °C',
      runTime: '15.0 min',
      diluent: 'Milli-Q Water : Acetonitrile (50:50 v/v)',
      workingConcentration: '0.1 mg/mL (100 µg/mL)',
    });
    setDetectedProduct('Vildagliptin Tablets 100 mg');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">Specification Parameter Synchronization</h3>
              <p className="text-xs text-zinc-500">Finished Product Specification (FPS) & MOA Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {isExtracting ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p className="font-medium text-sm text-zinc-800">{statusMessage}</p>
              <p className="text-xs text-zinc-400 mt-1">Extracting HPLC conditions with high-speed AI engine...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50/80 text-blue-900 p-3 rounded-lg text-xs flex items-start gap-2 border border-blue-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Direct Specification Overrides</p>
                  <p className="text-blue-700 mt-0.5">
                    Values specified here will strictly override compendial standards across all 16 validation sections and calculation formulas.
                  </p>
                </div>
              </div>

              {detectedProduct && (
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-green-800">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>Detected Product: <strong>{detectedProduct}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">HPLC Method Parameters</span>
                <button
                  type="button"
                  onClick={handlePresetVildagliptin}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Fill Vildagliptin 100 mg Preset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'column', label: 'Column (USP / Stationary Phase)' },
                  { key: 'mobilePhase', label: 'Mobile Phase & Buffers' },
                  { key: 'flowRate', label: 'Flow Rate' },
                  { key: 'wavelength', label: 'Detection Wavelength' },
                  { key: 'injectionVolume', label: 'Injection Volume' },
                  { key: 'columnTemperature', label: 'Column Temperature' },
                  { key: 'runTime', label: 'Run Time' },
                  { key: 'diluent', label: 'Diluent' },
                  { key: 'workingConcentration', label: 'Working Concentration' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-600 tracking-wide uppercase">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={overrides[key as keyof FPSOverrides] || ''}
                      onChange={(e) => setOverrides({ ...overrides, [key]: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="Enter value..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
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
              onConfirm(overrides, detectedProduct);
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
  );
};
