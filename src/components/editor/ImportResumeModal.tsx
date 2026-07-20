import React, { useState, useRef } from 'react';
import { X, UploadCloud, Loader2, FileText, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useResumeStore } from '@/lib/store';
import { extractTextFromPDF } from '@/lib/pdf-extractor';
import { extractResumeData } from '@/lib/ai';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportResumeModal: React.FC<ImportResumeModalProps> = ({ isOpen, onClose }) => {
  const { autoGenerateResume } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [webllmProgress, setWebllmProgress] = useState<{ progress: number, text: string } | null>(null);

  React.useEffect(() => {
    const handleProgress = (e: any) => setWebllmProgress(e.detail);
    if (typeof window !== 'undefined') {
      window.addEventListener('webllm-progress', handleProgress);
      return () => window.removeEventListener('webllm-progress', handleProgress);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setWebllmProgress(null);
      
      const provider = localStorage.getItem('ai_provider') || 'openai';
      const apiKey = localStorage.getItem(`${provider}_key`) || '';
      
      if (!apiKey && provider !== 'ollama' && provider !== 'webllm') {
        throw new Error(`Please configure your ${provider} API key in the AI Generator tool first to use import functionality.`);
      }

      setProgress('Extracting text from PDF...');
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract meaningful text from this PDF. It might be an image-based PDF or scanned document.');
      }

      setProgress('Using AI to analyze and structure your data... This might take a few seconds.');
      const parsedResume = await extractResumeData(extractedText, provider, apiKey);

      if (!parsedResume.personalInfo || !parsedResume.sections) {
        throw new Error('Received malformed response from the AI.');
      }

      // Merge standard missing theme settings if the AI skipped them
      if (!parsedResume.theme) {
        parsedResume.theme = { template: 'modern', accentColor: '#000000', fontSize: 'medium', pageSize: 'A4', typography: { heading: 'large', body: 'medium', caption: 'small' } };
      }

      // Automatically generate new UUIDs internally during autoGenerateResume
      autoGenerateResume(parsedResume);
      onClose();
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.message || 'Failed to import resume.');
    } finally {
      setIsProcessing(false);
      setProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isProcessing && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 glass border border-border/50 rounded-xl shadow-2xl p-6 animate-in fade-in-0 zoom-in-95 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Import Resume / LinkedIn
            </Dialog.Title>
            <Dialog.Close 
              disabled={isProcessing}
              className="rounded-full p-1.5 hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {!isProcessing ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">Click to upload PDF</h3>
                <p className="text-sm text-muted-foreground">
                  LinkedIn profile PDF or existing resume PDF
                </p>
              </div>
              
              <div className="bg-primary/5 text-primary text-sm p-4 rounded-lg border border-primary/20">
                <p>
                  <strong>How to import from LinkedIn:</strong> Go to your LinkedIn profile, click &quot;More&quot;, then &quot;Save to PDF&quot;. Upload that PDF here.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex gap-2 items-start mt-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="w-full">
                <h3 className="font-medium text-foreground mb-1">Processing PDF</h3>
                <p className="text-sm text-muted-foreground animate-pulse mb-3">
                  {progress}
                </p>
                
                {webllmProgress && (
                  <div className="w-full max-w-xs mx-auto mt-4 text-xs opacity-90 text-center">
                    <div className="w-full bg-primary/20 rounded-full h-1.5 mb-2">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${(webllmProgress.progress * 100).toFixed(0)}%` }}></div>
                    </div>
                    <span className="text-muted-foreground">{webllmProgress.text}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf"
            className="hidden" 
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
