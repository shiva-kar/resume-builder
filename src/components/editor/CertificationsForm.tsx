'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea } from './FormInput';
import { MonthPicker } from '@/components/ui/MonthPicker';

interface CertificationsFormProps {
  section: Section;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();

  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="border-l-2 border-orange-500/30 pl-4 space-y-3 py-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  placeholder="Certification Name (e.g. AWS Certified Solutions Architect)"
                  value={item.title || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      title: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="Issuing Organization (e.g. Amazon Web Services)"
                  value={item.institution || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      institution: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MonthPicker
                  value={item.startDate || ''}
                  onChange={(val) => updateSectionItem(section.id, item.id, { startDate: val })}
                  placeholder="Date Obtained"
                />
                <FormInput
                  placeholder="Credential URL (e.g. https://...)"
                  value={item.subtitle || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      subtitle: e.target.value,
                    })
                  }
                />
              </div>

              <FormTextarea
                placeholder="Description or Link to Credential..."
                value={item.description || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    description: e.target.value,
                  })
                }
              />
            </div>
            
            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Remove certification"
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
        Add Certification
      </button>
    </div>
  );
};
