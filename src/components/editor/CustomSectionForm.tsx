'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Link as LinkIcon,
  Calendar,
  Type,
  AlignLeft,
  Tag,
  GripVertical,
  Settings2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  Section,
  SectionItem,
  CustomFieldDefinition,
  CustomFieldType,
  CUSTOM_FIELD_TYPES,
  CUSTOM_FIELD_TEMPLATES,
} from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea } from './FormInput';
import { cn } from '@/lib/utils';

interface CustomSectionFormProps {
  section: Section;
  showLink?: boolean;
}

// Field type icons and labels
const FIELD_TYPE_INFO: Record<CustomFieldType, { icon: React.FC<{ className?: string }>; label: string }> = {
  text: { icon: Type, label: 'Text' },
  textarea: { icon: AlignLeft, label: 'Long Text' },
  date: { icon: Calendar, label: 'Date' },
  dateRange: { icon: Calendar, label: 'Date Range' },
  link: { icon: LinkIcon, label: 'Link' },
  tags: { icon: Tag, label: 'Tags / Bubbles' },
};

// Template names
const TEMPLATE_NAMES: Record<keyof typeof CUSTOM_FIELD_TEMPLATES, string> = {
  basic: 'Basic',
  project: 'Project',
  certification: 'Certification',
  publication: 'Publication',
  award: 'Award',
  volunteer: 'Volunteer',
};

// Field Editor Component
const FieldEditor: React.FC<{
  field: CustomFieldDefinition;
  sectionId: string;
  onRemove: () => void;
}> = ({ field, sectionId, onRemove }) => {
  const { updateFieldDefinition } = useResumeStore();
  const IconComponent = FIELD_TYPE_INFO[field.type].icon;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-none border border-border">
      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
      <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        value={field.label}
        onChange={(e) => updateFieldDefinition(sectionId, field.id, { label: e.target.value })}
        className="flex-1 min-w-0 text-sm bg-transparent border-none outline-none"
        placeholder="Field label"
      />
      <select
        value={field.type}
        onChange={(e) => updateFieldDefinition(sectionId, field.id, { type: e.target.value as CustomFieldType })}
        className="text-xs bg-background border border-border rounded-none px-2 py-1 flex-shrink-0 max-w-[100px]"
      >
        {CUSTOM_FIELD_TYPES.map((type) => (
          <option key={type} value={type}>
            {FIELD_TYPE_INFO[type].label}
          </option>
        ))}
      </select>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-destructive/10 rounded-none text-destructive transition-colors flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// Tag Input Component
const TagInput: React.FC<{
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-none bg-background min-h-[38px]">
      {value.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs bg-muted text-foreground border border-border"
        >
          {tag}
          <button
            onClick={() => removeTag(idx)}
            className="hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[100px] text-sm bg-transparent border-none outline-none"
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
};

// Custom Field Renderer
const CustomFieldRenderer: React.FC<{
  field: CustomFieldDefinition;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
      return (
        <FormInput
          label={field.label}
          placeholder={field.placeholder || field.label}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <FormTextarea
          label={field.label}
          placeholder={field.placeholder || field.label}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          showBulletHelper
        />
      );

    case 'date':
      return (
        <FormInput
          type="month"
          label={field.label}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'dateRange':
      const [start, end] = ((value as string) || '|').split('|');
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
          <div className="flex items-center gap-2">
            <FormInput
              type="month"
              placeholder="Start"
              value={start || ''}
              onChange={(e) => onChange(`${e.target.value}|${end || ''}`)}
              className="flex-1"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <FormInput
              type="month"
              placeholder="End"
              value={end || ''}
              onChange={(e) => onChange(`${start || ''}|${e.target.value}`)}
              className="flex-1"
            />
          </div>
        </div>
      );

    case 'link':
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <input
              type="url"
              placeholder={field.placeholder || 'https://...'}
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-none bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      );

    case 'tags':
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
          <TagInput
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            placeholder={field.placeholder || 'Type and press Enter'}
          />
        </div>
      );

    default:
      return null;
  }
};

