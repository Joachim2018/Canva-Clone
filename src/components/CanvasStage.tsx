import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvas } from '../context/CanvasContext';
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  DrawingElement,
  DrawingPoint,
} from '../types/canvas';
import { RotateCw, Move } from 'lucide-react';

export const CanvasStage: React.FC = () => {
  const {
    doc,
    currentPage,
    selectedIds,
    selectElement,
    clearSelection,
    updateElement,
    zoom,
    pan,
    setPan,
    activeTool,
    drawSettings,
    snapGuides,
    setSnapGuides,
  } = useCanvas();

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  // Dragging & Resizing state
  const [dragState, setDragState] = useState<{
    mode: 'none' | 'move' | 'resize' | 'rotate' | 'pan-stage' | 'drawing';
    handle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
    elementId?: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
    origHeight: number;
    origRotation: number;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origWidth: 0,
    origHeight: 0,
    origRotation: 0,
  });

  // In-place text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Active freehand stroke points
  const [activeDrawingPoints, setActiveDrawingPoints] = useState<DrawingPoint[]>([]);

  const isSpacePressed = useRef(false);

  // Keyboard Spacebar tracking for stage panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.code === 'Space') isSpacePressed.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpacePressed.current = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel zoom / pan handling
  useEffect(() => {
    const container = stageContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse Down on an element
  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    if (activeTool === 'draw') return;
    e.stopPropagation();

    if (element.isLocked) {
      selectElement(element.id, e.shiftKey);
      return;
    }

    if (!selectedIds.includes(element.id)) {
      selectElement(element.id, e.shiftKey);
    }

    setDragState({
      mode: 'move',
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origWidth: element.width,
      origHeight: element.height,
      origRotation: element.rotation || 0,
    });
  };

  // Mouse Down on a Resize Handle
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w',
    element: CanvasElement
  ) => {
    e.stopPropagation();
    if (element.isLocked) return;

    setDragState({
      mode: 'resize',
      handle,
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origWidth: element.width,
      origHeight: element.height,
      origRotation: element.rotation || 0,
    });
  };

  // Mouse Down on Rotation Handle
  const handleRotateMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    if (element.isLocked) return;

    setDragState({
      mode: 'rotate',
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origWidth: element.width,
      origHeight: element.height,
      origRotation: element.rotation || 0,
    });
  };

  // Stage Mouse Down (Background click / Pan / Drawing)
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (isSpacePressed.current || activeTool === 'hand'))) {
      // Pan stage
      setDragState({
        mode: 'pan-stage',
        startX: e.clientX,
        startY: e.clientY,
        origX: pan.x,
        origY: pan.y,
        origWidth: 0,
        origHeight: 0,
        origRotation: 0,
      });
      return;
    }

    if (activeTool === 'draw') {
      // Freehand drawing start
      const rect = artboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ptX = (e.clientX - rect.left) / zoom;
      const ptY = (e.clientY - rect.top) / zoom;

      setActiveDrawingPoints([{ x: ptX, y: ptY }]);
      setDragState({
        mode: 'drawing',
        startX: e.clientX,
        startY: e.clientY,
        origX: 0,
        origY: 0,
        origWidth: 0,
        origHeight: 0,
        origRotation: 0,
      });
      return;
    }

    // Clicking empty space deselects elements & finishes text editing
    clearSelection();
    setEditingTextId(null);
  };

  // Stage Mouse Move
  const handleStageMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.mode === 'none') return;

      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;

      // 1. Move Element
      if (dragState.mode === 'move' && dragState.elementId) {
        const el = currentPage.elements.find((item) => item.id === dragState.elementId);
        if (!el || el.isLocked) return;

        let newX = Math.round(dragState.origX + deltaX);
        let newY = Math.round(dragState.origY + deltaY);

        // Smart Snapping detection
        const activeGuides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];
        const snapThreshold = 6;

        // Snap X to center of artboard
        const centerX = newX + el.width / 2;
        const artboardCenterX = doc.width / 2;
        if (Math.abs(centerX - artboardCenterX) < snapThreshold) {
          newX = artboardCenterX - el.width / 2;
          activeGuides.push({ type: 'vertical', position: artboardCenterX });
        }

        // Snap Y to center of artboard
        const centerY = newY + el.height / 2;
        const artboardCenterY = doc.height / 2;
        if (Math.abs(centerY - artboardCenterY) < snapThreshold) {
          newY = artboardCenterY - el.height / 2;
          activeGuides.push({ type: 'horizontal', position: artboardCenterY });
        }

        setSnapGuides(activeGuides);
        updateElement(el.id, { x: newX, y: newY });
      }

      // 2. Resize Element
      else if (dragState.mode === 'resize' && dragState.elementId && dragState.handle) {
        const el = currentPage.elements.find((item) => item.id === dragState.elementId);
        if (!el || el.isLocked) return;

        let { origX, origY, origWidth, origHeight } = dragState;
        let newX = origX;
        let newY = origY;
        let newW = origWidth;
        let newH = origHeight;

        switch (dragState.handle) {
          case 'se':
            newW = Math.max(20, origWidth + deltaX);
            newH = Math.max(20, origHeight + deltaY);
            break;
          case 'sw':
            newW = Math.max(20, origWidth - deltaX);
            newX = origX + (origWidth - newW);
            newH = Math.max(20, origHeight + deltaY);
            break;
          case 'ne':
            newW = Math.max(20, origWidth + deltaX);
            newH = Math.max(20, origHeight - deltaY);
            newY = origY + (origHeight - newH);
            break;
          case 'nw':
            newW = Math.max(20, origWidth - deltaX);
            newX = origX + (origWidth - newW);
            newH = Math.max(20, origHeight - deltaY);
            newY = origY + (origHeight - newH);
            break;
          case 'e':
            newW = Math.max(20, origWidth + deltaX);
            break;
          case 'w':
            newW = Math.max(20, origWidth - deltaX);
            newX = origX + (origWidth - newW);
            break;
          case 's':
            newH = Math.max(20, origHeight + deltaY);
            break;
          case 'n':
            newH = Math.max(20, origHeight - deltaY);
            newY = origY + (origHeight - newH);
            break;
        }

        // If resizing text, adjust font size proportionally if corner dragged
        if (el.type === 'text' && ['nw', 'ne', 'sw', 'se'].includes(dragState.handle)) {
          const ratio = newW / origWidth;
          const textEl = el as TextElement;
          const newFontSize = Math.max(8, Math.round(textEl.fontSize * ratio));
          updateElement(el.id, {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
            fontSize: newFontSize,
          });
        } else {
          updateElement(el.id, {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          });
        }
      }

      // 3. Rotate Element
      else if (dragState.mode === 'rotate' && dragState.elementId) {
        const el = currentPage.elements.find((item) => item.id === dragState.elementId);
        if (!el || el.isLocked) return;

        const rect = artboardRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerScreenX = rect.left + (el.x + el.width / 2) * zoom;
        const centerScreenY = rect.top + (el.y + el.height / 2) * zoom;

        const radians = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
        let degrees = Math.round((radians * 180) / Math.PI) + 90;
        if (degrees < 0) degrees += 360;

        // Snap to 45 degree increments if close
        if (degrees % 45 < 3 || degrees % 45 > 42) {
          degrees = Math.round(degrees / 45) * 45;
        }

        updateElement(el.id, { rotation: degrees % 360 });
      }

      // 4. Pan Stage
      else if (dragState.mode === 'pan-stage') {
        const rawDeltaX = e.clientX - dragState.startX;
        const rawDeltaY = e.clientY - dragState.startY;
        setPan({
          x: dragState.origX + rawDeltaX,
          y: dragState.origY + rawDeltaY,
        });
      }

      // 5. Drawing mode
      else if (dragState.mode === 'drawing') {
        const rect = artboardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const ptX = (e.clientX - rect.left) / zoom;
        const ptY = (e.clientY - rect.top) / zoom;

        setActiveDrawingPoints((prev) => [...prev, { x: ptX, y: ptY }]);
      }
    },
    [dragState, zoom, currentPage.elements, doc.width, doc.height, updateElement, setPan, setSnapGuides]
  );

  // Stage Mouse Up
  const handleStageMouseUp = useCallback(() => {
    if (dragState.mode === 'drawing' && activeDrawingPoints.length > 1) {
      // Commit drawing stroke as a canvas element
      const minX = Math.min(...activeDrawingPoints.map((p) => p.x));
      const maxX = Math.max(...activeDrawingPoints.map((p) => p.x));
      const minY = Math.min(...activeDrawingPoints.map((p) => p.y));
      const maxY = Math.max(...activeDrawingPoints.map((p) => p.y));

      const strokeEl: DrawingElement = {
        id: 'draw-' + Date.now(),
        type: 'drawing',
        points: activeDrawingPoints,
        strokeColor: drawSettings.color,
        strokeWidth: drawSettings.width,
        tool: drawSettings.tool,
        x: minX,
        y: minY,
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY),
        rotation: 0,
        opacity: drawSettings.tool === 'highlighter' ? 0.45 : 1,
        isLocked: false,
        zIndex: currentPage.elements.length + 1,
      };

      currentPage.elements.push(strokeEl);
      setActiveDrawingPoints([]);
    }

    setDragState({
      mode: 'none',
      startX: 0,
      startY: 0,
      origX: 0,
      origY: 0,
      origWidth: 0,
      origHeight: 0,
      origRotation: 0,
    });
    setSnapGuides([]);
  }, [dragState, activeDrawingPoints, drawSettings, currentPage.elements, setSnapGuides]);

  return (
    <div
      ref={stageContainerRef}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
      className="flex-1 h-[calc(100vh-6rem)] overflow-auto bg-canvas-stage relative flex items-center justify-center p-12 select-none"
      style={{
        cursor:
          activeTool === 'hand' || dragState.mode === 'pan-stage'
            ? 'grab'
            : activeTool === 'draw'
            ? 'crosshair'
            : 'default',
      }}
    >
      {/* Visual Artboard Container with Zoom & Pan Transforms */}
      <div
        ref={artboardRef}
        style={{
          width: `${doc.width}px`,
          height: `${doc.height}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          backgroundColor: currentPage.backgroundColor,
          backgroundImage: currentPage.backgroundGradient || undefined,
        }}
        className="relative shadow-2xl rounded-sm transition-shadow duration-300 ring-1 ring-black/10 shrink-0"
      >
        {/* Render Background Image if set */}
        {currentPage.backgroundImage && (
          <img
            src={currentPage.backgroundImage}
            alt="Page background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Render Page Elements */}
        {currentPage.elements.map((el) => {
          const isSelected = selectedIds.includes(el.id);
          const isEditing = editingTextId === el.id;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === 'text') {
                  setEditingTextId(el.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                opacity: el.opacity ?? 1,
                zIndex: el.zIndex,
                cursor: el.isLocked ? 'default' : 'move',
              }}
              className="group select-none"
            >
              {/* 1. TEXT ELEMENT */}
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
                        : (el as TextElement).effect === 'shadow'
                        ? '2px 4px 10px rgba(0,0,0,0.3)'
                        : undefined,
                    WebkitTextStroke:
                      (el as TextElement).effect === 'hollow'
                        ? `2px ${(el as TextElement).color}`
                        : undefined,
                  }}
                  className={`flex flex-col justify-start break-words overflow-visible whitespace-pre-wrap ${
                    (el as TextElement).effect === 'hollow' ? 'text-transparent' : ''
                  }`}
                >
                  {isEditing ? (
                    <textarea
                      autoFocus
                      value={(el as TextElement).text}
                      onChange={(e) => updateElement(el.id, { text: e.target.value })}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingTextId(null);
                      }}
                      className="w-full h-full bg-transparent resize-none focus:outline-none border border-purple-500 rounded p-1"
                      style={{
                        fontFamily: (el as TextElement).fontFamily,
                        fontSize: `${(el as TextElement).fontSize}px`,
                        fontWeight: (el as TextElement).fontWeight,
                        color: (el as TextElement).color,
                        textAlign: (el as TextElement).textAlign,
                      }}
                    />
                  ) : (
                    (el as TextElement).text
                  )}
                </div>
              )}

              {/* 2. SHAPE ELEMENT */}
              {el.type === 'shape' && (
                <div className="w-full h-full pointer-events-none">
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

                  {(el as ShapeElement).shapeType === 'triangle' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon
                        points="50,5 95,95 5,95"
                        fill={(el as ShapeElement).fill}
                        stroke={(el as ShapeElement).stroke}
                        strokeWidth={(el as ShapeElement).strokeWidth}
                      />
                    </svg>
                  )}

                  {(el as ShapeElement).shapeType === 'star' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon
                        points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                        fill={(el as ShapeElement).fill}
                        stroke={(el as ShapeElement).stroke}
                        strokeWidth={(el as ShapeElement).strokeWidth}
                      />
                    </svg>
                  )}

                  {(el as ShapeElement).shapeType === 'heart' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d="M 50,85 C 20,60 0,38 0,22 C 0,8 10,0 24,0 C 34,0 44,6 50,15 C 56,6 66,0 76,0 C 90,0 100,8 100,22 C 100,38 80,60 50,85 Z"
                        fill={(el as ShapeElement).fill}
                      />
                    </svg>
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

              {/* 3. IMAGE ELEMENT */}
              {el.type === 'image' && (
                <div
                  style={{
                    borderRadius: `${(el as ImageElement).borderRadius || 0}px`,
                  }}
                  className="w-full h-full overflow-hidden"
                >
                  <img
                    src={(el as ImageElement).src}
                    alt={(el as ImageElement).alt || 'Design asset'}
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
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              )}

              {/* 4. DRAWING ELEMENT */}
              {el.type === 'drawing' && (
                <svg
                  style={{
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    overflow: 'visible',
                  }}
                  className="pointer-events-none"
                >
                  <path
                    d={generateSvgPath((el as DrawingElement).points)}
                    fill="none"
                    stroke={(el as DrawingElement).strokeColor}
                    strokeWidth={(el as DrawingElement).strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={(el as DrawingElement).tool === 'highlighter' ? 0.45 : 1}
                  />
                </svg>
              )}

              {/* SELECTION BOUNDING BOX & 8 TRANSFORM HANDLES */}
              {isSelected && !el.isLocked && (
                <div className="absolute inset-0 border-2 border-purple-600 pointer-events-none">
                  {/* Rotation Stalk & Handle */}
                  <div
                    onMouseDown={(e) => handleRotateMouseDown(e, el)}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border border-purple-600 rounded-full flex items-center justify-center cursor-grab pointer-events-auto hover:scale-125 transition-transform shadow-md"
                    title="Drag to rotate"
                  >
                    <RotateCw className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-purple-600"></div>

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'nw', el)}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full pointer-events-auto cursor-nwse-resize shadow hover:scale-125"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'ne', el)}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full pointer-events-auto cursor-nesw-resize shadow hover:scale-125"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'se', el)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full pointer-events-auto cursor-nwse-resize shadow hover:scale-125"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'sw', el)}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full pointer-events-auto cursor-nesw-resize shadow hover:scale-125"
                  />

                  {/* Edge Handles */}
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'n', el)}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-purple-600 rounded-sm pointer-events-auto cursor-ns-resize"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 's', el)}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-purple-600 rounded-sm pointer-events-auto cursor-ns-resize"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'w', el)}
                    className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-4 bg-white border border-purple-600 rounded-sm pointer-events-auto cursor-ew-resize"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, 'e', el)}
                    className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-4 bg-white border border-purple-600 rounded-sm pointer-events-auto cursor-ew-resize"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Freehand Drawing Stroke Preview */}
        {activeDrawingPoints.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
            <path
              d={generateSvgPath(activeDrawingPoints)}
              fill="none"
              stroke={drawSettings.color}
              strokeWidth={drawSettings.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={drawSettings.tool === 'highlighter' ? 0.45 : 1}
            />
          </svg>
        )}

        {/* Smart Snapping Guide Lines (Canva Style) */}
        {snapGuides.map((guide, idx) => (
          <div
            key={idx}
            className={`absolute pointer-events-none snap-guide z-50 ${
              guide.type === 'vertical'
                ? 'top-0 bottom-0 w-[1px] bg-pink-500'
                : 'left-0 right-0 h-[1px] bg-pink-500'
            }`}
            style={{
              [guide.type === 'vertical' ? 'left' : 'top']: `${guide.position}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

function generateSvgPath(points: DrawingPoint[]): string {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}
