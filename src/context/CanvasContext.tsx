import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CanvasDocument,
  CanvasElement,
  CanvasPage,
  DocumentFormat,
  ShapeType,
  TextEffectType,
} from '../types/canvas';
import { TEMPLATES_LIBRARY, DesignTemplate } from '../data/templates';
import { FORMAT_PRESETS } from '../data/fonts';

export type SidebarTab =
  | 'templates'
  | 'elements'
  | 'text'
  | 'magic'
  | 'uploads'
  | 'draw'
  | 'layers'
  | 'background';

interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

interface CanvasContextType {
  doc: CanvasDocument;
  currentPage: CanvasPage;
  selectedIds: string[];
  selectedElement: CanvasElement | null;
  selectedElements: CanvasElement[];
  zoom: number;
  pan: { x: number; y: number };
  activeTab: SidebarTab;
  sidebarOpen: boolean;
  activeTool: 'select' | 'hand' | 'draw';
  drawSettings: { tool: 'pen' | 'highlighter'; color: string; width: number };
  snapGuides: SnapGuide[];
  canUndo: boolean;
  canRedo: boolean;
  isMagicStudioOpen: boolean;
  isResizeModalOpen: boolean;
  isExportModalOpen: boolean;
  isPresenting: boolean;
  isPageGridOpen: boolean;

  // Actions
  setDocTitle: (title: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTool: (tool: 'select' | 'hand' | 'draw') => void;
  setDrawSettings: React.Dispatch<React.SetStateAction<{ tool: 'pen' | 'highlighter'; color: string; width: number }>>;
  setSnapGuides: (guides: SnapGuide[]) => void;
  setIsMagicStudioOpen: (open: boolean) => void;
  setIsResizeModalOpen: (open: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
  setIsPresenting: (open: boolean) => void;
  setIsPageGridOpen: (open: boolean) => void;

  // Document & Page actions
  setCurrentPageIndex: (index: number) => void;
  addPage: () => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setPageBackground: (color: string, gradient?: string, image?: string) => void;
  resizeDocument: (width: number, height: number, format: DocumentFormat) => void;
  loadTemplate: (template: DesignTemplate) => void;

  // Element actions
  selectElement: (id: string | null, multi?: boolean) => void;
  clearSelection: () => void;
  addElement: (element: Partial<CanvasElement> & { type: CanvasElement['type'] }) => CanvasElement;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateSelectedElements: (updates: Partial<CanvasElement>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  toggleLock: (id?: string) => void;

  // History
  undo: () => void;
  redo: () => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with our coffee roaster template as a glorious default
  const defaultTemplate = TEMPLATES_LIBRARY[0];
  const [doc, setDoc] = useState<CanvasDocument>(() => ({
    id: 'doc-' + Date.now(),
    title: defaultTemplate.title,
    format: defaultTemplate.format,
    width: defaultTemplate.width,
    height: defaultTemplate.height,
    pages: JSON.parse(JSON.stringify(defaultTemplate.pages)),
    currentPageIndex: 0,
  }));

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'draw'>('select');
  const [drawSettings, setDrawSettings] = useState<{ tool: 'pen' | 'highlighter'; color: string; width: number }>({
    tool: 'pen',
    color: '#7D2AE8',
    width: 6,
  });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  // Modals
  const [isMagicStudioOpen, setIsMagicStudioOpen] = useState<boolean>(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [isPageGridOpen, setIsPageGridOpen] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<CanvasDocument[]>([]);
  const [future, setFuture] = useState<CanvasDocument[]>([]);
  const isInternalHistoryChange = useRef(false);

  // Save history snapshot
  const pushHistory = useCallback((newDoc: CanvasDocument) => {
    if (isInternalHistoryChange.current) return;
    setHistory((prev) => [...prev.slice(-25), doc]);
    setFuture([]);
  }, [doc]);

  const currentPage = doc.pages[doc.currentPageIndex] || doc.pages[0];

  const selectedElements = currentPage.elements.filter((el) => selectedIds.includes(el.id));
  const selectedElement = selectedElements[0] || null;

  // Title
  const setDocTitle = (title: string) => {
    setDoc((prev) => ({ ...prev, title }));
  };

  // Selection
  const selectElement = (id: string | null, multi: boolean = false) => {
    if (!id) {
      setSelectedIds([]);
      return;
    }
    if (multi) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Add Element
  const addElement = (newProps: Partial<CanvasElement> & { type: CanvasElement['type'] }): CanvasElement => {
    const id = 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const zIndex = currentPage.elements.length + 1;

    let base: any = {
      id,
      x: doc.width / 2 - 150,
      y: doc.height / 2 - 80,
      width: 300,
      height: 160,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      zIndex,
      ...newProps,
    };

    if (newProps.type === 'text') {
      base = {
        width: 400,
        height: 60,
        text: 'Add your heading',
        fontSize: 36,
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: 0,
        lineHeight: 1.2,
        effect: 'none',
        ...base,
      };
    } else if (newProps.type === 'shape') {
      base = {
        shapeType: 'rectangle',
        fill: '#7D2AE8',
        stroke: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        borderRadius: 8,
        ...base,
      };
    } else if (newProps.type === 'image') {
      base = {
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          grayscale: 0,
          sepia: 0,
        },
        flipH: false,
        flipV: false,
        objectFit: 'cover',
        borderRadius: 12,
        ...base,
      };
    }

    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = [...page.elements, base];
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });

    setSelectedIds([id]);
    return base as CanvasElement;
  };

  // Update Element
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = page.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
      );
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  const updateSelectedElements = (updates: Partial<CanvasElement>) => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = page.elements.map((el) =>
        selectedIds.includes(el.id) ? ({ ...el, ...updates } as CanvasElement) : el
      );
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Delete Selected
  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = page.elements.filter((el) => !selectedIds.includes(el.id) || el.isLocked);
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
    setSelectedIds([]);
  };

