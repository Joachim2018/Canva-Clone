import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { CanvasElement, TextElement, ShapeElement, ImageElement, DrawingElement } from '../types/canvas';

export const PresentationModal: React.FC = () => {
  const { doc, isPresenting, setIsPresenting } = useCanvas();
  const [slideIndex, setSlideIndex] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  const currentPage = doc.pages[slideIndex] || doc.pages[0];
  const totalSlides = doc.pages.length;

  // Keyboard navigation for presentation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, totalSlides, setIsPresenting]);

  if (!isPresenting) return null;

  // Compute presentation scale to fit viewport
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const scale = Math.min((viewportW - 40) / doc.width, (viewportH - 40) / doc.height, 1);

  return (
    <div
      onMouseMove={() => setControlsVisible(true)}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden select-none cursor-default"
    >
      {/* Slide Artboard */}
      <div
        style={{
          width: `${doc.width}px`,
          height: `${doc.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: currentPage.backgroundColor,
          backgroundImage: currentPage.backgroundGradient || undefined,
        }}
        className="relative shadow-2xl rounded-sm overflow-hidden shrink-0"
      >
        {currentPage.backgroundImage && (
          <img
            src={currentPage.backgroundImage}
            alt="Presentation background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {currentPage.elements.map((el) => {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                opacity: el.opacity ?? 1,
                zIndex: el.zIndex,
              }}
            >
              {el.type === 'text' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    fontFamily: (el as TextElement).fontFamily,
                    fontSize: `${(el as TextElement).fontSize}px`,
                    fontWeight: (el as TextElement).fontWeight,
                    fontStyle: (el as TextElement).fontStyle,
                    textDecoration: (el as TextElement).textDecoration,
                    color: (el as TextElement).color,
                    textAlign: (el as TextElement).textAlign,
                    letterSpacing: `${(el as TextElement).letterSpacing || 0}px`,
                    lineHeight: (el as TextElement).lineHeight || 1.2,
                    textShadow:
                      (el as TextElement).effect === 'neon'
                        ? `0 0 10px ${(el as TextElement).color}, 0 0 20px ${(el as TextElement).color}`
                        : undefined,
                  }}
                  className="flex flex-col justify-start break-words whitespace-pre-wrap"
                >
                  {(el as TextElement).text}
                </div>
              )}

              {el.type === 'shape' && (
                <div className="w-full h-full">
                  {(el as ShapeElement).shapeType === 'rectangle' && (
                    <div
                      style={{
                        backgroundColor: (el as ShapeElement).fill,
                        borderColor: (el as ShapeElement).stroke,
                        borderWidth: `${(el as ShapeElement).strokeWidth}px`,
                        borderRadius: `${(el as ShapeElement).borderRadius || 0}px`,
                      }}
                      className="w-full h-full"
                    />
                  )}
                  {(el as ShapeElement).shapeType === 'circle' && (
                    <div
                      style={{
                        backgroundColor: (el as ShapeElement).fill,
                        borderColor: (el as ShapeElement).stroke,
                        borderWidth: `${(el as ShapeElement).strokeWidth}px`,
                      }}
                      className="w-full h-full rounded-full"
                    />
                  )}
                  {(el as ShapeElement).shapeType === 'line' && (
                    <div
                      style={{
                        backgroundColor: (el as ShapeElement).stroke || (el as ShapeElement).fill,
                        height: `${Math.max(2, (el as ShapeElement).strokeWidth || 4)}px`,
                      }}
                      className="w-full my-auto rounded-full"
                    />
                  )}
                </div>
              )}

              {el.type === 'image' && (
                <div
                  style={{
                    borderRadius: `${(el as ImageElement).borderRadius || 0}px`,
                  }}
                  className="w-full h-full overflow-hidden"
                >
                  <img
                    src={(el as ImageElement).src}
                    alt={(el as ImageElement).alt || 'Slide image'}
                    style={{
                      transform: `${(el as ImageElement).flipH ? 'scaleX(-1)' : ''} ${
                        (el as ImageElement).flipV ? 'scaleY(-1)' : ''
                      }`,
                      filter: `brightness(${(el as ImageElement).filters.brightness}%) contrast(${
                        (el as ImageElement).filters.contrast
                      }%) saturate(${(el as ImageElement).filters.saturation}%) grayscale(${
                        (el as ImageElement).filters.grayscale
                      }%) sepia(${(el as ImageElement).filters.sepia}%) blur(${
                        (el as ImageElement).filters.blur
                      }px)`,
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {el.type === 'drawing' && (
                <svg
                  style={{
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    overflow: 'visible',
                  }}
                >
                  <path
                    d={generatePath((el as DrawingElement).points)}
                    fill="none"
                    stroke={(el as DrawingElement).strokeColor}
                    strokeWidth={(el as DrawingElement).strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Presenter Controls Dock */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        }`}
      >
        <button
          onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={slideIndex === 0}
          className="p-1.5 hover:bg-slate-800 rounded-full disabled:opacity-30 transition-colors"
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold tracking-wider font-mono px-2">
          {slideIndex + 1} / {totalSlides}
        </span>

        <button
          onClick={() => setSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
          disabled={slideIndex === totalSlides - 1}
          className="p-1.5 hover:bg-slate-800 rounded-full disabled:opacity-30 transition-colors"
          title="Next Slide (Right Arrow or Space)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-700"></div>

        <button
          onClick={() => setIsPresenting(false)}
          className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Exit Presentation (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

function generatePath(points: Array<{ x: number; y: number }>): string {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}
