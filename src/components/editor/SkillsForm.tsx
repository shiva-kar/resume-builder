'use client';

import React, { useState } from 'react';
import { X, Plus, Star } from 'lucide-react';
import { Section, SKILL_LEVELS, SkillLevel, SkillWithLevel } from '@/lib/schema';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

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
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | ''>('');

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
      level: selectedLevel as SkillLevel,
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
      handleAdd();
    }
    if (e.key === 'Backspace' && !inputValue) {
      if (skillsWithLevels.length > 0) {
        removeSkillWithLevel(section.id, skillsItem.id, skillsWithLevels.length - 1);
      } else if (skills.length > 0) {
        removeSkill(skills.length - 1);
      }
    }
  };

  const handleAdd = () => {
    if (!selectedLevel) {
      addSkill(inputValue);
    } else {
      addSkillLevel();
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
                className="flex items-center gap-2 p-2 border border-border rounded-none bg-muted"
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
                    'flex-1 px-2 py-1 rounded-none border-none bg-transparent',
                    'text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                  placeholder="e.g. Python, Project Management"
                  aria-label="Skill name"
                />
                <Select
                  value={skill.level}
                  onValueChange={(value) =>
                    updateSkillWithLevel(section.id, skillsItem.id, idx, {
                      level: value as SkillLevel,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      'px-2 py-1 rounded-none text-xs font-medium border-none h-7 min-w-[120px] w-auto',
                      levelColors[skill.level]
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => removeSkillWithLevel(section.id, skillsItem.id, idx)}
                  className="p-1 hover:bg-destructive/10 rounded-none text-destructive"
                  aria-label={`Remove ${skill.name} skill`}
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
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none',
                  'bg-muted text-foreground text-sm font-medium border border-border',
                  'transition-colors hover:bg-muted/80'
                )}
              >
                {skill}
                <button
                  onClick={() => removeSkill(idx)}
                  className="hover:bg-background rounded-none p-0.5 transition-colors"
                  aria-label={`Remove ${skill} skill`}
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
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. JavaScript, Leadership, AWS..."
            aria-label="New skill name"
            className={cn(
              'flex-1 px-3 py-2 rounded-none',
              'border border-border bg-background',
              'text-foreground placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          />
          <div className="flex gap-2 sm:w-auto">
            <Select
              value={selectedLevel || "none"}
              onValueChange={(value) => setSelectedLevel(value === "none" ? "" : (value as SkillLevel))}
            >
              <SelectTrigger
                className={cn(
                  'px-3 py-2 rounded-none border border-border bg-background flex-1 sm:flex-none',
                  'text-sm sm:min-w-[180px] w-full sm:w-auto'
                )}
              >
                <SelectValue placeholder="No Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Level (Quick Skill)</SelectItem>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className={cn(
                'px-4 py-2 rounded-none font-medium text-sm shrink-0',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-1'
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
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
                  setSelectedLevel('');
                }}
                className={cn(
                  'text-xs px-2 py-1 rounded-none',
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
