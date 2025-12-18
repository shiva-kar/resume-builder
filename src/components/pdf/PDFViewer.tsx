'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { ResumePDFDocument } from './ResumePDF';
import { ResumeData, PAGE_SIZES } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PDFViewerProps {
  data: ResumeData;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ data, className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const document = useMemo(() => <ResumePDFDocument data={data} />, [data]);
  const [instance, updateInstance] = usePDF({ document });

  // Update PDF when data changes
  useEffect(() => {
    updateInstance(document);
  }, [document, updateInstance]);

  const aspectRatio = useMemo(() => {
    const size = PAGE_SIZES[data.theme.pageSize];
    return size.width / size.height;
  }, [data.theme.pageSize]);

  if (!mounted) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (instance.loading) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50', className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (instance.error) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50', className)}>
        <p className="text-sm text-destructive">Error generating PDF preview</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full overflow-auto bg-muted/30 p-4', className)}>
      <div 
        className="mx-auto bg-white shadow-2xl"
        style={{
          width: '100%',
          maxWidth: '595px', // A4 width in pixels at 72 DPI
          aspectRatio: aspectRatio,
        }}
      >
        {instance.url && (
          <iframe
            src={instance.url}
            className="w-full h-full border-0"
            title="Resume Preview"
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
