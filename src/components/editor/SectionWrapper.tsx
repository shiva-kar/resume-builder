'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';
import { Section, TextSize, SectionTypeFontSize } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useResumeStore } from '@/lib/store';

interface SectionWrapperProps {
  section: Section;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const FONT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'base', label: 'MD' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
];

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  section,
  children,
  icon,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);

  const { toggleSectionVisibility, removeSection, updateSection, updateSectionFontSize } =
    useResumeStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass rounded-none bento-card overflow-hidden',
        isDragging && 'opacity-50'
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1 rounded-none hover:bg-muted"
            aria-label="Drag to reorder section"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-primary">{icon}</div>

          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-none px-2 py-1 flex-1 min-w-0"
            placeholder="Section Title"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              'p-2 rounded-none transition-colors',
              showSettings
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground'
            )}
            title="Font size settings"
            aria-label="Toggle font size settings"
            aria-expanded={showSettings}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSectionVisibility(section.id)}
            className={cn(
              'p-2 rounded-none transition-colors',
              section.isVisible
                ? 'text-primary hover:bg-primary/10'
                : 'text-muted-foreground hover:bg-muted'
            )}
            title={section.isVisible ? 'Hide section' : 'Show section'}
            aria-label={section.isVisible ? 'Hide section from preview' : 'Show section in preview'}
            aria-pressed={section.isVisible}
          >
            {section.isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => removeSection(section.id)}
            className="p-2 hover:bg-destructive/10 rounded-none transition-colors text-destructive"
            title="Remove section"
            aria-label="Remove this section"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-muted rounded-none transition-colors text-muted-foreground"
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Font Size Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-muted border-b border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Section Font Sizes
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(['heading', 'subheading', 'body'] as const).map((type) => (
              <div key={type} className="space-y-1">
                <label className="text-xs text-muted-foreground capitalize">
                  {type}
                </label>
                <select
                  value={section.fontSize?.[type] || 'base'}
                  onChange={(e) =>
                    updateSectionFontSize(section.id, type, e.target.value as TextSize)
                  }
                  className="w-full px-2 py-1.5 text-xs border border-border rounded-none bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Content */}
      {isExpanded && section.isVisible && (
        <div className="p-4">{children}</div>
      )}

      {/* Collapsed State Indicator */}
      {(!isExpanded || !section.isVisible) && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {!section.isVisible
            ? 'Section hidden from preview'
            : `${section.items.length} item${section.items.length !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
};

export default SectionWrapper;
