'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { FormInput, FormTextarea, FormCheckbox } from './FormInput';
import { MonthPicker } from '@/components/ui/MonthPicker';

interface VolunteerFormProps {
  section: Section;
}

export const VolunteerForm: React.FC<VolunteerFormProps> = ({ section }) => {
  const { addSectionItem, removeSectionItem, updateSectionItem } = useResumeStore();

  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="border-l-2 border-teal-500/30 pl-4 space-y-3 py-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  placeholder="Role (e.g. Community Outreach Lead)"
                  value={item.position || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      position: e.target.value,
                    })
                  }
                />
                <FormInput
                  placeholder="Organization (e.g. Red Cross)"
                  value={item.company || ''}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      company: e.target.value,
                    })
                  }
                />
              </div>

              <FormInput
                placeholder="Location (e.g. New York, NY)"
                value={item.location || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    location: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
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
                    value={item.endDate || ''}
                    onChange={(val) => updateSectionItem(section.id, item.id, { endDate: val })}
                    disabled={item.current}
                  />
                </div>
                <FormCheckbox
                  label="Currently volunteering here"
                  checked={item.current || false}
                  onChange={(e) =>
                    updateSectionItem(section.id, item.id, {
                      current: e.target.checked,
                    })
                  }
                />
              </div>

              <FormTextarea
                placeholder="• Organized weekly community events serving 200+ participants
• Coordinated volunteer teams of 15+ members..."
                value={item.description || ''}
                onChange={(e) =>
                  updateSectionItem(section.id, item.id, {
                    description: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
            
            <button
              onClick={() => removeSectionItem(section.id, item.id)}
              className="ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Remove volunteer entry"
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
        Add Volunteer Experience
      </button>
    </div>
  );
};
