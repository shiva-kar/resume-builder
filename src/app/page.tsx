'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Download,
  Eye,
  EyeOff,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FolderKanban,
  BadgeCheck,
  Moon,
  Sun,
  RotateCcw,
  FileText,
  Loader2,
  Type,
  Palette,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  Layout,
  Grid3X3,
  Building2,
  Pen,
  BookOpen,
  Zap,
  Github,
  ExternalLink,
} from 'lucide-react';
import {
  useResumeStore,
  useSections,
  useTheme,
  useIsDarkMode,
  useIsMobilePreview,
} from '@/lib/store';
import {
  SectionType,
  PAGE_SIZES,
  TemplateType,
  FontSizeLevel,
  PageSize,
  ACCENT_COLORS,
  DEFAULT_TYPOGRAPHY,
  TYPOGRAPHY_SIZES,
  TEMPLATE_INFO,
} from '@/lib/schema';
import * as Popover from '@radix-ui/react-popover';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import {
  SectionWrapper,
  ExperienceForm,
  EducationForm,
  SkillsForm,
  CustomSectionForm,
  PersonalInfoForm,
  AutoGenerateForm,
} from '@/components/editor';
import { exportToPDF, downloadPDF } from '@/components/pdf';
import { LivePreview } from '@/components/pdf/LivePreview';
import { cn } from '@/lib/utils';

// SECTION CONFIGURATION

