import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Target } from 'lucide-react';
import { calculateAtsScore, AtsScore } from '@/lib/ats-checker';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AtsScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtsScoreModal: React.FC<AtsScoreModalProps> = ({ isOpen, onClose }) => {
  const { data } = useResumeStore();
  const [result, setResult] = useState<AtsScore | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(calculateAtsScore(data));
    }
  }, [isOpen, data]);

  if (!isOpen || !result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (result.score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">ATS Score Checker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Left: Score Circle */}
          <div className="flex flex-col items-center justify-start flex-shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center mb-1">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r="44"
                  fill="transparent"
                  className="stroke-muted"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r="44"
                  fill="transparent"
                  className={cn("transition-all duration-1000 ease-out", getScoreRingColor(result.score))}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={cn("text-4xl font-black", getScoreColor(result.score))}>
                  {result.score}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">
              out of 100
            </div>
            
            <div className="text-center max-w-[200px]">
              {result.score >= 80 && <p className="text-sm font-medium text-green-600 dark:text-green-400">Excellent! Your resume is highly ATS-optimized.</p>}
              {result.score >= 50 && result.score < 80 && <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Good, but could use some optimization.</p>}
              {result.score < 50 && <p className="text-sm font-medium text-red-600 dark:text-red-400">Needs work. ATS systems might struggle to parse your impact.</p>}
            </div>
          </div>

          {/* Right: Feedback List */}
          <div className="flex-1 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">Analysis Results</h3>
            <div className="space-y-3">
              {result.feedback.map((item, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {item.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 text-muted-foreground leading-relaxed">
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-medium text-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
