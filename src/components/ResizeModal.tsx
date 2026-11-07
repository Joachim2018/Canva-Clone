import React, { useState } from 'react';
import { Maximize2, X, Check } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { FORMAT_PRESETS } from '../data/fonts';
import { DocumentFormat } from '../types/canvas';

export const ResizeModal: React.FC = () => {
  const { doc, isResizeModalOpen, setIsResizeModalOpen, resizeDocument } = useCanvas();

  const [customWidth, setCustomWidth] = useState(doc.width);
  const [customHeight, setCustomHeight] = useState(doc.height);
  const [selectedFormat, setSelectedFormat] = useState<DocumentFormat>(doc.format);

  if (!isResizeModalOpen) return null;

  const handleApplyResize = () => {
    resizeDocument(customWidth, customHeight, selectedFormat);
    setIsResizeModalOpen(false);
  };

  const selectPreset = (preset: (typeof FORMAT_PRESETS)[0]) => {
    setSelectedFormat(preset.id as DocumentFormat);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Resize Canvas</h3>
          </div>
          <button
            onClick={() => setIsResizeModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Custom Dimensions */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">Custom Dimensions (px):</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block mb-1">Width</span>
                <input
                  type="number"
                  min="200"
                  max="4000"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value, 10) || doc.width)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
              <span className="text-slate-400 pt-5">×</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block mb-1">Height</span>
                <input
                  type="number"
                  min="200"
                  max="4000"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value, 10) || doc.height)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Standard Presets */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">Popular Formats:</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {FORMAT_PRESETS.map((preset) => {
                const isSelected = selectedFormat === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => selectPreset(preset)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{preset.description}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleApplyResize}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow transition-all"
          >
            Apply Resize
          </button>
        </div>
      </div>
    </div>
  );
};