const SECTION_CONFIG: Record<SectionType, { label: string; icon: React.ReactNode; color: string }> = {
  experience: { label: 'Experience', icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300' },
  education: { label: 'Education', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' },
  skills: { label: 'Skills', icon: <Code className="w-4 h-4" />, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300' },
  projects: { label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300' },
  certifications: { label: 'Certifications', icon: <BadgeCheck className="w-4 h-4" />, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300' },
  custom: { label: 'Custom', icon: <Award className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300' },
};

const getSectionIcon = (type: SectionType) => SECTION_CONFIG[type]?.icon || <FileText className="w-4 h-4" />;

// SECTION FORM MAPPING

const getSectionForm = (section: ReturnType<typeof useSections>[number]) => {
  switch (section.type) {
    case 'experience':
      return <ExperienceForm section={section} />;
    case 'education':
      return <EducationForm section={section} />;
    case 'skills':
      return <SkillsForm section={section} />;
    case 'projects':
    case 'certifications':
      return <CustomSectionForm section={section} showLink />;
    default:
      return <CustomSectionForm section={section} />;
  }
};

// DESIGN SETTINGS PANEL

interface DesignSettingsPanelProps {
  onPreviewColorChange?: (color: string | null) => void;
}

const DesignSettingsPanel: React.FC<DesignSettingsPanelProps> = memo(({ onPreviewColorChange }) => {
  const theme = useTheme();
  const { updateTheme, updateTypography, addRecentColor, addRecentBackgroundColor, addRecentTextColor } = useResumeStore();
  const [isOpen, setIsOpen] = useState(true);

  const [isPickingColor, setIsPickingColor] = useState(false);
  const [tempColor, setTempColor] = useState(theme.color);
  const [originalColor, setOriginalColor] = useState(theme.color);

  const [isPickingBgColor, setIsPickingBgColor] = useState(false);
  const [tempBgColor, setTempBgColor] = useState(theme.backgroundColor || '#ffffff');
  const [originalBgColor, setOriginalBgColor] = useState(theme.backgroundColor || '#ffffff');

  const [isPickingTextColor, setIsPickingTextColor] = useState(false);
  const [tempTextColor, setTempTextColor] = useState(theme.textColor || '#1e293b');
  const [originalTextColor, setOriginalTextColor] = useState(theme.textColor || '#1e293b');

  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

  // Debounced theme update for lag-free live preview
  useEffect(() => {
    if (isPickingColor) {
      const timer = setTimeout(() => {
        updateTheme({ color: tempColor });
      }, 50); // 50ms throttle prevents heavy PDF rendering lag
      return () => clearTimeout(timer);
    }
  }, [tempColor, isPickingColor, updateTheme]);

  useEffect(() => {
    if (isPickingBgColor) {
      const timer = setTimeout(() => {
        updateTheme({ backgroundColor: tempBgColor });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [tempBgColor, isPickingBgColor, updateTheme]);

  useEffect(() => {
    if (isPickingTextColor) {
      const timer = setTimeout(() => {
        updateTheme({ textColor: tempTextColor });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [tempTextColor, isPickingTextColor, updateTheme]);

  const openColorPicker = () => {
    setOriginalColor(theme.color);
    setTempColor(theme.color);
    setIsPickingColor(true);
  };

  const confirmColor = () => {
    updateTheme({ color: tempColor });
    addRecentColor(tempColor);
    setIsPickingColor(false);
  };

  const cancelColor = () => {
    updateTheme({ color: originalColor });
    setIsPickingColor(false);
  };

  const openBgColorPicker = () => {
    setOriginalBgColor(theme.backgroundColor || '#ffffff');
    setTempBgColor(theme.backgroundColor || '#ffffff');
    setIsPickingBgColor(true);
  };

  const confirmBgColor = () => {
    updateTheme({ backgroundColor: tempBgColor });
    addRecentBackgroundColor(tempBgColor);
    setIsPickingBgColor(false);
  };

  const cancelBgColor = () => {
    updateTheme({ backgroundColor: originalBgColor });
    setIsPickingBgColor(false);
  };

  const openTextColorPicker = () => {
    setOriginalTextColor(theme.textColor || '#1e293b');
    setTempTextColor(theme.textColor || '#1e293b');
    setIsPickingTextColor(true);
  };

  const confirmTextColor = () => {
    updateTheme({ textColor: tempTextColor });
    addRecentTextColor(tempTextColor);
    setIsPickingTextColor(false);
  };

  const cancelTextColor = () => {
    updateTheme({ textColor: originalTextColor });
    setIsPickingTextColor(false);
  };

  const isPresetThemeColor = ACCENT_COLORS.some((accent) => accent.color === theme.color);
  const isRecentThemeColor = theme.recentColors?.includes(theme.color) ?? false;
  const isCustomThemeColor = !isPresetThemeColor && !isRecentThemeColor;

  const bgColors = [
    { name: 'White', color: '#ffffff' },
    { name: 'Off White', color: '#fcfcfc' },
    { name: 'Warm White', color: '#faf8f5' },
    { name: 'Cool White', color: '#f8fafc' },
    { name: 'Slate', color: '#f1f5f9' },
  ];
  
  const currentBgColor = theme.backgroundColor || '#ffffff';
  const isPresetBgColor = bgColors.some((c) => c.color.toLowerCase() === currentBgColor.toLowerCase());
  const isRecentBgColor = theme.recentBackgroundColors?.some(c => c.toLowerCase() === currentBgColor.toLowerCase()) ?? false;
  const isCustomBgColor = !isPresetBgColor && !isRecentBgColor;

  const textColors = [
    { name: 'Slate 800', color: '#1e293b' },
    { name: 'Gray 900', color: '#111827' },
    { name: 'Zinc 900', color: '#18181b' },
    { name: 'Neutral 900', color: '#171717' },
    { name: 'Stone 900', color: '#1c1917' },
    { name: 'White', color: '#ffffff' },
  ];
  
  const currentTextColor = theme.textColor || '#1e293b';
  const isPresetTextColor = textColors.some((c) => c.color.toLowerCase() === currentTextColor.toLowerCase());
  const isRecentTextColor = theme.recentTextColors?.some(c => c.toLowerCase() === currentTextColor.toLowerCase()) ?? false;
  const isCustomTextColor = !isPresetTextColor && !isRecentTextColor;

  return (
    <div className="glass rounded-lg bento-card overflow-hidden mb-4">
      <button
        type="button"
        className="w-full bg-muted/50 px-4 py-3 border-b border-border/50 flex justify-between items-center cursor-pointer select-none hover:bg-muted/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
            <Palette className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">Design Studio</h3>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="p-4 space-y-5 fade-in">
          {/* Template Selection */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Choose Your Style
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { value: 'harvard', label: 'Academic', icon: BookOpen, lightBg: 'from-amber-50 to-orange-50/30', darkBg: 'dark:from-amber-950/40 dark:to-orange-950/20', iconColor: 'text-amber-600 dark:text-amber-400', accentBorder: 'border-amber-500/60' },
                { value: 'tech', label: 'Tech', icon: Code, lightBg: 'from-blue-50 to-cyan-50/30', darkBg: 'dark:from-blue-950/40 dark:to-cyan-950/20', iconColor: 'text-blue-600 dark:text-blue-400', accentBorder: 'border-blue-500/60' },
                { value: 'minimal', label: 'Minimal', icon: Type, lightBg: 'from-gray-50 to-slate-50/30', darkBg: 'dark:from-gray-900/40 dark:to-slate-900/20', iconColor: 'text-gray-600 dark:text-gray-300', accentBorder: 'border-gray-400/60' },
                { value: 'bold', label: 'Bold', icon: Zap, lightBg: 'from-slate-100 to-zinc-50/30', darkBg: 'dark:from-slate-800/50 dark:to-zinc-900/30', iconColor: 'text-slate-700 dark:text-slate-200', accentBorder: 'border-slate-600/60' },
                { value: 'neo', label: 'Neo', icon: Grid3X3, lightBg: 'from-violet-50 to-purple-50/30', darkBg: 'dark:from-violet-950/40 dark:to-purple-950/20', iconColor: 'text-violet-600 dark:text-violet-400', accentBorder: 'border-violet-500/60' },
                { value: 'portfolio', label: 'Portfolio', icon: Layout, lightBg: 'from-emerald-50 to-teal-50/30', darkBg: 'dark:from-emerald-950/40 dark:to-teal-950/20', iconColor: 'text-emerald-600 dark:text-emerald-400', accentBorder: 'border-emerald-500/60' },
                { value: 'corporate', label: 'Corporate', icon: Building2, lightBg: 'from-sky-50 to-blue-50/30', darkBg: 'dark:from-sky-950/40 dark:to-blue-950/20', iconColor: 'text-sky-600 dark:text-sky-400', accentBorder: 'border-sky-500/60' },
                { value: 'creative', label: 'Creative', icon: Sparkles, lightBg: 'from-pink-50 to-rose-50/30', darkBg: 'dark:from-pink-950/40 dark:to-rose-950/20', iconColor: 'text-pink-600 dark:text-pink-400', accentBorder: 'border-pink-500/60' },
                { value: 'elegant', label: 'Elegant', icon: Pen, lightBg: 'from-stone-50 to-neutral-50/30', darkBg: 'dark:from-stone-900/40 dark:to-neutral-900/20', iconColor: 'text-stone-600 dark:text-stone-300', accentBorder: 'border-stone-500/60' },
                { value: 'modern', label: 'Modern', icon: FolderKanban, lightBg: 'from-cyan-50 to-sky-50/30', darkBg: 'dark:from-cyan-950/40 dark:to-sky-950/20', iconColor: 'text-cyan-600 dark:text-cyan-400', accentBorder: 'border-cyan-500/60' },
              ].map((t) => {
                const isSelected = theme.template === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => updateTheme({ template: t.value as TemplateType })}
                    className={cn(
                      'group relative h-[72px] rounded-xl flex flex-col items-center justify-center gap-1.5',
                      'transition-all duration-200 btn-press overflow-hidden',
                      'border-2',
                      isSelected
                        ? `${t.accentBorder} shadow-lg dark:shadow-[0_0_15px_-3px] dark:shadow-primary/20`
                        : 'border-border/50 dark:border-border hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-md'
                    )}
                  >
                    {/* Gradient Background */}
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br transition-opacity duration-200',
                      t.lightBg,
                      t.darkBg,
                      isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                    )} />

                    {/* Selected glow effect */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent dark:from-primary/20" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                        isSelected
                          ? 'bg-white/80 dark:bg-white/10 shadow-sm'
                          : 'bg-white/50 dark:bg-white/5 group-hover:bg-white/70 dark:group-hover:bg-white/10'
                      )}>
                        <t.icon className={cn(
                          'w-4 h-4 transition-all duration-200',
                          isSelected ? t.iconColor : 'text-muted-foreground group-hover:text-foreground dark:group-hover:text-foreground'
                        )} />
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold transition-colors',
                        isSelected
                          ? 'text-foreground dark:text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground'
                      )}>
                        {t.label}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Template Description */}
            <p className="text-[11px] text-muted-foreground mt-2.5 italic">
              {TEMPLATE_INFO[theme.template]?.description || 'Select a template style'}
            </p>
          </div>

          {/* Page Size */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Page Format
            </p>
            <select
              id="page-format-select"
              value={theme.pageSize}
              onChange={(e) => updateTheme({ pageSize: e.target.value as PageSize })}
              className="w-full text-sm py-2.5 px-3 rounded-lg border border-border bg-background focus-ring cursor-pointer"
            >
              {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Accent Color
            </p>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Preset Colors */}
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateTheme({ color: c.color })}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    theme.color === c.color
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-transparent hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: c.color }}
                />
              ))}

              {/* Separator between presets and custom colors */}
              <div className="w-[2px] h-6 bg-border mx-1 rounded-full" />

              {/* Recent custom colors */}
              {theme.recentColors?.filter(c => !ACCENT_COLORS.some(ac => ac.color.toLowerCase() === c.toLowerCase())).map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ color })}
                  title="Recent custom color"
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    theme.color === color
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-border/50 hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}

              {/* Custom color picker */}
              <Popover.Root 
                open={isPickingColor} 
                onOpenChange={(open) => {
                  if (open) {
                    openColorPicker();
                  } else {
                    cancelColor();
                  }
                }}
              >
                <Popover.Trigger asChild>
                  <button
                    title="Pick custom color"
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all',
                      isCustomThemeColor || isPickingColor
                        ? 'border-foreground'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    )}
                  >
                    {(isPresetThemeColor || isRecentThemeColor) && !isPickingColor && (
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content 
                    align="center"
                    sideOffset={8}
                    className="z-50 bg-background border border-border rounded-xl shadow-xl p-3 w-[220px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="w-full custom-color-picker">
                      <HexColorPicker color={tempColor} onChange={setTempColor} />
                    </div>
                    
                    <div className="flex items-center gap-2 px-1 w-full">
                      <span className="text-xs font-mono text-muted-foreground font-medium">HEX</span>
                      <HexColorInput 
                        color={tempColor} 
                        onChange={setTempColor} 
                        className="flex-1 min-w-0 bg-muted/50 border border-border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                        prefixed={true}
                        alpha={false}
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={cancelColor}
                        className="flex-1 text-xs py-2 rounded-md border border-border hover:bg-muted transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmColor}
                        className="flex-1 text-xs py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm"
                      >
                        ✓ Apply
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Background Color
            </p>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Preset Colors */}
              {bgColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateTheme({ backgroundColor: c.color })}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    currentBgColor.toLowerCase() === c.color.toLowerCase()
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-border/50 hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: c.color }}
                />
              ))}

              {/* Separator between presets and custom colors */}
              <div className="w-[2px] h-6 bg-border mx-1 rounded-full" />

              {/* Recent custom colors */}
              {theme.recentBackgroundColors?.filter(c => !bgColors.some(ac => ac.color.toLowerCase() === c.toLowerCase())).map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ backgroundColor: color })}
                  title="Recent custom background color"
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    currentBgColor.toLowerCase() === color.toLowerCase()
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-border/50 hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}

              {/* Custom bg color picker */}
              <Popover.Root 
                open={isPickingBgColor} 
                onOpenChange={(open) => {
                  if (open) {
                    openBgColorPicker();
                  } else {
                    cancelBgColor();
                  }
                }}
              >
                <Popover.Trigger asChild>
                  <button
                    title="Pick custom background color"
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all',
                      isCustomBgColor || isPickingBgColor
                        ? 'border-foreground'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    )}
                  >
                    {(isPresetBgColor || isRecentBgColor) && !isPickingBgColor && (
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content 
                    align="center"
                    sideOffset={8}
                    className="z-50 bg-background border border-border rounded-xl shadow-xl p-3 w-[220px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="w-full custom-color-picker">
                      <HexColorPicker color={tempBgColor} onChange={setTempBgColor} />
                    </div>
                    
                    <div className="flex items-center gap-2 px-1 w-full">
                      <span className="text-xs font-mono text-muted-foreground font-medium">HEX</span>
                      <HexColorInput 
                        color={tempBgColor} 
                        onChange={setTempBgColor} 
                        className="flex-1 min-w-0 bg-muted/50 border border-border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                        prefixed={true}
                        alpha={false}
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={cancelBgColor}
                        className="flex-1 text-xs py-2 rounded-md border border-border hover:bg-muted transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmBgColor}
                        className="flex-1 text-xs py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm"
                      >
                        ✓ Apply
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Text Color
            </p>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Preset Colors */}
              {textColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateTheme({ textColor: c.color })}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    currentTextColor.toLowerCase() === c.color.toLowerCase()
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-border/50 hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: c.color }}
                />
              ))}

              {/* Separator between presets and custom colors */}
              <div className="w-[2px] h-6 bg-border mx-1 rounded-full" />

              {/* Recent custom colors */}
              {theme.recentTextColors?.filter(c => !textColors.some(ac => ac.color.toLowerCase() === c.toLowerCase())).map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ textColor: color })}
                  title="Recent custom text color"
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all duration-200 btn-press',
                    currentTextColor.toLowerCase() === color.toLowerCase()
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-border/50 hover:scale-105 hover:shadow-sm'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}

              {/* Custom text color picker */}
              <Popover.Root 
                open={isPickingTextColor} 
                onOpenChange={(open) => {
                  if (open) {
                    openTextColorPicker();
                  } else {
                    cancelTextColor();
                  }
                }}
              >
                <Popover.Trigger asChild>
                  <button
                    title="Pick custom text color"
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all',
                      isCustomTextColor || isPickingTextColor
                        ? 'border-foreground'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    )}
                  >
                    {(isPresetTextColor || isRecentTextColor) && !isPickingTextColor && (
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {isCustomTextColor && !isPickingTextColor && (
                      <div className="w-5 h-5 rounded overflow-hidden shadow-sm" style={{ backgroundColor: currentTextColor }} />
                    )}
                    {isPickingTextColor && (
                      <div className="w-5 h-5 rounded bg-gradient-to-tr from-violet-500 to-pink-500 animate-pulse" />
                    )}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content sideOffset={8} side="right" align="start" className="z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-popover border border-border shadow-xl rounded-xl p-4 w-64 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Custom Text Color</span>
                        <div className="w-6 h-6 rounded-md shadow-sm border border-border/50" style={{ backgroundColor: tempTextColor }} />
                      </div>
                      <HexColorPicker color={tempTextColor} onChange={setTempTextColor} className="!w-full !h-48" />
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">#</span>
                          <HexColorInput
                            color={tempTextColor}
                            onChange={setTempTextColor}
                            prefixed={false}
                            className="w-full h-9 rounded-md border border-border bg-muted/50 px-3 pl-6 text-sm text-foreground uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 w-full mt-1">
                        <button
                          onClick={cancelTextColor}
                          className="flex-1 text-xs py-2 rounded-md border border-border hover:bg-muted transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmTextColor}
                          className="flex-1 text-xs py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm"
                        >
                          ✓ Apply
                        </button>
                      </div>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
            
            {/* Secondary Text Opacity Slider */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Text Opacity
                </span>
                <span className="text-xs font-medium text-foreground">
                  {theme.secondaryTextOpacity || 60}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={theme.secondaryTextOpacity || 60}
                onChange={(e) => updateTheme({ secondaryTextOpacity: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                Adjusts the transparency of secondary text (like dates and subtitles) so they blend perfectly with your chosen text color.
              </p>
            </div>
          </div>

          {/* Global Font Size */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Text Scale
            </p>
            <div className="flex bg-muted/50 p-1 rounded-lg">
              {(['small', 'medium', 'large'] as FontSizeLevel[]).map((size) => (
                <button
                  key={size}
                  onClick={() => updateTheme({ fontSize: size })}
                  className={cn(
                    'flex-1 text-xs py-2.5 rounded-md font-medium transition-all duration-200 capitalize',
                    theme.fontSize === size
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Controls */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fine-Tune Typography
              </span>
            </div>

            {[
              { label: 'Your Name', key: 'name' as keyof typeof typography },
              { label: 'Section Titles', key: 'headers' as keyof typeof typography },
              { label: 'Body Content', key: 'body' as keyof typeof typography },
              { label: 'Experience & Items', key: 'experience' as keyof typeof typography },
              { label: 'Skills', key: 'skills' as keyof typeof typography },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <div className="flex bg-muted/50 p-0.5 rounded-md gap-0.5">
                  {TYPOGRAPHY_SIZES.map((s) => {
                    const sizeClass = 
                      s === 'sm' ? 'text-[10px]' : 
                      s === 'md' ? 'text-xs' : 
                      s === 'lg' ? 'text-sm' : 
                      'text-base';
                      
                    return (
                      <button
                        key={s}
                        onClick={() => updateTypography(item.key, s)}
                        className={cn(
                          'w-7 h-7 flex items-center justify-center rounded transition-all duration-200',
                          (typography[item.key] || typography.body || 'sm') === s
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                        title={s.toUpperCase()}
                      >
                        <span className={cn("font-medium", sizeClass)}>A</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DesignSettingsPanel.displayName = 'DesignSettingsPanel';

// SECTION MANAGER PANEL

const SectionManagerPanel: React.FC = memo(() => {
  const sections = useSections();
  const { addSection, addCustomSection, removeSection } = useResumeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customBump, setCustomBump] = useState(false);

  const customCount = useMemo(() => sections.filter((s) => s.type === 'custom').length, [sections]);

  // Get existing section types
  const existingSectionTypes = useMemo(() => {
    return new Set(sections.map(s => s.type));
  }, [sections]);

  // Available sections that can be added (not already present or allow multiple)
  const availableSections = useMemo(() => {
    const types: SectionType[] = ['experience', 'education', 'skills', 'projects', 'certifications'];
    return types.map(type => ({
      type,
      ...SECTION_CONFIG[type],
      exists: existingSectionTypes.has(type),
    }));
  }, [existingSectionTypes]);

  const removeSingleSection = (type: SectionType) => {
    const sectionToRemove = sections.find((section) => section.type === type);
    if (!sectionToRemove) {
      return;
    }

    if (confirm(`Remove ${SECTION_CONFIG[type].label} section?`)) {
      removeSection(sectionToRemove.id);
    }
  };

  const toggleSingleSection = (type: SectionType, exists: boolean) => {
    if (exists) {
      removeSingleSection(type);
      return;
    }
    addSection(type);
  };

  const handleAddCustomSection = () => {
    addCustomSection();
    setCustomBump(true);
    globalThis.setTimeout(() => setCustomBump(false), 140);
  };

  const customSectionLabel = customCount > 0 ? `Custom Section (${customCount})` : 'Custom Section';

  return (
    <div className="glass rounded-lg bento-card overflow-hidden mb-4">
      <button
        type="button"
        className="w-full bg-muted/50 px-4 py-3 border-b border-border/50 flex justify-between items-center cursor-pointer select-none hover:bg-muted/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">Build Your Story</h3>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="p-4 fade-in">
          <p className="text-xs text-muted-foreground mb-4">
            Add the sections that tell your story. Make it yours.
          </p>
          <div className="space-y-3">
            {/* Custom Section: always-add button (multiple allowed) */}
            <button
              type="button"
              onClick={handleAddCustomSection}
              className={cn(
                'w-full px-4 py-3 rounded-lg text-sm font-medium',
                'flex items-center justify-between gap-2 border-2',
                'bg-gradient-to-r from-background to-muted/30 border-border hover:border-primary/50',
                'transition-all duration-200 btn-press',
                customBump && 'scale-[1.02] border-primary shadow-md'
              )}
              title="Add another custom section"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {SECTION_CONFIG.custom.icon}
                </div>
                <span className="text-foreground">{customSectionLabel}</span>
              </div>
              <Plus className="w-4 h-4 text-primary" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {availableSections.map(({ type, label, icon, color, exists }) => {
              const ActionIcon = exists ? Minus : Plus;
              return (
              <button
                key={type}
                onClick={() => toggleSingleSection(type, exists)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium',
                  'flex items-center justify-between gap-2 transition-all duration-200 btn-press',
                  exists
                    ? 'bg-primary/10 text-primary border-2 border-primary/30 shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-2 border-transparent hover:border-border hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center',
                    exists ? 'bg-primary/20' : 'bg-background'
                  )}>
                    {icon}
                  </div>
                  <span>{label}</span>
                </div>
                <ActionIcon className={cn('w-4 h-4', exists ? 'opacity-60' : 'opacity-40')} />
              </button>
            );
            })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SectionManagerPanel.displayName = 'SectionManagerPanel';

// MAIN PAGE COMPONENT

export default function ResumeBuilderPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const resumeExportRef = useRef<HTMLDivElement | null>(null);
  const [showDevMode, setShowDevMode] = useState(false);
  // Color picker preview state - allows live preview without saving
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  const sections = useSections();
  const theme = useTheme();
  const isDarkMode = useIsDarkMode();
  const isMobilePreview = useIsMobilePreview();

  const {
    data,
    reorderSections,
    toggleDarkMode,
    setMobilePreview,
    resetStore,
  } = useResumeStore();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle drag end - memoized for stable reference
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
    }
  }, [reorderSections]);

  // Export the exact live preview DOM node for deterministic preview/PDF parity.
  const handleExport = useCallback(async () => {
    if (globalThis.window === undefined) {
      return;
    }

    console.info('[PDF Export] Export button clicked');
    setIsExporting(true);

    try {
      const exportNode = resumeExportRef.current ?? document.getElementById('resume-pdf-export-container');
      
      if (!exportNode) {
        throw new Error('Could not find the resume preview to export.');
      }

      const blob = await exportToPDF(data, exportNode);
      const filename = data.personalInfo.fullName
        ? data.personalInfo.fullName.trim().split(/\s+/).join('_') + '_Resume.pdf'
        : 'Resume.pdf';

      downloadPDF(blob, filename);
      console.info('[PDF Export] Download triggered', { filename, size: blob.size });
    } catch (error) {
      console.error('[PDF Export] Export failed', error);
      alert('PDF Export failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dark mode class
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen transition-colors bg-background'
    )}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                <span className="monogram text-lg text-primary-foreground">SK</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  Resume & Portfolio
                </h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Clean. Simple. Professional.
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 hover:bg-muted rounded-lg transition-all duration-200 btn-press"
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-[18px] h-[18px] text-amber-500" />
                ) : (
                  <Moon className="w-[18px] h-[18px] text-slate-500" />
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (confirm('Start fresh? This will clear all your data.')) {
                    resetStore();
                  }
                }}
                className="p-2.5 hover:bg-muted rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground btn-press"
                title="Start Fresh"
                aria-label="Reset and start fresh"
              >
                <RotateCcw className="w-[18px] h-[18px]" />
              </button>

              {/* Dev Mode Toggle */}
              <button
                type="button"
                onClick={() => setShowDevMode(!showDevMode)}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200 btn-press",
                  showDevMode 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title="Toggle Dev Mode (AI Tools)"
                aria-label="Toggle Dev Mode"
              >
                <Sparkles className="w-[18px] h-[18px]" />
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  'px-5 py-2.5 rounded-lg font-medium text-sm',
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary/90 shadow-sm hover:shadow-md',
                  'flex items-center gap-2 transition-all duration-200 btn-press',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export PDF
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-border/50 space-y-3 fade-in">
              <div className="flex gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export PDF
                </button>
                <button
                  onClick={() => setMobilePreview(!isMobilePreview)}
                  className="px-4 py-2.5 border border-border rounded-lg flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  {isMobilePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isMobilePreview ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Pane - Editor */}
          <div className={cn(
            'overflow-y-auto space-y-4 pr-2',
            isMobilePreview && 'hidden lg:block'
          )}>
            {/* Design Settings */}
            <DesignSettingsPanel onPreviewColorChange={setPreviewColor} />

            {/* Auto Generate - Hidden behind Dev Mode */}
            {showDevMode && <AutoGenerateForm />}

            {/* Section Manager */}
            <SectionManagerPanel />

            {/* Personal Info */}
            <PersonalInfoForm />

            {/* Sections */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SectionWrapper
                    key={section.id}
                    section={section}
                    icon={getSectionIcon(section.type)}
                  >
                    {getSectionForm(section)}
                  </SectionWrapper>
                ))}
              </SortableContext>
            </DndContext>

            {/* Mobile Preview Button */}
            <button
              onClick={() => setMobilePreview(true)}
              className={cn(
                'lg:hidden w-full py-3.5 rounded-lg font-medium',
                'bg-primary text-primary-foreground shadow-sm',
                'flex items-center justify-center gap-2 btn-press'
              )}
            >
              <Eye className="w-5 h-5" />
              View Preview
            </button>

            {/* Footer - Personal Branding */}
            <footer className="mt-8 pt-6 border-t border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary/80 to-primary rounded flex items-center justify-center">
                    <span className="monogram text-[10px] text-primary-foreground">SK</span>
                  </div>
                  <span>Built by <span className="text-foreground font-medium">Shiva Kar</span> · 2026</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="italic text-muted-foreground/70">Your story, your style.</span>
                  <a
                    href="https://github.com/shiva-kar/resume-builder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/50 hover:text-foreground transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                </div>
              </div>
            </footer>
          </div>

          {/* Right Pane - Live Preview */}
          <div className={cn(
            'relative',
            !isMobilePreview && 'hidden lg:block'
          )}>
            <div className="sticky top-4 glass rounded-lg overflow-hidden h-[calc(100vh-9rem)]">
              <div className="bg-muted/50 p-3 flex items-center justify-between border-b border-border/50">
                <h3 className="text-foreground font-semibold flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary" />
                  Live Preview
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
                    {PAGE_SIZES[theme.pageSize].label}
                  </span>
                  <button
                    onClick={() => setMobilePreview(false)}
                    className="lg:hidden p-1.5 hover:bg-background rounded-md text-foreground transition-colors"
                    aria-label="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-48px)]">
                <LivePreview
                  data={previewColor ? { ...data, theme: { ...data.theme, color: previewColor } } : data}
                  resumeRef={resumeExportRef}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