// Template Dropdown Component
const TemplateDropdown: React.FC<{
  onSelect: (template: keyof typeof CUSTOM_FIELD_TEMPLATES) => void;
}> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(240);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding);
    const spaceAbove = Math.max(0, rect.top - viewportPadding);

    const desiredMenuHeight = 220;
    const shouldOpenUpward = spaceBelow < desiredMenuHeight && spaceAbove > spaceBelow;

    setOpenUpward(shouldOpenUpward);
    setMaxMenuHeight(Math.max(140, shouldOpenUpward ? spaceAbove : spaceBelow));
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-2 py-1 rounded-none border border-border hover:bg-muted transition-colors flex items-center gap-1"
      >
        Use Template
        {openUpward && isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 bg-background border border-border rounded-none shadow-sm py-1 z-50 min-w-[160px] overflow-y-auto overscroll-contain',
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
          style={{ maxHeight: maxMenuHeight }}
        >
          {Object.entries(TEMPLATE_NAMES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onSelect(key as keyof typeof CUSTOM_FIELD_TEMPLATES);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CustomSectionForm: React.FC<CustomSectionFormProps> = ({ section }) => {
  const {
    addSectionItem,
    removeSectionItem,
    updateCustomFieldValue,
    addFieldDefinition,
    removeFieldDefinition,
    updateSection,
  } = useResumeStore();

  const [showFieldConfig, setShowFieldConfig] = useState(false);

  const fieldDefinitions = section.fieldDefinitions || [];

  // Get field value for an item
  const getFieldValue = (item: SectionItem, fieldId: string): string | string[] => {
    const field = (item.customFields || []).find((cf) => cf.fieldId === fieldId);
    return field?.value ?? '';
  };

  // Apply template
  const applyTemplate = (templateKey: keyof typeof CUSTOM_FIELD_TEMPLATES) => {
    const template = CUSTOM_FIELD_TEMPLATES[templateKey];
    const newFields = template.map((f) => ({
      ...f,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    updateSection(section.id, {
      fieldDefinitions: newFields,
      items: [],
    });
  };

  const borderClass = 'border-amber-500/30';
  const buttonClass = 'text-amber-600 hover:text-amber-700';

  return (
    <div className="space-y-4">
      {/* Field Configuration Panel */}
      <div className="border border-border rounded-none">
        <button
          onClick={() => setShowFieldConfig(!showFieldConfig)}
          className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Configure Fields</span>
            <span className="text-xs text-muted-foreground">
              ({fieldDefinitions.length} fields)
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              showFieldConfig && 'rotate-180'
            )}
          />
        </button>

        {showFieldConfig && (
          <div className="p-3 space-y-3 border-t border-border">
            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Quick setup:</span>
              <TemplateDropdown onSelect={applyTemplate} />
            </div>

            {/* Field List */}
            <div className="space-y-2">
              {fieldDefinitions.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  sectionId={section.id}
                  onRemove={() => removeFieldDefinition(section.id, field.id)}
                />
              ))}
            </div>

            {/* Add Field Button */}
            <button
              onClick={() =>
                addFieldDefinition(section.id, {
                  type: 'text',
                  label: 'New Field',
                })
              }
              className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Field
            </button>
          </div>
        )}
      </div>

      {/* Section Items */}
      {section.items.map((item) => (
        <div
          key={item.id}
          className={cn('border-l-2 pl-4 space-y-3 py-2', borderClass)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              {fieldDefinitions.map((field) => (
                <CustomFieldRenderer
                  key={field.id}
                  field={field}
                  value={getFieldValue(item, field.id)}
                  onChange={(value) =>
                    updateCustomFieldValue(section.id, item.id, field.id, value)
                  }
                />
              ))}

              {fieldDefinitions.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Configure fields above to start adding content.
                </p>
              )}
            </div>

            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="p-2 hover:bg-destructive/10 rounded-none transition-colors text-destructive ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <button
        onClick={() => addSectionItem(section.id)}
        className={cn(
          'text-sm flex items-center gap-2 transition-colors',
          buttonClass
        )}
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
};

export default CustomSectionForm;
