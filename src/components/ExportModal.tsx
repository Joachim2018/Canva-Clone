import React, { useState } from 'react';
import {
  Download,
  Share2,
  FileImage,
  FileCode,
  FileText,
  Copy,
  Check,
  X,
  Loader2,
  Printer,
} from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import {
  downloadPageAsPNG,
  downloadPageAsSVG,
  downloadProjectJSON,
} from '../utils/exportUtils';

export const ExportModal: React.FC = () => {
  const {
    doc,
    currentPage,
    isExportModalOpen,
    setIsExportModalOpen,
    setIsPresenting,
  } = useCanvas();

  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf' | 'json'>('png');
  const [resolutionScale, setResolutionScale] = useState<number>(2);
  const [exportAllPages, setExportAllPages] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isExportModalOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const filenameBase = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (exportFormat === 'png') {
        await downloadPageAsPNG(
          currentPage,
          doc.width,
          doc.height,
          `${filenameBase}.png`,
          resolutionScale
        );
      } else if (exportFormat === 'svg') {
        downloadPageAsSVG(currentPage, doc.width, doc.height, `${filenameBase}.svg`);
      } else if (exportFormat === 'json') {
        downloadProjectJSON(doc);
      } else if (exportFormat === 'pdf') {
        // Open standard print dialogue formatted for this document
        window.print();
      }
      setIsExportModalOpen(false);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Share & Download</h3>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* File Type Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">File type:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('png')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportFormat === 'png'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-semibold ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileImage className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-bold">PNG Image</div>
                  <div className="text-[11px] text-slate-500 font-normal">Best for web & social</div>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('svg')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportFormat === 'svg'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-semibold ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileCode className="w-4 h-4 text-cyan-600 mt-0.5" />
                <div>
                  <div className="font-bold">SVG Vector</div>
                  <div className="text-[11px] text-slate-500 font-normal">Crisp scale at any size</div>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-semibold ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold">PDF Print</div>
                  <div className="text-[11px] text-slate-500 font-normal">Print ready documents</div>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportFormat === 'json'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-semibold ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold">Canva Project</div>
                  <div className="text-[11px] text-slate-500 font-normal">Editable .json backup</div>
                </div>
              </button>
            </div>
          </div>

          {/* Size / Resolution scale (if PNG) */}
          {exportFormat === 'png' && (
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-700 font-medium">
                <span>Resolution Quality:</span>
                <span className="font-bold text-purple-700">
                  {doc.width * resolutionScale} × {doc.height * resolutionScale} px ({resolutionScale}x)
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setResolutionScale(s)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold ${
                      resolutionScale === s
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {s}x {s === 2 ? '(Recommended)' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Download...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between text-slate-600">
              <span>Anyone with the link can view</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-semibold transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
