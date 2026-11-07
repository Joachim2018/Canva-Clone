import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  Sliders,
  Type,
  FlipHorizontal,
  FlipVertical,
  Minus,
  Plus,
  Palette,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { POPULAR_FONTS, COLOR_PALETTES } from '../data/fonts';
import { TextElement, ShapeElement, ImageElement, TextEffectType } from '../types/canvas';

export const ContextualToolbar: React.FC = () => {
  const {
    doc,
    currentPage,
    selectedIds,
    selectedElement,
    updateSelectedElements,
    deleteSelected,
    duplicateSelected,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    alignSelected,
    toggleLock,
    setPageBackground,
    setIsMagicStudioOpen,
  } = useCanvas();

  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSpacingMenuOpen, setIsSpacingMenuOpen] = useState(false);
  const [isEffectsMenuOpen, setIsEffectsMenuOpen] = useState(false);
  const [isPositionMenuOpen, setIsPositionMenuOpen] = useState(false);
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);

  // If no element selected, show canvas page level settings
  if (!selectedElement || selectedIds.length === 0) {
    return (
      <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-600 select-none shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-500">Page Background:</span>
          {/* Background Color Swatches */}
          <div className="flex items-center gap-1.5">
            {['#FFFFFF', '#F8FAFC', '#F5EBE1', '#FEF3C7', '#E0F2FE', '#F3E8FF', '#0F172A'].map((c) => (
              <button
                key={c}
                onClick={() => setPageBackground(c)}
                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                  currentPage.backgroundColor === c
                    ? 'ring-2 ring-purple-600 ring-offset-1 scale-105 border-transparent'
                    : 'border-slate-300'
                }`}
                style={{ backgroundColor: c }}
                title={`Set background to ${c}`}
              />
            ))}
            <label
              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
              title="Custom background color"
            >
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="color"
                value={currentPage.backgroundColor.startsWith('#') ? currentPage.backgroundColor : '#ffffff'}
                onChange={(e) => setPageBackground(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>
            Dimensions: <strong className="text-slate-700 font-semibold">{doc.width} × {doc.height} px</strong>
          </span>
          <span>·</span>
          <span>Elements: <strong className="text-slate-700 font-semibold">{currentPage.elements.length}</strong></span>
        </div>
      </div>
    );
  }

  const isText = selectedElement.type === 'text';
  const isShape = selectedElement.type === 'shape';
  const isImage = selectedElement.type === 'image';
  const textEl = isText ? (selectedElement as TextElement) : null;
  const shapeEl = isShape ? (selectedElement as ShapeElement) : null;
  const imgEl = isImage ? (selectedElement as ImageElement) : null;

  return (
    <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-700 select-none shrink-0 z-20 overflow-x-auto">
      {/* Left zone: contextual properties */}
      <div className="flex items-center gap-2">
        {/* TEXT CONTROLS */}
        {isText && textEl && (
          <>
            {/* Font Family Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                className="flex items-center justify-between gap-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-800 min-w-32"
              >
                <span className="truncate" style={{ fontFamily: textEl.fontFamily }}>
                  {textEl.fontFamily}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>

              {isFontMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 max-h-64 overflow-y-auto"
                  onClick={() => setIsFontMenuOpen(false)}
                >
                  {POPULAR_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => updateSelectedElements({ fontFamily: font.name })}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-center justify-between"
                      style={{ fontFamily: font.name }}
                    >
                      <span className="font-medium text-slate-900">{font.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{font.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Increment / Decrement & Input */}
            <div className="flex items-center bg-slate-100 rounded">
              <button
                onClick={() => updateSelectedElements({ fontSize: Math.max(8, textEl.fontSize - 2) })}
                className="p-1 hover:bg-slate-200 rounded-l text-slate-600 hover:text-slate-900"
                title="Decrease font size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                value={textEl.fontSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) updateSelectedElements({ fontSize: Math.max(6, val) });
                }}
                className="w-10 text-center bg-transparent text-xs font-semibold focus:outline-none"
              />
              <button
                onClick={() => updateSelectedElements({ fontSize: Math.min(200, textEl.fontSize + 2) })}
                className="p-1 hover:bg-slate-200 rounded-r text-slate-600 hover:text-slate-900"
                title="Increase font size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Color Swatch */}
            <div className="relative">
              <label
                className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors"
                title="Text color"
              >
                <div
                  className="w-4 h-4 rounded-sm border border-slate-300"
                  style={{ backgroundColor: textEl.color }}
                />
                <input
                  type="color"
                  value={textEl.color.startsWith('#') ? textEl.color : '#000000'}
                  onChange={(e) => updateSelectedElements({ color: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

            {/* Bold / Italic / Underline / Strikethrough */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded">
              <button
                onClick={() =>
                  updateSelectedElements({
                    fontWeight: textEl.fontWeight === 'bold' || textEl.fontWeight === '800' ? 'normal' : 'bold',
                  })
                }
                className={`p-1.5 rounded transition-colors ${
                  textEl.fontWeight === 'bold' || textEl.fontWeight === '800' || textEl.fontWeight === '700'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  updateSelectedElements({
                    fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`p-1.5 rounded transition-colors ${
                  textEl.fontStyle === 'italic' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  updateSelectedElements({
                    textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline',
                  })
                }
                className={`p-1.5 rounded transition-colors ${
                  textEl.textDecoration === 'underline'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateSelectedElements({ textAlign: align })}
                  className={`p-1.5 rounded transition-colors ${
                    textEl.textAlign === align ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Align ${align}`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Spacing Popover */}
            <div className="relative">
              <button
                onClick={() => setIsSpacingMenuOpen(!isSpacingMenuOpen)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isSpacingMenuOpen ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Letter spacing & line height"
              >
                Spacing
              </button>
              {isSpacingMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs">
                  <div className="mb-3">
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Letter Spacing</span>
                      <span className="font-semibold">{textEl.letterSpacing || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="15"
                      step="0.5"
                      value={textEl.letterSpacing || 0}
                      onChange={(e) => updateSelectedElements({ letterSpacing: parseFloat(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Line Height</span>
                      <span className="font-semibold">{textEl.lineHeight || 1.2}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={textEl.lineHeight || 1.2}
                      onChange={(e) => updateSelectedElements({ lineHeight: parseFloat(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Effects Popover */}
            <div className="relative">
              <button
                onClick={() => setIsEffectsMenuOpen(!isEffectsMenuOpen)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isEffectsMenuOpen ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Text effects (Shadow, Neon, Hollow)"
              >
                Effects
              </button>
              {isEffectsMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 text-xs">
                  <div className="font-semibold text-slate-800 mb-2 px-1">Style Effects</div>
                  {(['none', 'shadow', 'lift', 'hollow', 'neon', 'glitch'] as TextEffectType[]).map((effect) => (
                    <button
                      key={effect}
                      onClick={() => {
                        updateSelectedElements({ effect });
                        setIsEffectsMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded capitalize ${
                        textEl.effect === effect ? 'bg-purple-50 text-purple-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Magic Write AI Trigger */}
            <button
              onClick={() => setIsMagicStudioOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Magic Write</span>
            </button>
          </>
        )}

        {/* SHAPE CONTROLS */}
        {isShape && shapeEl && (
          <>
            {/* Fill Color */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Color:</span>
              <label className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors">
                <div
                  className="w-5 h-5 rounded-sm border border-slate-300"
                  style={{ backgroundColor: shapeEl.fill }}
                />
                <input
                  type="color"
                  value={shapeEl.fill.startsWith('#') ? shapeEl.fill : '#7d2ae8'}
                  onChange={(e) => updateSelectedElements({ fill: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Border Stroke Color */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-500 font-medium">Border:</span>
              <label className="w-7 h-7 rounded flex items-center justify-center cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors">
                <div
                  className="w-5 h-5 rounded-sm border border-slate-300"
                  style={{ backgroundColor: shapeEl.stroke !== 'transparent' ? shapeEl.stroke : '#ffffff' }}
                />
                <input
                  type="color"
                  value={shapeEl.stroke.startsWith('#') ? shapeEl.stroke : '#000000'}
                  onChange={(e) =>
                    updateSelectedElements({
                      stroke: e.target.value,
                      strokeWidth: shapeEl.strokeWidth > 0 ? shapeEl.strokeWidth : 2,
                    })
                  }
                  className="sr-only"
                />
              </label>
              {/* Border Width */}
              <input
                type="number"
                min="0"
                max="24"
                value={shapeEl.strokeWidth || 0}
                onChange={(e) => updateSelectedElements({ strokeWidth: parseInt(e.target.value, 10) || 0 })}
                className="w-12 px-1.5 py-0.5 bg-slate-100 rounded text-center text-xs font-medium"
                title="Border width in px"
              />
            </div>

            {/* Corner Radius (if rectangle) */}
            {shapeEl.shapeType === 'rectangle' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-slate-500 font-medium">Radius:</span>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={shapeEl.borderRadius || 0}
                  onChange={(e) => updateSelectedElements({ borderRadius: parseInt(e.target.value, 10) })}
                  className="w-20 accent-purple-600"
                  title="Corner rounding"
                />
              </div>
            )}
          </>
        )}

        {/* IMAGE CONTROLS */}
        {isImage && imgEl && (
          <>
            {/* Edit Image / Filters Button */}
            <div className="relative">
              <button
                onClick={() => setIsFiltersMenuOpen(!isFiltersMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  isFiltersMenuOpen ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Edit Photo</span>
              </button>

              {isFiltersMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs">
                  <div className="font-semibold text-slate-800 mb-2">Photo Adjustments</div>

                  {/* Brightness */}
                  <div className="mb-2">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Brightness</span>
                      <span>{imgEl.filters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={imgEl.filters.brightness}
                      onChange={(e) =>
                        updateSelectedElements({
                          filters: { ...imgEl.filters, brightness: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-purple-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="mb-2">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Contrast</span>
                      <span>{imgEl.filters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={imgEl.filters.contrast}
                      onChange={(e) =>
                        updateSelectedElements({
                          filters: { ...imgEl.filters, contrast: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-purple-600"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="mb-2">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Saturation</span>
                      <span>{imgEl.filters.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={imgEl.filters.saturation}
                      onChange={(e) =>
                        updateSelectedElements({
                          filters: { ...imgEl.filters, saturation: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-purple-600"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="mb-2">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Grayscale</span>
                      <span>{imgEl.filters.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imgEl.filters.grayscale}
                      onChange={(e) =>
                        updateSelectedElements({
                          filters: { ...imgEl.filters, grayscale: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Flip Horizontal / Vertical */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded">
              <button
                onClick={() => updateSelectedElements({ flipH: !imgEl.flipH })}
                className={`p-1.5 rounded transition-colors ${
                  imgEl.flipH ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateSelectedElements({ flipV: !imgEl.flipV })}
                className={`p-1.5 rounded transition-colors ${
                  imgEl.flipV ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Corner Radius */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-500 font-medium">Corners:</span>
              <input
                type="range"
                min="0"
                max="60"
                value={imgEl.borderRadius || 0}
                onChange={(e) => updateSelectedElements({ borderRadius: parseInt(e.target.value, 10) })}
                className="w-20 accent-purple-600"
                title="Corner radius"
              />
            </div>
          </>
        )}
      </div>

      {/* Right zone: Layer Position, Transparency, Duplicate, Lock, Delete */}
      <div className="flex items-center gap-2">
        {/* Layer / Position Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPositionMenuOpen(!isPositionMenuOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              isPositionMenuOpen ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Position</span>
          </button>

          {isPositionMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs"
              onClick={() => setIsPositionMenuOpen(false)}
            >
              <div className="px-3 py-1 font-semibold text-slate-500 text-[11px]">Layer Order</div>
              <button
                onClick={bringForward}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Bring Forward</span>
                <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={sendBackward}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Send Backward</span>
                <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={bringToFront}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
              >
                Bring to Front
              </button>
              <button
                onClick={sendToBack}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
              >
                Send to Back
              </button>

              <div className="border-t border-slate-200 my-1"></div>
              <div className="px-3 py-1 font-semibold text-slate-500 text-[11px]">Align to Page</div>
              <div className="grid grid-cols-2 gap-1 px-2 py-1">
                {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => alignSelected(pos)}
                    className="px-2 py-1 text-left hover:bg-slate-100 rounded capitalize text-slate-700"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transparency / Opacity */}
        <div className="relative">
          <button
            onClick={() => setIsTransparencyOpen(!isTransparencyOpen)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isTransparencyOpen ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Transparency"
          >
            {Math.round((selectedElement.opacity ?? 1) * 100)}%
          </button>

          {isTransparencyOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Opacity</span>
                <span className="font-semibold">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={Math.round((selectedElement.opacity ?? 1) * 100)}
                onChange={(e) => updateSelectedElements({ opacity: parseInt(e.target.value, 10) / 100 })}
                className="w-full accent-purple-600"
              />
            </div>
          )}
        </div>

        {/* Duplicate */}
        <button
          onClick={duplicateSelected}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Lock / Unlock */}
        <button
          onClick={() => toggleLock()}
          className={`p-1.5 rounded transition-colors ${
            selectedElement.isLocked
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={selectedElement.isLocked ? 'Unlock element' : 'Lock element'}
        >
          {selectedElement.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Delete */}
        <button
          onClick={deleteSelected}
          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
          title="Delete (Delete or Backspace)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
