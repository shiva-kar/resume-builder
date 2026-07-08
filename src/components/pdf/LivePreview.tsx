'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ResumeData } from '@/lib/schema';
import { PreviewCanvas } from './PreviewCanvas';

interface LivePreviewProps {
  data: ResumeData;
  className?: string;
  resumeRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ data, className, resumeRef }) => {
  // Zoom state (locked to 100% to ensure identical export rendering)
  const zoom = 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const localResumeRef = useRef<HTMLDivElement | null>(null);
  const actualResumeRef = resumeRef || localResumeRef;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageHeightPx = 842;

  // Calculate page breaks based on the rendered content height
  useEffect(() => {
    if (actualResumeRef?.current) {
      const contentHeight = actualResumeRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(contentHeight / pageHeightPx));
      setPageCount(pages);
      if (currentPage >= pages) {
        setCurrentPage(Math.max(0, pages - 1));
      }
    }
  }, [data, currentPage, actualResumeRef]);

  const handleZoomIn = () => undefined;
  const handleZoomOut = () => undefined;
  const handleReset = () => undefined;

  return (
    <div className={`flex flex-col h-full bg-muted/30 overflow-hidden relative ${className || ''}`}>
      {/* Zoom Controls & Page Info */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-4 bg-white/90 backdrop-blur-sm border shadow-sm rounded-md px-2 py-1.5">
        <div className="flex items-center gap-1 border-r pr-3 mr-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed"
            title="Zoom is locked to 100% for export consistency"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed"
            title="Zoom is locked to 100% for export consistency"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed ml-1"
            title="View is already reset"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
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
      >
        <div className="preview-wrapper mx-auto border border-border shadow-sm bg-white">
          <PreviewCanvas data={data} resumeRef={actualResumeRef} />
        </div>
      </div>
    </div>
  );
};
