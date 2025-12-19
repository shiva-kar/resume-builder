'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea } from './FormInput';

interface EducationFormProps {
  section: Section;
}

export const EducationForm: React.FC<EducationFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();

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
                  placeholder="Degree / Field of Study"
                  value={item.degree || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      degree: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="Institution Name"
                  value={item.institution || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      institution: e.target.value,
                    })
                  }
                />
              </div>

              {/* Location Field */}
              <FormInput
                placeholder="Location (optional)"
                value={item.location || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    location: e.target.value,
                  })
                }
              />

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

              <FormTextarea
                placeholder="Additional details (GPA, honors, relevant coursework...)"
                value={item.description || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    description: e.target.value,
                  })
                }
                rows={2}
                showBulletHelper
              />
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
