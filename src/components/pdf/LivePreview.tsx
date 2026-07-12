'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import type { ResumeData } from '@/lib/schema';
import { PreviewCanvas } from './PreviewCanvas';

interface LivePreviewProps {
  data: ResumeData;
  className?: string;
  resumeRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ data, className, resumeRef }) => {
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const localResumeRef = useRef<HTMLDivElement | null>(null);
  const actualResumeRef = resumeRef || localResumeRef;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageHeightPx = 1123; // A4 height at 96 DPI

  // Panning state
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Calculate page breaks based on the rendered content height
  useEffect(() => {
    if (actualResumeRef?.current) {
      const contentHeight = actualResumeRef.current.scrollHeight;
      // Add a 10px tolerance to prevent sub-pixel/border rounding from triggering a whole new page
      const pages = Math.max(1, Math.ceil((contentHeight - 10) / pageHeightPx));
      setPageCount(pages);
      if (currentPage >= pages) {
        setCurrentPage(Math.max(0, pages - 1));
      }
    }
  }, [data, currentPage, actualResumeRef]);

  // Scroll to current page
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: currentPage * pageHeightPx * zoom,
        behavior: 'smooth'
      });
    }
  }, [currentPage, zoom, pageHeightPx]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  // Mouse handlers for panning
  const onMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode || !containerRef.current || e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.pageX - containerRef.current.offsetLeft,
      y: e.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    });
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isPanMode || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - dragStart.x) * 1.5;
    const walkY = (y - dragStart.y) * 1.5;
    containerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    containerRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  return (
    <div className={`flex flex-col h-full bg-muted/30 overflow-hidden relative ${className || ''}`}>
      {/* Zoom Controls & Page Info */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-4 bg-background/95 backdrop-blur-sm border shadow-sm rounded-md px-2 py-1.5">
        <div className="flex items-center gap-1 border-r pr-3 mr-1">
          <button
            type="button"
            onClick={() => setIsPanMode(!isPanMode)}
            className={`p-1.5 rounded-md transition-colors ${isPanMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            title="Toggle Pan Tool"
          >
            <Hand className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-1.5 rounded-none text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="p-1.5 rounded-none text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={zoom === 1}
            className="p-1.5 rounded-none text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Page Navigation */}
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-muted rounded-none transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground">
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

        <div className="flex items-center gap-1 text-muted-foreground">
          <Move className="w-3 h-3" />
          <span className="text-[10px]">1:1 render lock</span>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 w-full"
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
        <div 
          className="preview-wrapper mx-auto border border-border shadow-sm bg-white"
          style={{ 
            zoom: zoom, 
            transition: 'zoom 0.2s ease-in-out',
            pointerEvents: isPanMode ? 'none' : 'auto' // Prevent native drag on links/images
          }}
        >
          <PreviewCanvas data={data} resumeRef={actualResumeRef} />
        </div>
      </div>
    </div>
  );
};
