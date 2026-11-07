import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  Share2,
  Play,
  Maximize2,
  FolderOpen,
  ChevronDown,
  CloudCheck,
  Download,
  FilePlus,
  Layers,
  FileText,
} from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { TEMPLATES_LIBRARY } from '../data/templates';
import { downloadProjectJSON } from '../utils/exportUtils';

export const TopNav: React.FC = () => {
  const {
    doc,
    setDocTitle,
    canUndo,
    canRedo,
    undo,
    redo,
    setIsMagicStudioOpen,
    setIsResizeModalOpen,
    setIsExportModalOpen,
    setIsPresenting,
    loadTemplate,
    addPage,
  } = useCanvas();

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded = JSON.parse(event.target?.result as string);
        if (loaded && loaded.pages && loaded.title) {
          loadTemplate({
            id: loaded.id || 'imported-' + Date.now(),
            title: loaded.title,
            category: 'marketing',
            format: loaded.format || 'instagram-post',
            width: loaded.width || 1080,
            height: loaded.height || 1080,
            thumbnail: '',
            pages: loaded.pages,
          });
        }
      } catch (err) {
        console.error('Failed to import JSON file', err);
      }
    };
    reader.readAsText(file);
    setIsFileMenuOpen(false);
  };

  return (
    <header className="h-14 bg-[#0e131f] border-b border-slate-800 text-white flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Zone 1: Brand & Document Title */}
      <div className="flex items-center gap-4">
        {/* Canva Stylized Logo */}
        <div className="flex items-center gap-2">
          <span className="font-['Outfit'] text-2xl font-black tracking-tight bg-gradient-to-r from-[#00C4CC] via-[#7D2AE8] to-[#FF5757] bg-clip-text text-transparent">
            Canva
          </span>
          <span className="text-[10px] tracking-widest font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
            STUDIO
          </span>
        </div>

        {/* File Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
          >
            <span>File</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {isFileMenuOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-xs"
              onClick={() => setIsFileMenuOpen(false)}
            >
              <button
                onClick={() => addPage()}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800"
              >
                <FilePlus className="w-4 h-4 text-slate-400" />
                <span>Add New Blank Page</span>
              </button>
              <button
                onClick={() => downloadProjectJSON(doc)}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Save Project (.json)</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800"
              >
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <span>Open Project (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
              <div className="border-t border-slate-800 my-1"></div>
              <div className="px-3 py-1.5 text-[11px] text-slate-400">
                Preset Dimensions: {doc.width} × {doc.height} px
              </div>
            </div>
          )}
        </div>

        {/* Resize / Magic Switch */}
        <button
          onClick={() => setIsResizeModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
          title="Change canvas dimensions or transform design"
        >
          <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Resize</span>
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-l border-slate-800 pl-3">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud Auto-save state */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Saved</span>
        </div>
      </div>

      {/* Zone 2: Inline Editable Document Title */}
      <div className="flex items-center justify-center max-w-md">
        <input
          type="text"
          value={doc.title}
          onChange={(e) => setDocTitle(e.target.value)}
          className="bg-transparent hover:bg-slate-800/70 focus:bg-slate-800 text-center text-sm font-semibold text-slate-100 hover:text-white px-3 py-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 max-w-xs md:max-w-sm truncate"
          title="Click to rename document"
        />
      </div>

      {/* Zone 3: Magic Studio & Export Actions */}
      <div className="flex items-center gap-2.5">
        {/* Magic Studio AI Button */}
        <button
          onClick={() => setIsMagicStudioOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-md shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Magic Studio</span>
        </button>

        {/* Presentation Mode */}
        <button
          onClick={() => setIsPresenting(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
          title="Present full screen slideshow"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span className="hidden sm:inline">Present</span>
        </button>

        {/* Primary Export & Share Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-900" />
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};
