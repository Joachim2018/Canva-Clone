import React from 'react';
import { CanvasProvider } from './context/CanvasContext';
import { TopNav } from './components/TopNav';
import { ContextualToolbar } from './components/ContextualToolbar';
import { SidebarDock } from './components/SidebarDock';
import { CanvasStage } from './components/CanvasStage';
import { PageManager } from './components/PageManager';
import { PageGridDrawer } from './components/PageGridDrawer';
import { MagicStudioModal } from './components/MagicStudioModal';
import { ResizeModal } from './components/ResizeModal';
import { ExportModal } from './components/ExportModal';
import { PresentationModal } from './components/PresentationModal';

export default function App() {
  return (
    <CanvasProvider>
      <div className="h-screen w-screen flex flex-col bg-[#0e131f] overflow-hidden select-none font-sans">
        {/* Global Top Bar */}
        <TopNav />

        {/* Dynamic Contextual Toolbar */}
        <ContextualToolbar />

        {/* Central Workspace (Sidebar Dock + Canvas Artboard Stage) */}
        <div className="flex-1 flex overflow-hidden relative">
          <SidebarDock />
          <CanvasStage />
          <PageGridDrawer />
        </div>

        {/* Bottom Page Control Bar */}
        <PageManager />

        {/* Modals & Overlays */}
        <MagicStudioModal />
        <ResizeModal />
        <ExportModal />
        <PresentationModal />
      </div>
    </CanvasProvider>
  );
}
