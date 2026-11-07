import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sliders,
  FileText,
} from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

export const PageManager: React.FC = () => {
  const {
    doc,
    zoom,
    setZoom,
    addPage,
    duplicatePage,
    deletePage,
    setCurrentPageIndex,
    isPageGridOpen,
    setIsPageGridOpen,
    setIsPresenting,
  } = useCanvas();

  const currentPageNumber = doc.currentPageIndex + 1;
  const totalPages = doc.pages.length;

  const handleZoomIn = () => setZoom(Math.min(2.5, +(zoom + 0.1).toFixed(2)));
  const handleZoomOut = () => setZoom(Math.max(0.2, +(zoom - 0.1).toFixed(2)));
  const handleFit = () => setZoom(0.65);

  return (
    <footer className="h-10 bg-[#0e131f] border-t border-slate-800 text-slate-300 px-4 flex items-center justify-between text-xs select-none shrink-0 z-20">
      {/* Left zone: Page Navigation & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPageGridOpen(!isPageGridOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            isPageGridOpen ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Page Grid View"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pages</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPageIndex(Math.max(0, doc.currentPageIndex - 1))}
            disabled={doc.currentPageIndex === 0}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-semibold text-slate-200 px-1">
            {currentPageNumber} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, doc.currentPageIndex + 1))}
            disabled={doc.currentPageIndex === totalPages - 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page Quick Actions */}
        <button
          onClick={addPage}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
          title="Add Blank Page"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Add Page</span>
        </button>

        <button
          onClick={() => duplicatePage(doc.currentPageIndex)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          title="Duplicate Current Page"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {totalPages > 1 && (
          <button
            onClick={() => deletePage(doc.currentPageIndex)}
            className="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded transition-colors"
            title="Delete Current Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right zone: Zoom Slider & Presentation */}
      <div className="flex items-center gap-3">
        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20 sm:w-28 accent-cyan-400 cursor-pointer"
          />

          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFit}
            className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 ml-1"
            title="Fit to Screen"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        {/* Fullscreen Presentation Trigger */}
        <button
          onClick={() => setIsPresenting(true)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-colors"
          title="Fullscreen Presentation"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
