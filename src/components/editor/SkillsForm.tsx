'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Section } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SkillsFormProps {
  section: Section;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ section }) => {
  const { updateSectionItem, addSectionItem } = useResumeStore();
  const [inputValue, setInputValue] = useState('');

  // Ensure there's always at least one skills item
  const skillsItem = section.items[0] || { id: 'temp', skills: [] };
  const skills = skillsItem.skills || [];

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;

    if (section.items.length === 0) {
      addSectionItem(section.id);
      // Will be handled on next render
      return;
    }

    updateSectionItem(section.id, skillsItem.id, {
      skills: [...skills, trimmed],
    });
    setInputValue('');
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    updateSectionItem(section.id, skillsItem.id, { skills: newSkills });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-lg bg-background">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'bg-primary/10 text-primary text-sm font-medium',
              'transition-all hover:bg-primary/20'
            )}
          >
            {skill}
            <button
              onClick={() => removeSkill(idx)}
              className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter' : 'Add more...'}
          className={cn(
            'flex-1 min-w-[120px] px-2 py-1.5',
            'bg-transparent border-none outline-none',
            'text-foreground placeholder:text-muted-foreground/50'
          )}
        />
      </div>

      {/* Quick Add Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Quick add:</span>
        {['Communication', 'Leadership', 'Problem Solving', 'Teamwork'].map(
          (suggestion) =>
            !skills.includes(suggestion) && (
              <button
                key={suggestion}
                onClick={() => addSkill(suggestion)}
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  'border border-dashed border-border',
                  'text-muted-foreground hover:text-primary hover:border-primary',
                  'transition-colors flex items-center gap-1'
                )}
              >
                <Plus className="w-3 h-3" />
                {suggestion}
              </button>
            )
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add a skill. Press Backspace to remove the last skill.
      </p>
    </div>
  );
};

export default SkillsForm;
