'use client';

import React, { useRef, useCallback } from 'react';
import { List, Bold, Italic, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-border rounded-none',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'placeholder:text-muted-foreground/50',
            'transition-colors',
            error && 'border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
  showBulletHelper?: boolean;
  showRichTextToolbar?: boolean;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ label, error, autoResize = true, showBulletHelper = true, showRichTextToolbar = true, className, onChange, value, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Combine refs
  const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
    onChange?.(e);
  };

  // Get selection info from textarea
  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: '' };
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
  };

  // Update value and preserve cursor position
  const updateValue = (newValue: string, cursorPos?: number) => {
    const syntheticEvent = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange?.(syntheticEvent);

    // Restore cursor position after state update
    if (cursorPos !== undefined) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Insert bullet point
  const addBullet = () => {
    const currentValue = (value as string) || '';
    const { start, end } = getSelection();

    // Find the start of the current line
    const beforeCursor = currentValue.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = currentValue.substring(lineStart, start);

    // Check if we're at the start of a line or current line is empty
    const isAtLineStart = start === lineStart || currentLine.trim() === '';

    let newValue: string;
    let newCursorPos: number;

    if (isAtLineStart) {
      // Insert bullet at current position
      const bulletText = '• ';
      newValue = currentValue.substring(0, start) + bulletText + currentValue.substring(end);
      newCursorPos = start + bulletText.length;
    } else {
      // Insert new line with bullet
      const bulletText = '\n• ';
      newValue = currentValue.substring(0, end) + bulletText + currentValue.substring(end);
      newCursorPos = end + bulletText.length;
    }

    updateValue(newValue, newCursorPos);
  };

  // Wrap selected text with formatting markers
  const wrapSelection = (prefix: string, suffix: string) => {
    const currentValue = (value as string) || '';
    const { start, end, text } = getSelection();

    if (text) {
      // Wrap selected text
      const newValue = currentValue.substring(0, start) + prefix + text + suffix + currentValue.substring(end);
      updateValue(newValue, end + prefix.length + suffix.length);
    } else {
      // Insert markers and place cursor between them
      const newValue = currentValue.substring(0, start) + prefix + suffix + currentValue.substring(end);
      updateValue(newValue, start + prefix.length);
    }
  };

  // Add bold formatting
  const addBold = () => {
    wrapSelection('**', '**');
  };

  // Add italic formatting
  const addItalic = () => {
    wrapSelection('_', '_');
  };

  // Add header formatting
  const addHeader = () => {
    const currentValue = (value as string) || '';
    const { start } = getSelection();

    // Find the start of the current line
    const beforeCursor = currentValue.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;

    // Insert ## at the start of the line
    const newValue = currentValue.substring(0, lineStart) + '## ' + currentValue.substring(lineStart);
    updateValue(newValue, start + 3);
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ onClick, icon, label }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'p-1 rounded hover:bg-muted transition-colors',
        'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
    </button>
  );

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        {label && (
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        {(showBulletHelper || showRichTextToolbar) && (
          <div className="flex items-center gap-0.5 bg-muted/30 rounded px-1 py-0.5">
            {showRichTextToolbar && (
              <>
                <ToolbarButton onClick={addBold} icon={<Bold className="w-3.5 h-3.5" />} label="Bold (**text**)" />
                <ToolbarButton onClick={addItalic} icon={<Italic className="w-3.5 h-3.5" />} label="Italic (_text_)" />
                <ToolbarButton onClick={addHeader} icon={<Type className="w-3.5 h-3.5" />} label="Header (## text)" />
                <div className="w-px h-4 bg-border mx-1" />
              </>
            )}
            {showBulletHelper && (
              <button
                type="button"
                onClick={addBullet}
                className={cn(
                  'text-xs flex items-center gap-1 px-1.5 py-0.5 rounded',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'transition-colors font-medium'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bullet</span>
              </button>
            )}
          </div>
        )}
      </div>
      <textarea
        ref={setRefs}
        value={value}
        className={cn(
          'w-full px-3 py-2 border border-border rounded-none',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-muted-foreground/50',
          'transition-colors resize-none',
          error && 'border-destructive focus:ring-destructive/20',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-border rounded-none',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors',
            error && 'border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'w-4 h-4 rounded-none border-border',
            'text-primary focus:ring-primary/20',
            className
          )}
          {...props}
        />
        <span className="text-sm text-muted-foreground">{label}</span>
      </label>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormInput;
