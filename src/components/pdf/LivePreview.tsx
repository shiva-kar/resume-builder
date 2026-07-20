'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { useResumeStore } from '@/lib/store';
import { ResumeData } from '@/lib/schema';
import { PAPER_SIZES, PaperSize } from '@/lib/paperSizes';
import { PreviewCanvas } from './PreviewCanvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface LivePreviewProps {
  data: ResumeData;
  className?: string;
  resumeRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ data, className, resumeRef }) => {
  const updateTheme = useResumeStore(state => state.updateTheme);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const localResumeRef = useRef<HTMLDivElement | null>(null);
  const actualResumeRef = resumeRef || localResumeRef;

  // Paper Dimensions
  const paperSize = data.theme.pageSize || 'A4';
  const dimensions = PAPER_SIZES[paperSize as PaperSize];
  const pageWidthPx = dimensions.width;
  const pageHeightPx = dimensions.height;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  
  // Spacer map: breakableId -> spacer height in px
  const [spacerMap, setSpacerMap] = useState<Record<string, number>>({});

  // Panning state
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Ref for the hidden measurement canvas
  const measureRef = useRef<HTMLDivElement>(null);

  // Dynamic DOM Pagination Engine
  // Measures the hidden canvas and produces a spacerMap that all visible canvases can use
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    
    // 1. Reset all spacers to 0 on the measurement canvas
    const spacers = Array.from(root.querySelectorAll('.page-spacer')) as HTMLElement[];
    spacers.forEach(s => { s.style.height = '0px'; });
    
    // Force reflow so measurements reflect the flat layout
    void root.offsetHeight;

    // 2. Measure and compute spacer heights
    const newSpacerMap: Record<string, number> = {};
    const containers = Array.from(root.querySelectorAll('.page-breakable-container')) as HTMLElement[];
    
    for (const container of containers) {
       const content = container.querySelector('.page-breakable-content') as HTMLElement;
       const spacer = container.querySelector('.page-spacer') as HTMLElement;
       if (!content || !spacer) continue;
       
       const breakableId = content.getAttribute('data-breakable-id');
       if (!breakableId) continue;
       
       const rect = content.getBoundingClientRect();
       const parentRect = root.getBoundingClientRect();
       
       const top = rect.top - parentRect.top;
       const bottom = top + rect.height;
       
       const pageOfTop = Math.floor(top / pageHeightPx);
       const pageOfBottom = Math.floor((bottom - 1) / pageHeightPx);
       
       // If element straddles a page boundary, break it to the next page
       if (pageOfBottom > pageOfTop && (bottom - (pageOfBottom * pageHeightPx)) > 0) {
          const nextPageStart = (pageOfTop + 1) * pageHeightPx;
          // Add a 40px buffer so the element isn't sliced exactly at the page boundary
          const spacerHeight = nextPageStart - top + 40;
          newSpacerMap[breakableId] = spacerHeight;
          // Apply it immediately to the measurement canvas so subsequent elements measure correctly
          spacer.style.height = `${spacerHeight}px`;
       }
    }
    
    // 3. Only update state if values actually changed (prevents infinite re-render loop)
    const newContentHeight = root.scrollHeight;
    const newPages = Math.max(1, Math.ceil((newContentHeight - 2) / pageHeightPx));
    
    if (newPages !== pageCount) {
      setPageCount(newPages);
    }
    
    const spacerMapStr = JSON.stringify(newSpacerMap);
    const prevSpacerMapStr = JSON.stringify(spacerMap);
    if (spacerMapStr !== prevSpacerMapStr) {
      setSpacerMap(newSpacerMap);
    }
    
    if (currentPage >= newPages) {
      setCurrentPage(Math.max(0, newPages - 1));
    }
  });

  // Set the export ref from the measurement canvas
  useEffect(() => {
    if (actualResumeRef && measureRef.current) {
      const exportNode = measureRef.current.querySelector('#resume-pdf-export-container') as HTMLDivElement | null;
      if (exportNode) {
        actualResumeRef.current = exportNode;
      }
    }
  });

  const isMobileScale = containerWidth > 0 && containerWidth < pageWidthPx + 64;
  const baseScale = isMobileScale ? (containerWidth - 32) / pageWidthPx : 1;
  const effectiveZoom = baseScale * zoom;

  // Track container width for responsive scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setContainerWidth(width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll to current page
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: currentPage * pageHeightPx * effectiveZoom,
        behavior: 'smooth'
      });
    }
  }, [currentPage, effectiveZoom, pageHeightPx]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  // Mouse handlers for panning
  const onMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode || !containerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const onMouseUp = () => { setIsDragging(false); };
  const onMouseLeave = () => { setIsDragging(false); };

  const handlePaperSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTheme({ pageSize: e.target.value as PaperSize });
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border shrink-0 overflow-x-auto no-scrollbar" style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        {/* Hand Tool */}
        <button 
          onClick={() => setIsPanMode(!isPanMode)}
          className={`shrink-0 p-1.5 rounded-none transition-colors ${isPanMode ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
          title="Hand Tool (Pan)"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="shrink-0 flex items-center gap-1.5 border-l border-border pl-3">
          <button onClick={handleZoomOut} className="p-1 hover:bg-muted rounded-none transition-colors">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground min-w-[35px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-muted rounded-none transition-colors">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={handleReset} className="p-1 hover:bg-muted rounded-none transition-colors ml-1" title="Reset zoom">
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Paper Size Selector */}
        <div className="shrink-0 flex items-center gap-2 border-l border-border pl-3">
          <Select 
            value={paperSize}
            onValueChange={(value) => handlePaperSizeChange({ target: { value } } as any)}
          >
            <SelectTrigger className="text-xs bg-muted text-muted-foreground rounded px-2 py-1 h-7 border border-border cursor-pointer min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PAPER_SIZES).map(size => (
                <SelectItem key={size} value={size}>
                  {PAPER_SIZES[size as PaperSize].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        {pageCount > 1 && (
          <div className="shrink-0 flex items-center gap-2 border-l border-border pl-3">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-muted rounded-none transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
              disabled={currentPage >= pageCount - 1}
              className="p-1 hover:bg-muted rounded-none transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="shrink-0 hidden sm:flex items-center gap-1 text-muted-foreground ml-auto border-l border-border pl-3">
          <Move className="w-3 h-3" />
          <span className="text-[10px] whitespace-nowrap">1:1 render lock</span>
        </div>
      </div>

      {/* Hidden Measurement Canvas — positioned offscreen for pagination measurement and PDF export */}
      <div 
        style={{ position: 'fixed', top: 0, left: '-9999px', pointerEvents: 'none', zIndex: -100 }}
      >
        <div ref={measureRef}>
          <PreviewCanvas data={data} resumeRef={actualResumeRef} />
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 md:p-8 w-full bg-slate-50 relative"
        style={{ 
          cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'auto',
          userSelect: isPanMode ? 'none' : 'auto',
          WebkitUserSelect: isPanMode ? 'none' : 'auto'
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {/* Inner wrapper for centering without left-clipping */}
        <div className="w-max min-w-full min-h-full flex flex-col gap-8" style={{ alignItems: 'safe center' as any }}>
          <div className="flex flex-col gap-8 mx-auto">
            {/* Visual Pages — each renders its own PreviewCanvas with spacerMap prop */}
          {Array.from({ length: pageCount }).map((_, i) => (
            <div 
              key={i}
              className="bg-white relative shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-300"
              style={{ 
                width: pageWidthPx * effectiveZoom,
                height: pageHeightPx * effectiveZoom,
                transition: 'width 0.2s ease-out, height 0.2s ease-out',
                pointerEvents: isPanMode ? 'none' : 'auto',
                flexShrink: 0, // Prevents flexbox from squishing the pages
              }}
            >
              <div 
                className="absolute top-0 left-0 overflow-hidden bg-white"
                style={{ 
                  width: pageWidthPx,
                  height: pageHeightPx,
                  transform: `scale(${effectiveZoom})`,
                  transformOrigin: 'top left',
                }}
              >
                <div 
                  className="absolute top-0 left-0 w-full" 
                  style={{ transform: `translateY(-${i * pageHeightPx}px)` }}
                >
                <PreviewCanvas data={data} spacerMap={spacerMap} minHeight={pageCount * pageHeightPx} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};
