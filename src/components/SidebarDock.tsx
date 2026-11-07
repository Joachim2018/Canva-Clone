import React, { useState, useRef } from 'react';
import {
  LayoutTemplate,
  Shapes,
  Type,
  Sparkles,
  Upload,
  PenTool,
  Layers as LayersIcon,
  Palette,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useCanvas, SidebarTab } from '../context/CanvasContext';
import { TEMPLATES_LIBRARY } from '../data/templates';
import { SHAPE_PRESETS, TYPOGRAPHY_COMBOS, STICKER_ELEMENTS } from '../data/elements';
import { COLOR_PALETTES } from '../data/fonts';

export const SidebarDock: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    loadTemplate,
    addElement,
    currentPage,
    selectedIds,
    selectElement,
    toggleLock,
    deleteSelected,
    setPageBackground,
    activeTool,
    setActiveTool,
    drawSettings,
    setDrawSettings,
    setIsMagicStudioOpen,
  } = useCanvas();

  const [searchQuery, setSearchQuery] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [userUploads, setUserUploads] = useState<Array<{ id: string; url: string; name: string }>>([
    {
      id: 'img-c1',
      url: '/src/assets/images/asset_coffee_lifestyle_1794033352659.jpg',
      name: 'Cold Brew Studio',
    },
    {
      id: 'img-c2',
      url: '/src/assets/images/asset_modern_architecture_1794033353842.jpg',
      name: 'Modern Architecture',
    },
    {
      id: 'img-c3',
      url: '/src/assets/images/asset_wellness_nature_1794033353326.jpg',
      name: 'Botanical Skincare',
    },
    {
      id: 'img-c4',
      url: '/src/assets/images/asset_creative_portrait_1794033354028.jpg',
      name: 'Executive Portrait',
    },
  ]);

  const fileUploadRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const url = uploadEvent.target?.result as string;
        setUserUploads((prev) => [
          {
            id: 'upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            url,
            name: file.name,
          },
          ...prev,
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const dockTabs = [
    { id: 'templates' as SidebarTab, label: 'Design', icon: LayoutTemplate },
    { id: 'elements' as SidebarTab, label: 'Elements', icon: Shapes },
    { id: 'text' as SidebarTab, label: 'Text', icon: Type },
    { id: 'magic' as SidebarTab, label: 'Magic Studio', icon: Sparkles, badge: 'AI' },
    { id: 'uploads' as SidebarTab, label: 'Uploads', icon: Upload },
    { id: 'draw' as SidebarTab, label: 'Draw', icon: PenTool },
    { id: 'background' as SidebarTab, label: 'Background', icon: Palette },
    { id: 'layers' as SidebarTab, label: 'Layers', icon: LayersIcon },
  ];

  const handleTabClick = (tab: SidebarTab) => {
    if (activeTab === tab && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setActiveTab(tab);
      setSidebarOpen(true);
      if (tab === 'draw') {
        setActiveTool('draw');
      } else {
        if (activeTool === 'draw') setActiveTool('select');
      }
    }
  };

  // Filter templates
  const filteredTemplates = TEMPLATES_LIBRARY.filter((tmpl) => {
    const matchesCat = templateCategory === 'all' || tmpl.category === templateCategory;
    const matchesQuery = !searchQuery || tmpl.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] select-none shrink-0 z-20">
      {/* 1. Left Icon Navigation Rail */}
      <aside className="w-18 bg-[#0e131f] border-r border-slate-800 flex flex-col items-center py-2 text-slate-400 shrink-0">
        <div className="flex flex-col gap-1 w-full px-1">
          {dockTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && sidebarOpen;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition-all w-full text-center ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium'
                    : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-cyan-400' : ''}`} />
                <span className="text-[10px] leading-tight font-medium tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-[9px] font-bold text-white px-1 rounded-full scale-90">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. Expandable Content Flyout Panel */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-lg animate-in fade-in slide-in-from-left-2 duration-150">
          {/* Header of the panel */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm capitalize">
              {activeTab === 'magic' ? 'Magic Studio AI' : activeTab}
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
              title="Collapse panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content based on activeTab */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* TAB: TEMPLATES */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['all', 'social', 'presentation', 'marketing', 'flyer'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                        templateCategory === cat
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => loadTemplate(tmpl)}
                      className="group cursor-pointer rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all hover:border-purple-500 bg-slate-50 flex flex-col"
                    >
                      <div className="relative aspect-square w-full bg-slate-200 overflow-hidden">
                        {tmpl.thumbnail ? (
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <LayoutTemplate className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-purple-600 px-2.5 py-1 rounded shadow">
                            Load
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="font-semibold text-xs text-slate-800 truncate">{tmpl.title}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{tmpl.format.replace('-', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ELEMENTS */}
            {activeTab === 'elements' && (
              <div className="space-y-4">
                {/* Shapes Section */}
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 mb-2">Shapes & Geometry</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {SHAPE_PRESETS.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() =>
                          addElement({
                            type: 'shape',
                            shapeType: shape.shapeType,
                            fill: shape.fill,
                            stroke: shape.stroke,
                            strokeWidth: shape.strokeWidth,
                            borderRadius: shape.borderRadius || 0,
                            width: shape.width,
                            height: shape.height,
                          })
                        }
                        className="h-14 border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-lg flex items-center justify-center p-2 transition-colors group"
                        title={shape.name}
                      >
                        <div
                          className="w-8 h-8 rounded-sm transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: shape.fill,
                            borderRadius:
                              shape.shapeType === 'circle'
                                ? '50%'
                                : shape.borderRadius
                                ? `${shape.borderRadius / 4}px`
                                : '2px',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stickers & Emoticons */}
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 mb-2">Stickers & Accents</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {STICKER_ELEMENTS.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() =>
                          addElement({
                            type: 'text',
                            text: sticker.emoji,
                            fontSize: 72,
                            width: 120,
                            height: 120,
                            textAlign: 'center',
                          })
                        }
                        className="h-12 border border-slate-200 hover:border-purple-500 hover:bg-slate-50 rounded-lg flex items-center justify-center text-2xl transition-transform hover:scale-110"
                        title={sticker.label}
                      >
                        {sticker.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TEXT */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                {/* Quick Add Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      addElement({
                        type: 'text',
                        text: 'Add a heading',
                        fontSize: 52,
                        fontFamily: 'Outfit',
                        fontWeight: '800',
                        color: '#0F172A',
                        width: 500,
                        height: 70,
                      })
                    }
                    className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors flex items-center justify-between group"
                  >
                    <span className="font-['Outfit'] font-extrabold text-lg text-slate-900 group-hover:text-purple-700">
                      Add a heading
                    </span>
                    <Plus className="w-4 h-4 text-purple-600" />
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'text',
                        text: 'Add a subheading',
                        fontSize: 28,
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: '600',
                        color: '#334155',
                        width: 400,
                        height: 44,
                      })
                    }
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between group"
                  >
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-800">
                      Add a subheading
                    </span>
                    <Plus className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'text',
                        text: 'Add a little bit of body text for explanations and supporting descriptions.',
                        fontSize: 16,
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 'normal',
                        color: '#64748B',
                        width: 360,
                        height: 50,
                      })
                    }
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between group"
                  >
                    <span className="font-['Plus_Jakarta_Sans'] text-xs text-slate-600">
                      Add a little bit of body text
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>

                {/* Pre-styled Font Combinations */}
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 mb-2">Typography Combinations</h4>
                  <div className="space-y-2">
                    {TYPOGRAPHY_COMBOS.map((combo) => (
                      <button
                        key={combo.id}
                        onClick={() => {
                          addElement({
                            type: 'text',
                            text: combo.title,
                            fontFamily: combo.titleFont,
                            fontWeight: combo.titleWeight,
                            fontSize: combo.titleSize,
                            color: combo.titleColor,
                            letterSpacing: combo.letterSpacing,
                            width: 600,
                            height: 80,
                            y: 200,
                          });
                          addElement({
                            type: 'text',
                            text: combo.subtitle,
                            fontFamily: combo.subtitleFont,
                            fontWeight: '600',
                            fontSize: combo.subtitleSize,
                            color: combo.subtitleColor,
                            letterSpacing: combo.letterSpacing + 1,
                            width: 500,
                            height: 30,
                            y: 290,
                          });
                        }}
                        className="w-full p-3 border border-slate-200 hover:border-purple-500 rounded-lg text-left transition-colors bg-white hover:shadow-sm"
                      >
                        <p
                          className="font-bold text-base leading-tight"
                          style={{
                            fontFamily: combo.titleFont,
                            color: combo.titleColor,
                            letterSpacing: `${combo.letterSpacing}px`,
                          }}
                        >
                          {combo.title}
                        </p>
                        <p
                          className="text-xs uppercase mt-0.5 tracking-wider"
                          style={{
                            fontFamily: combo.subtitleFont,
                            color: combo.subtitleColor,
                          }}
                        >
                          {combo.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MAGIC STUDIO (AI) */}
            {activeTab === 'magic' && (
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-br from-purple-50 via-indigo-50 to-cyan-50 border border-purple-200 rounded-xl text-center">
                  <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Canva Magic Studio</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Harness Gemini AI to generate designs, write punchy slogans, and create images.
                  </p>
                  <button
                    onClick={() => setIsMagicStudioOpen(true)}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg font-semibold text-xs shadow-md transition-all"
                  >
                    Open AI Magic Studio
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <div
                    onClick={() => setIsMagicStudioOpen(true)}
                    className="p-2.5 border border-slate-200 hover:border-purple-400 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-xs text-slate-800">🪄 Magic Design</p>
                    <p className="text-[11px] text-slate-500">
                      Describe any concept to produce a complete styled layout.
                    </p>
                  </div>
                  <div
                    onClick={() => setIsMagicStudioOpen(true)}
                    className="p-2.5 border border-slate-200 hover:border-purple-400 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-xs text-slate-800">✍️ Magic Write</p>
                    <p className="text-[11px] text-slate-500">
                      Rewrite, brainstorm catchy slogans, or craft bold headlines.
                    </p>
                  </div>
                  <div
                    onClick={() => setIsMagicStudioOpen(true)}
                    className="p-2.5 border border-slate-200 hover:border-purple-400 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-xs text-slate-800">🎨 AI Media Generator</p>
                    <p className="text-[11px] text-slate-500">
                      Generate images and visuals directly to your canvas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: UPLOADS & MEDIA */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                {/* Upload Button */}
                <button
                  onClick={() => fileUploadRef.current?.click()}
                  className="w-full py-2.5 border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-xl bg-purple-50/50 hover:bg-purple-50 flex items-center justify-center gap-2 text-xs font-semibold text-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span>Upload Files</span>
                </button>
                <input
                  ref={fileUploadRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Media Library Grid */}
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 mb-2">Media Library</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {userUploads.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          addElement({
                            type: 'image',
                            src: item.url,
                            width: 480,
                            height: 340,
                          })
                        }
                        className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all hover:border-purple-500 bg-slate-100"
                        title={item.name}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DRAW */}
            {activeTab === 'draw' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  Draw freehand directly on top of the artboard.
                </div>

                {/* Pen vs Highlighter */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDrawSettings((prev) => ({ ...prev, tool: 'pen' }))}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      drawSettings.tool === 'pen'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>
                  <button
                    onClick={() => setDrawSettings((prev) => ({ ...prev, tool: 'highlighter' }))}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      drawSettings.tool === 'highlighter'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 bg-yellow-400 rounded-sm"></span>
                    <span>Highlighter</span>
                  </button>
                </div>

                {/* Stroke Size */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Stroke Width</span>
                    <span className="font-semibold">{drawSettings.width}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={drawSettings.width}
                    onChange={(e) =>
                      setDrawSettings((prev) => ({ ...prev, width: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-purple-600"
                  />
                </div>

                {/* Color Swatches */}
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 mb-2">Ink Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '#7D2AE8',
                      '#00C4CC',
                      '#FF5757',
                      '#FFBD59',
                      '#00BF63',
                      '#111827',
                      '#F43F5E',
                      '#3B82F6',
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => setDrawSettings((prev) => ({ ...prev, color: c }))}
                        className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 ${
                          drawSettings.color === c
                            ? 'ring-2 ring-purple-600 ring-offset-2 scale-105'
                            : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BACKGROUND */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-slate-700">Solid Colors</h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    '#FFFFFF',
                    '#F8FAFC',
                    '#F5EBE1',
                    '#FEF3C7',
                    '#E0F2FE',
                    '#F3E8FF',
                    '#FEE2E2',
                    '#ECFDF5',
                    '#334155',
                    '#0F172A',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPageBackground(color)}
                      className={`h-9 rounded-lg border transition-all hover:scale-105 ${
                        currentPage.backgroundColor === color
                          ? 'ring-2 ring-purple-600 border-transparent shadow'
                          : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <h4 className="font-semibold text-xs text-slate-700 mt-4">Curated Palettes</h4>
                <div className="space-y-2">
                  {COLOR_PALETTES.map((pal) => (
                    <div
                      key={pal.name}
                      onClick={() => setPageBackground(pal.colors[pal.colors.length - 1])}
                      className="p-2 border border-slate-200 hover:border-purple-400 rounded-lg cursor-pointer bg-slate-50 transition-colors"
                    >
                      <p className="text-[11px] font-medium text-slate-700 mb-1.5">{pal.name}</p>
                      <div className="flex gap-1">
                        {pal.colors.map((c, i) => (
                          <div
                            key={i}
                            className="h-5 flex-1 rounded-sm border border-slate-200/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LAYERS */}
            {activeTab === 'layers' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">
                  {currentPage.elements.length} layer{currentPage.elements.length === 1 ? '' : 's'} on this page
                </p>
                <div className="space-y-1">
                  {[...currentPage.elements]
                    .reverse()
                    .map((el) => {
                      const isSelected = selectedIds.includes(el.id);
                      return (
                        <div
                          key={el.id}
                          onClick={() => selectElement(el.id)}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-50 border-purple-500 text-purple-900 font-semibold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="capitalize text-slate-400 font-mono text-[10px]">
                              {el.type}
                            </span>
                            <span className="truncate">
                              {el.type === 'text'
                                ? (el as any).text.slice(0, 22)
                                : el.type === 'shape'
                                ? (el as any).shapeType
                                : el.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLock(el.id);
                              }}
                              className="p-1 hover:text-slate-900 text-slate-400"
                            >
                              {el.isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectElement(el.id);
                                deleteSelected();
                              }}
                              className="p-1 hover:text-rose-600 text-slate-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
