import React from 'react';
import { Plus, Copy, Trash2, X } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

export const PageGridDrawer: React.FC = () => {
  const {
    doc,
    setCurrentPageIndex,
    addPage,
    duplicatePage,
    deletePage,
    isPageGridOpen,
    setIsPageGridOpen,
  } = useCanvas();

  if (!isPageGridOpen) return null;

  return (
    <div className="absolute bottom-10 left-0 right-0 bg-[#0e131f]/95 border-t border-slate-700/80 p-4 shadow-2xl z-30 max-h-56 overflow-y-auto backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white tracking-wide uppercase">
          Document Pages ({doc.pages.length})
        </h4>
        <button
          onClick={() => setIsPageGridOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {doc.pages.map((page, index) => {
          const isActive = index === doc.currentPageIndex;
          return (
            <div
              key={page.id}
              onClick={() => setCurrentPageIndex(index)}
              className={`group relative flex flex-col items-center cursor-pointer shrink-0 transition-transform ${
                isActive ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`w-32 h-20 rounded-md border-2 overflow-hidden shadow-md flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-purple-500 ring-2 ring-purple-500/40'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
                style={{
                  backgroundColor: page.backgroundColor,
                  backgroundImage: page.backgroundGradient || undefined,
                }}
              >
                <span className="text-[10px] font-semibold text-slate-400">
                  {page.elements.length} items
                </span>
              </div>

              <div className="flex items-center justify-between w-full mt-1.5 px-0.5">
                <span
                  className={`text-[11px] font-medium truncate max-w-[80px] ${
                    isActive ? 'text-purple-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {page.name}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(index);
                    }}
                    className="p-0.5 text-slate-400 hover:text-white"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {doc.pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      className="p-0.5 text-slate-400 hover:text-rose-400"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Page Card */}
        <button
          onClick={addPage}
          className="w-32 h-20 rounded-md border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-800/40 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
        >
          <Plus className="w-5 h-5 mb-1 text-cyan-400" />
          <span className="text-[11px] font-medium">Add Page</span>
        </button>
      </div>
    </div>
  );
};
