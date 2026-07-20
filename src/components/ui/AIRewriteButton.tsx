import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rewriteBulletPoint } from '@/lib/ai';
import { useResumeStore } from '@/lib/store';

interface AIRewriteButtonProps {
  text: string;
  context: string; // e.g., "Software Engineer at Google"
  onRewrite: (newText: string) => void;
  className?: string;
}

export const AIRewriteButton: React.FC<AIRewriteButtonProps> = ({
  text,
  context,
  onRewrite,
  className
}) => {
  const { data: resumeData } = useResumeStore();
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webllmProgress, setWebllmProgress] = useState<{ progress: number, text: string } | null>(null);

  React.useEffect(() => {
    const handleProgress = (e: any) => setWebllmProgress(e.detail);
    if (typeof window !== 'undefined') {
      window.addEventListener('webllm-progress', handleProgress);
      return () => window.removeEventListener('webllm-progress', handleProgress);
    }
  }, []);

  const handleRewrite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setIsRewriting(true);
      setError(null);
      
      const provider = localStorage.getItem('ai_provider') || 'openai';
      const apiKey = localStorage.getItem(`${provider}_key`) || '';
      
      if (!apiKey && provider !== 'ollama' && provider !== 'webllm') {
        throw new Error(`Please configure your ${provider} API key in the AI Generator tool first.`);
      }

      const newText = await rewriteBulletPoint(text, context, provider, apiKey, resumeData);
      if (newText) {
        onRewrite(newText);
      }
    } catch (err: any) {
      console.error('Failed to rewrite bullet point:', err);
      setError(err.message || 'Failed to rewrite text.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsRewriting(false);
      setWebllmProgress(null);
    }
  };

  if (!text.trim()) return null;

  const provider = typeof window !== 'undefined' ? localStorage.getItem('ai_provider') : 'openai';

  return (
    <div className={cn("relative flex items-center", className)}>
      <button
        type="button"
        onClick={handleRewrite}
        disabled={isRewriting}
        className={cn(
          "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all border",
          isRewriting 
            ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed" 
            : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30"
        )}
        title="Rewrite with AI (adds action verbs and quantifiers)"
      >
        {isRewriting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        {isRewriting && provider === 'webllm' && webllmProgress && webllmProgress.progress < 1 
          ? `Loading Model... ${(webllmProgress.progress * 100).toFixed(0)}%` 
          : isRewriting ? 'Rewriting...' : 'AI Rewrite'}
      </button>
      {error && (
        <div className="absolute top-full mt-1 right-0 z-50 min-w-[200px] max-w-[300px] text-[10px] text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-1.5 rounded shadow-sm text-left">
          {error}
        </div>
      )}
    </div>
  );
};
