'use client';

import React, { useState } from 'react';
import { X, Plus, Star } from 'lucide-react';
import { Section, SKILL_LEVELS, SkillLevel, SkillWithLevel } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SkillsFormProps {
  section: Section;
}

// Skill level badge colors
const levelColors: Record<SkillLevel, string> = {
  Beginner: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Expert: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

export const SkillsForm: React.FC<SkillsFormProps> = ({ section }) => {
  const {
    updateSectionItem,
    addSectionItem,
    addSkillWithLevel,
    updateSkillWithLevel,
    removeSkillWithLevel,
  } = useResumeStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('Intermediate');

  // Ensure there is always at least one skills item
  const skillsItem = section.items[0] || { id: 'temp', skills: [], skillsWithLevels: [] };
  const skills = skillsItem.skills || [];
  const skillsWithLevels = skillsItem.skillsWithLevels || [];

  // Add simple skill (no level)
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;

    if (section.items.length === 0) {
      addSectionItem(section.id);
      return;
    }

    updateSectionItem(section.id, skillsItem.id, {
      skills: [...skills, trimmed],
    });
    setInputValue('');
  };

  // Add skill with level
  const addSkillLevel = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (skillsWithLevels.some((s) => s.name === trimmed)) return;

    if (section.items.length === 0) {
      addSectionItem(section.id);
      return;
    }

    addSkillWithLevel(section.id, skillsItem.id, {
      name: trimmed,
      level: selectedLevel,
    });
    setInputValue('');
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    updateSectionItem(section.id, skillsItem.id, { skills: newSkills });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkillLevel();
    }
    if (e.key === 'Backspace' && !inputValue) {
      if (skillsWithLevels.length > 0) {
        removeSkillWithLevel(section.id, skillsItem.id, skillsWithLevels.length - 1);
      } else if (skills.length > 0) {
        removeSkill(skills.length - 1);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Skills with Levels */}
      {skillsWithLevels.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Skills with Proficiency
          </label>
          <div className="space-y-2">
            {skillsWithLevels.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30"
              >
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) =>
                    updateSkillWithLevel(section.id, skillsItem.id, idx, {
                      name: e.target.value,
                    })
                  }
                  className={cn(
                    'flex-1 px-2 py-1 rounded border-none bg-transparent',
                    'text-sm text-foreground focus:outline-none'
                  )}
                  placeholder="Skill name"
                />
                <select
                  value={skill.level}
                  onChange={(e) =>
                    updateSkillWithLevel(section.id, skillsItem.id, idx, {
                      level: e.target.value as SkillLevel,
                    })
                  }
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium border-none',
                    levelColors[skill.level]
                  )}
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeSkillWithLevel(section.id, skillsItem.id, idx)}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Skills Tags (backward compatibility) */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Skills
          </label>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      )}

      {/* Add Skill Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Add New Skill
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill name..."
            className={cn(
              'flex-1 px-3 py-2 rounded-lg',
              'border border-border bg-background',
              'text-foreground placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            className={cn(
              'px-3 py-2 rounded-lg border border-border bg-background',
              'text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            onClick={addSkillLevel}
            disabled={!inputValue.trim()}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-1'
            )}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Quick Add Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Quick add:</span>
        {['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'React', 'TypeScript'].map(
          (suggestion) =>
            !skills.includes(suggestion) &&
            !skillsWithLevels.some((s) => s.name === suggestion) && (
              <button
                key={suggestion}
                onClick={() => {
                  setInputValue(suggestion);
                }}
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
        Press Enter to add a skill with level. Press Backspace to remove the last skill.
      </p>
    </div>
  );
};

export default SkillsForm;
