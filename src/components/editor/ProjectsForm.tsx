'use client';

import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea, FormCheckbox } from './FormInput';
import { MonthPicker } from '@/components/ui/MonthPicker';

interface ProjectsFormProps {
  section: Section;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();

  const handleAddTag = (sectionId: string, itemId: string, currentTags: string[], newTag: string) => {
    if (!newTag.trim()) return;
    updateSectionItem(sectionId, itemId, {
      skills: [...currentTags, newTag.trim()]
    });
  };

  const handleRemoveTag = (sectionId: string, itemId: string, currentTags: string[], indexToRemove: number) => {
    updateSectionItem(sectionId, itemId, {
      skills: currentTags.filter((_, i) => i !== indexToRemove)
    });
  };

  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="border-l-2 border-indigo-500/30 pl-4 space-y-3 py-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  placeholder="Project Name (e.g. E-Commerce Platform)"
                  value={item.title || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      title: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="Project URL (e.g. https://github.com/my-project)"
                  value={item.subtitle || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      subtitle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MonthPicker
                  value={item.startDate || ''}
                  onChange={(val) => updateSectionItem(section.id, item.id, { startDate: val })}
                  placeholder="Start Date"
                />
                <MonthPicker
                  value={item.endDate || ''}
                  onChange={(val) => updateSectionItem(section.id, item.id, { endDate: val })}
                  placeholder="End Date"
                  disabled={item.current}
                />
                <div className="col-span-2">
                  <FormCheckbox
                    label="Currently working on this"
                    checked={item.current || false}
                    onChange={(e) =>
                      updateSectionItem(section.id, item.id, {
                        current: e.target.checked,
                        ...(e.target.checked ? { endDate: '' } : {})
                      })
                    }
                  />
                </div>
              </div>

              {/* Technologies / Skills as Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(item.skills || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(section.id, item.id, item.skills || [], index)}
                        className="hover:text-destructive focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add technology (e.g. React, Node.js) and press Enter..."
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(section.id, item.id, item.skills || [], e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                </div>
                <FormTextarea
                  placeholder="Describe your contributions, architecture, and impact... (Supports Markdown)"
                  value={item.description || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  showBulletHelper
                />
              </div>
            </div>
            
            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Remove project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addSectionItem(section.id)}
        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors border border-dashed border-border"
      >
        <Plus className="w-4 h-4" />
        Add Project
      </button>
    </div>
  );
};
