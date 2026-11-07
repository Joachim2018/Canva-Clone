import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Type,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';

export const MagicStudioModal: React.FC = () => {
  const {
    isMagicStudioOpen,
    setIsMagicStudioOpen,
    selectedElement,
    updateSelectedElements,
    addElement,
    setPageBackground,
    doc,
  } = useCanvas();

  const [activeAITab, setActiveAITab] = useState<'design' | 'write' | 'image'>('design');

  // Magic Design State
  const [designPrompt, setDesignPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);

  // Magic Write State
  const [writePrompt, setWritePrompt] = useState('');
  const [writeTone, setWriteTone] = useState<'professional' | 'playful' | 'bold' | 'elegant'>('bold');
  const [writeTask, setWriteTask] = useState<'headline' | 'slogan' | 'rewrite' | 'summarize'>('headline');
  const [generatedText, setGeneratedText] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  // Magic Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isMagicStudioOpen) return null;

  // Handle Magic Design Generation
  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) return;
    setIsDesigning(true);
    try {
      const res = await fetch('/api/magic-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: designPrompt,
          canvasType: doc.format,
        }),
      });
      const data = await res.json();
      if (data && data.design) {
        const { design } = data;
        if (design.backgroundColor) {
          setPageBackground(design.backgroundColor);
        }
        if (Array.isArray(design.elements)) {
          design.elements.forEach((el: any) => {
            addElement(el);
          });
        }
        setIsMagicStudioOpen(false);
      }
    } catch (err) {
      console.error('Failed to generate design', err);
    } finally {
      setIsDesigning(false);
    }
  };

  // Handle Magic Write
  const handleGenerateWrite = async () => {
    setIsWriting(true);
    const currentSelectedText =
      selectedElement?.type === 'text' ? (selectedElement as any).text : '';

    try {
      const res = await fetch('/api/magic-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: writePrompt,
          tone: writeTone,
          task: writeTask,
          currentText: currentSelectedText,
        }),
      });
      const data = await res.json();
      if (data && data.text) {
        setGeneratedText(data.text);
      }
    } catch (err) {
      console.error('Failed to generate write', err);
    } finally {
      setIsWriting(false);
    }
  };

  // Handle Magic Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/magic-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      if (data && data.url) {
        setGeneratedImageUrl(data.url);
      }
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const insertGeneratedImage = () => {
    if (!generatedImageUrl) return;
    addElement({
      type: 'image',
      src: generatedImageUrl,
      width: 500,
      height: 500,
    });
    setIsMagicStudioOpen(false);
  };

  const applyGeneratedText = () => {
    if (!generatedText) return;
    if (selectedElement?.type === 'text') {
      updateSelectedElements({ text: generatedText });
    } else {
      addElement({
        type: 'text',
        text: generatedText,
        fontSize: writeTask === 'headline' ? 48 : 22,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
      });
    }
    setIsMagicStudioOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Canva Magic Studio
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-purple-100">
                Instant generative layouts, copy, and visual creative assets.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMagicStudioOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveAITab('design')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeAITab === 'design'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Magic Design</span>
          </button>
          <button
            onClick={() => setActiveAITab('write')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeAITab === 'write'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Magic Write</span>
          </button>
          <button
            onClick={() => setActiveAITab('image')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeAITab === 'image'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Magic Media</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* 1. MAGIC DESIGN */}
          {activeAITab === 'design' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Describe the design you want to create:
              </label>
              <textarea
                value={designPrompt}
                onChange={(e) => setDesignPrompt(e.target.value)}
                placeholder="e.g. Minimalist Matcha Green Tea Launch with 25% discount voucher and zen Japanese garden theme"
                className="w-full h-28 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-slate-800"
              />

              {/* Sample Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Artisan Bakery Grand Opening',
                  'Dark Neon Cyber Synth Party Poster',
                  'Modernist Architectural Pitch Deck',
                  'Minimal Skincare Serum Instagram Ad',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setDesignPrompt(sample)}
                    className="text-[11px] bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 px-2.5 py-1 rounded-md transition-colors text-left"
                  >
                    + {sample}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateDesign}
                disabled={isDesigning || !designPrompt.trim()}
                className="w-full mt-3 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDesigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Designing Complete Layout...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Design Onto Canvas</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 2. MAGIC WRITE */}
          {activeAITab === 'write' && (
            <div className="space-y-4">
              {/* Task Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Goal:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['headline', 'slogan', 'rewrite', 'summarize'] as const).map((task) => (
                    <button
                      key={task}
                      onClick={() => setWriteTask(task)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        writeTask === task
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tone of Voice:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['bold', 'professional', 'playful', 'elegant'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setWriteTone(tone)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        writeTone === tone
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Context / Topic:
                </label>
                <input
                  type="text"
                  value={writePrompt}
                  onChange={(e) => setWritePrompt(e.target.value)}
                  placeholder="e.g. Organic lavender honey or Tech recruitment drive"
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <button
                onClick={handleGenerateWrite}
                disabled={isWriting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isWriting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Copy with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Type className="w-4 h-4" />
                    <span>Generate Text</span>
                  </>
                )}
              </button>

              {/* Result display */}
              {generatedText && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide">
                      Generated Result
                    </span>
                    <button
                      onClick={applyGeneratedText}
                      className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[11px] font-bold transition-colors"
                    >
                      Insert to Canvas
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    "{generatedText}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. MAGIC MEDIA */}
          {activeAITab === 'image' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Describe the image you want Gemini to paint:
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g. Close-up macro photograph of crystalline cold brew ice coffee with condensation drops on travertine stone"
                className="w-full h-24 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-slate-800"
              />

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Image with Gemini...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Create Visual Asset</span>
                  </>
                )}
              </button>

              {generatedImageUrl && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
                  <img
                    src={generatedImageUrl}
                    alt="AI Generated"
                    className="w-48 h-48 object-cover rounded-lg shadow-md mb-3"
                  />
                  <button
                    onClick={insertGeneratedImage}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Add to Artboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