  // Duplicate Selected
  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    const newIds: string[] = [];
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      const duplicatedElements: CanvasElement[] = [];

      page.elements.forEach((el) => {
        if (selectedIds.includes(el.id)) {
          const newId = 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
          newIds.push(newId);
          duplicatedElements.push({
            ...JSON.parse(JSON.stringify(el)),
            id: newId,
            x: el.x + 30,
            y: el.y + 30,
            zIndex: page.elements.length + duplicatedElements.length + 1,
          });
        }
      });

      page.elements = [...page.elements, ...duplicatedElements];
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
    setSelectedIds(newIds);
  };

  // Layer ordering
  const bringForward = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      const elements = [...page.elements];
      const id = selectedIds[0];
      const idx = elements.findIndex((e) => e.id === id);
      if (idx < elements.length - 1) {
        const temp = elements[idx];
        elements[idx] = elements[idx + 1];
        elements[idx + 1] = temp;
        // update zIndices
        elements.forEach((el, i) => (el.zIndex = i + 1));
      }
      page.elements = elements;
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  const sendBackward = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      const elements = [...page.elements];
      const id = selectedIds[0];
      const idx = elements.findIndex((e) => e.id === id);
      if (idx > 0) {
        const temp = elements[idx];
        elements[idx] = elements[idx - 1];
        elements[idx - 1] = temp;
        elements.forEach((el, i) => (el.zIndex = i + 1));
      }
      page.elements = elements;
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      const id = selectedIds[0];
      const el = page.elements.find((e) => e.id === id);
      if (!el) return prev;
      const rest = page.elements.filter((e) => e.id !== id);
      const elements = [...rest, el];
      elements.forEach((e, i) => (e.zIndex = i + 1));
      page.elements = elements;
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      const id = selectedIds[0];
      const el = page.elements.find((e) => e.id === id);
      if (!el) return prev;
      const rest = page.elements.filter((e) => e.id !== id);
      const elements = [el, ...rest];
      elements.forEach((e, i) => (e.zIndex = i + 1));
      page.elements = elements;
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Alignment to page
  const alignSelected = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedIds.length === 0) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = page.elements.map((el) => {
        if (!selectedIds.includes(el.id)) return el;
        let newX = el.x;
        let newY = el.y;

        switch (alignment) {
          case 'left':
            newX = 40;
            break;
          case 'center':
            newX = (prev.width - el.width) / 2;
            break;
          case 'right':
            newX = prev.width - el.width - 40;
            break;
          case 'top':
            newY = 40;
            break;
          case 'middle':
            newY = (prev.height - el.height) / 2;
            break;
          case 'bottom':
            newY = prev.height - el.height - 40;
            break;
        }

        return { ...el, x: newX, y: newY };
      });
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Lock
  const toggleLock = (targetId?: string) => {
    const ids = targetId ? [targetId] : selectedIds;
    if (ids.length === 0) return;
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.elements = page.elements.map((el) =>
        ids.includes(el.id) ? { ...el, isLocked: !el.isLocked } : el
      );
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Page background
  const setPageBackground = (color: string, gradient?: string, image?: string) => {
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[prev.currentPageIndex] };
      page.backgroundColor = color;
      page.backgroundGradient = gradient;
      page.backgroundImage = image;
      nextPages[prev.currentPageIndex] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Multi-page management
  const addPage = () => {
    pushHistory(doc);
    const newPage: CanvasPage = {
      id: 'p-' + Date.now(),
      name: `Page ${doc.pages.length + 1}`,
      backgroundColor: '#FFFFFF',
      elements: [],
    };
    setDoc((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      currentPageIndex: prev.pages.length,
    }));
    setSelectedIds([]);
  };

  const duplicatePage = (index: number) => {
    pushHistory(doc);
    const sourcePage = doc.pages[index];
    if (!sourcePage) return;
    const duplicated: CanvasPage = {
      ...JSON.parse(JSON.stringify(sourcePage)),
      id: 'p-' + Date.now(),
      name: `${sourcePage.name} (Copy)`,
    };
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      nextPages.splice(index + 1, 0, duplicated);
      return { ...prev, pages: nextPages, currentPageIndex: index + 1 };
    });
    setSelectedIds([]);
  };

  const deletePage = (index: number) => {
    if (doc.pages.length <= 1) return;
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = prev.pages.filter((_, i) => i !== index);
      const nextIndex = Math.min(prev.currentPageIndex, nextPages.length - 1);
      return { ...prev, pages: nextPages, currentPageIndex: nextIndex };
    });
    setSelectedIds([]);
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    pushHistory(doc);
    setDoc((prev) => {
      const nextPages = [...prev.pages];
      const [moved] = nextPages.splice(fromIndex, 1);
      nextPages.splice(toIndex, 0, moved);
      return { ...prev, pages: nextPages, currentPageIndex: toIndex };
    });
  };

  // Resize Document
  const resizeDocument = (width: number, height: number, format: DocumentFormat) => {
    pushHistory(doc);
    setDoc((prev) => ({
      ...prev,
      width,
      height,
      format,
    }));
  };

  // Load Template
  const loadTemplate = (template: DesignTemplate) => {
    pushHistory(doc);
    setDoc({
      id: 'doc-' + Date.now(),
      title: template.title,
      format: template.format,
      width: template.width,
      height: template.height,
      pages: JSON.parse(JSON.stringify(template.pages)),
      currentPageIndex: 0,
    });
    setSelectedIds([]);
  };

  // Undo / Redo
  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setFuture((prev) => [doc, ...prev]);
    isInternalHistoryChange.current = true;
    setDoc(previous);
    setHistory(newHistory);
    setSelectedIds([]);
    setTimeout(() => {
      isInternalHistoryChange.current = false;
    }, 50);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev, doc]);
    isInternalHistoryChange.current = true;
    setDoc(next);
    setFuture(newFuture);
    setSelectedIds([]);
    setTimeout(() => {
      isInternalHistoryChange.current = false;
    }, 50);
  };

  // Global Keyboard Shortcuts (Undo, Redo, Delete, Duplicate, Nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const delta = {
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step },
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
          }[e.key] || { x: 0, y: 0 };

          setDoc((prev) => {
            const nextPages = [...prev.pages];
            const page = { ...nextPages[prev.currentPageIndex] };
            page.elements = page.elements.map((el) =>
              selectedIds.includes(el.id) && !el.isLocked
                ? { ...el, x: el.x + delta.x, y: el.y + delta.y }
                : el
            );
            nextPages[prev.currentPageIndex] = page;
            return { ...prev, pages: nextPages };
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, history, future, doc]);

  return (
    <CanvasContext.Provider
      value={{
        doc,
        currentPage,
        selectedIds,
        selectedElement,
        selectedElements,
        zoom,
        pan,
        activeTab,
        sidebarOpen,
        activeTool,
        drawSettings,
        snapGuides,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        isMagicStudioOpen,
        isResizeModalOpen,
        isExportModalOpen,
        isPresenting,
        isPageGridOpen,
        setDocTitle,
        setZoom,
        setPan,
        setActiveTab,
        setSidebarOpen,
        setActiveTool,
        setDrawSettings,
        setSnapGuides,
        setIsMagicStudioOpen,
        setIsResizeModalOpen,
        setIsExportModalOpen,
        setIsPresenting,
        setIsPageGridOpen,
        setCurrentPageIndex: (idx) => setDoc((prev) => ({ ...prev, currentPageIndex: idx })),
        addPage,
        duplicatePage,
        deletePage,
        reorderPages,
        setPageBackground,
        resizeDocument,
        loadTemplate,
        selectElement,
        clearSelection,
        addElement,
        updateElement,
        updateSelectedElements,
        deleteSelected,
        duplicateSelected,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        alignSelected,
        toggleLock,
        undo,
        redo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
