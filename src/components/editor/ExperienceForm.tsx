'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea, FormCheckbox } from './FormInput';
import { MonthPicker } from '@/components/ui/MonthPicker';

interface ExperienceFormProps {
  section: Section;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();

  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="border-l-2 border-blue-500/30 pl-4 space-y-3 py-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  value={item.position || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      position: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="e.g. Google, Microsoft, Startup Inc."
                  value={item.company || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      company: e.target.value,
                    })
                  }
                />
              </div>

              {/* Location Field */}
              <FormInput
                placeholder="Location (e.g. New York, NY or Remote)"
                value={item.location || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    location: e.target.value,
                  })
                }
              />

              <div className="flex gap-3 items-end flex-wrap">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <MonthPicker
                    value={item.startDate || ''}
                    onChange={(val) => updateSectionItem(section.id, item.id, { startDate: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <MonthPicker
                    value={item.current ? '' : (item.endDate || '')}
                    onChange={(val) => updateSectionItem(section.id, item.id, { endDate: val })}
                    disabled={item.current}
                  />
                </div>
                <FormCheckbox
                  label="Currently working here"
                  checked={item.current || false}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      current: e.target.checked,
                    })
                  }
                />
              </div>

              <FormTextarea
                placeholder="• Led development of feature X that improved Y by Z%
• Collaborated with cross-functional teams to...
• Built and deployed scalable solutions..."
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

            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="p-2 hover:bg-destructive/10 rounded-none transition-colors text-destructive ml-2"
              aria-label="Remove this experience entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addSectionItem(section.id)}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;
