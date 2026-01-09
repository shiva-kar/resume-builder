'use client';

import React from 'react';
import { List } from 'lucide-react';
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
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ label, error, autoResize = true, showBulletHelper = true, className, onChange, value, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
    onChange?.(e);
  };

  const addBullet = () => {
    const currentValue = (value as string) || '';
    const newValue = currentValue + (currentValue.length > 0 && !currentValue.endsWith('\n') ? '\n ' : ' ');
    const syntheticEvent = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange?.(syntheticEvent);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        {label && (
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        {showBulletHelper && (
          <button
            type="button"
            onClick={addBullet}
            className={cn(
              'text-xs flex items-center gap-1',
              'text-muted-foreground hover:text-foreground',
              'transition-colors font-medium'
            )}
          >
            <List className="w-3 h-3" />
            Add Bullet
          </button>
        )}
      </div>
      <textarea
        ref={ref}
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
