import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'alert' | 'confirm';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type = 'alert',
  onConfirm,
  onCancel,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            onClick={onCancel || onConfirm}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 text-muted-foreground whitespace-pre-line">
          {message}
        </div>
        <div className="flex items-center justify-end gap-3 p-4 bg-muted/50 border-t border-border">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-primary-foreground transition-colors",
              type === 'confirm' ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
            )}
          >
            {type === 'confirm' ? 'Continue' : 'OK'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
