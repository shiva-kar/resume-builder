'use client';

import React, { useState } from 'react';
import { Trash2, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Section, SectionItem } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea } from './FormInput';
import { enhanceWithAI } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface EducationFormProps {
  section: Section;
}

export const EducationForm: React.FC<EducationFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const handleEnhance = async (item: SectionItem) => {
    if (!item.description) return;
    setEnhancingId(item.id);
    try {
      const result = await enhanceWithAI({
        text: item.description,
        type: 'education',
      });
      updateSectionItem(section.id, item.id, { description: result.enhanced });
    } catch (error) {
      console.error('AI enhancement failed:', error);
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="border-l-2 border-emerald-500/30 pl-4 space-y-3 py-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  placeholder="Institution Name"
                  value={item.institution || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      institution: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="Degree / Field of Study"
                  value={item.degree || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      degree: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                <FormInput
                  type="month"
                  placeholder="Start Date"
                  value={item.startDate || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      startDate: e.target.value,
                    })
                  }
                  className="w-auto"
                />
                <span className="text-muted-foreground">to</span>
                <FormInput
                  type="month"
                  placeholder="End Date"
                  value={item.endDate || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      endDate: e.target.value,
                    })
                  }
                  className="w-auto"
                />
              </div>

              <div className="relative">
                <FormTextarea
                  placeholder="Additional details (GPA, honors, relevant coursework...)"
                  value={item.description || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
                <button
                  onClick={() => handleEnhance(item)}
                  disabled={enhancingId === item.id || !item.description}
                  className={cn(
                    'absolute top-2 right-2 px-3 py-1.5 rounded-lg',
                    'bg-gradient-to-r from-violet-500 to-indigo-500',
                    'text-white text-xs font-medium',
                    'flex items-center gap-1.5 transition-all',
                    'hover:from-violet-600 hover:to-indigo-600',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'shadow-sm hover:shadow-md'
                  )}
                >
                  {enhancingId === item.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>AI Enhance</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addSectionItem(section.id)}
        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </button>
    </div>
  );
};

export default EducationForm;
