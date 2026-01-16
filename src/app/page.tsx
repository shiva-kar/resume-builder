'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  ChevronUp,
  Plus,
  Minus,
  Link as LinkIcon,
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
  TYPOGRAPHY_SIZES,
  DEFAULT_TYPOGRAPHY,
  TEMPLATE_INFO,
} from '@/lib/schema';
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
import { PreviewCanvas } from '@/components/pdf/PreviewCanvas';
import { cn } from '@/lib/utils';

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

const SECTION_CONFIG: Record<SectionType, { label: string; icon: React.ReactNode; color: string }> = {
  experience: { label: 'Experience', icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300' },
  education: { label: 'Education', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' },
  skills: { label: 'Skills', icon: <Code className="w-4 h-4" />, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300' },
  projects: { label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300' },
  certifications: { label: 'Certifications', icon: <BadgeCheck className="w-4 h-4" />, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300' },
  custom: { label: 'Custom', icon: <Award className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300' },
};

const getSectionIcon = (type: SectionType) => SECTION_CONFIG[type]?.icon || <FileText className="w-4 h-4" />;

// ============================================================================
// SECTION FORM MAPPING
// ============================================================================

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

// ============================================================================
// DESIGN SETTINGS PANEL
// ============================================================================

interface DesignSettingsPanelProps {
  onPreviewColorChange?: (color: string | null) => void;
}

const DesignSettingsPanel: React.FC<DesignSettingsPanelProps> = memo(({ onPreviewColorChange }) => {
  const theme = useTheme();
  const { updateTheme, updateTypography } = useResumeStore();
  const [isOpen, setIsOpen] = useState(true);

  // Color picker state - only confirmed colors are saved
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [tempColor, setTempColor] = useState(theme.color);
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

  // Handle opening color picker
  const openColorPicker = () => {
    setTempColor(theme.color);
    setIsPickingColor(true);
    onPreviewColorChange?.(theme.color); // Start live preview with current color
    // Small delay to ensure state is set before opening native picker
    setTimeout(() => colorInputRef.current?.click(), 50);
  };

  // Handle color change (preview only, not saved) - updates live preview
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value);
    onPreviewColorChange?.(e.target.value); // Update live preview
  };

  // Confirm the selected color - saves and ends preview
  const confirmColor = () => {
    updateTheme({ color: tempColor });
    setIsPickingColor(false);
    onPreviewColorChange?.(null); // End live preview (use saved color)
  };

  // Cancel color selection - reverts preview
  const cancelColor = () => {
    setTempColor(theme.color);
    setIsPickingColor(false);
    onPreviewColorChange?.(null); // End live preview (use saved color)
  };

  return (
    <div className="glass rounded-lg bento-card overflow-hidden mb-4">
      <div
        className="bg-muted/50 px-4 py-3 border-b border-border/50 flex justify-between items-center cursor-pointer select-none hover:bg-muted/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
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
      </div>

      {isOpen && (
        <div className="p-4 space-y-5 fade-in">
          {/* Template Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Choose Your Style
            </label>
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
              {TEMPLATE_INFO[theme.template as keyof typeof TEMPLATE_INFO]?.description || 'Select a template style'}
            </p>
          </div>

          {/* Page Size */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Page Format
            </label>
            <select
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Accent Color
            </label>
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

              {/* Recent custom colors */}
              {theme.recentColors?.filter(c => !ACCENT_COLORS.some(ac => ac.color === c)).slice(0, 5).map((color) => (
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

              {/* Custom color picker with confirmation */}
              <div className="relative">
                {/* Hidden color input */}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={tempColor}
                  onChange={handleColorChange}
                  className="sr-only"
                />

                {/* Custom color trigger button */}
                <button
                  onClick={openColorPicker}
                  title="Pick custom color"
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all',
                    isPickingColor
                      ? 'border-primary ring-2 ring-primary/20'
                      : !ACCENT_COLORS.some(c => c.color === theme.color) && !theme.recentColors?.includes(theme.color)
                        ? 'border-foreground'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                  )}
                  style={
                    isPickingColor
                      ? { backgroundColor: tempColor }
                      : !ACCENT_COLORS.some(c => c.color === theme.color)
                        ? { backgroundColor: theme.color }
                        : undefined
                  }
                >
                  {(ACCENT_COLORS.some(c => c.color === theme.color) || theme.recentColors?.includes(theme.color)) && !isPickingColor && (
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                {/* Color picker confirmation popover */}
                {isPickingColor && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg border border-border shadow-inner"
                        style={{ backgroundColor: tempColor }}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Selected</p>
                        <p className="text-sm font-mono">{tempColor.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => colorInputRef.current?.click()}
                      className="w-full text-xs py-1.5 px-2 mb-2 rounded border border-border hover:bg-muted transition-colors"
                    >
                      Change Color
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelColor}
                        className="flex-1 text-xs py-1.5 px-2 rounded border border-border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmColor}
                        className="flex-1 text-xs py-1.5 px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                      >
                        ✓ Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Global Font Size */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Text Scale
            </label>
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
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <div className="flex bg-muted/50 p-0.5 rounded-md">
                  {TYPOGRAPHY_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateTypography(item.key, s)}
                      className={cn(
                        'w-8 text-[10px] py-1.5 rounded font-medium transition-all duration-200 uppercase',
                        typography[item.key] === s
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {s}
                    </button>
                  ))}
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

// ============================================================================
// SECTION MANAGER PANEL
// ============================================================================

const SectionManagerPanel: React.FC = memo(() => {
  const sections = useSections();
  const { addSection, addCustomSection, removeSection, toggleSectionVisibility } = useResumeStore();
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
      allowMultiple: false,
    }));
  }, [existingSectionTypes]);

  const handleToggleSection = (type: SectionType, exists: boolean, allowMultiple: boolean) => {
    if (exists && !allowMultiple) {
      // Remove the section
      const sectionToRemove = sections.find(s => s.type === type);
      if (sectionToRemove && confirm(`Remove ${SECTION_CONFIG[type].label} section?`)) {
        removeSection(sectionToRemove.id);
      }
    } else {
      // Add new section
      addSection(type);
    }
  };

  const handleAddCustomSection = () => {
    addCustomSection();
    setCustomBump(true);
    window.setTimeout(() => setCustomBump(false), 140);
  };

  return (
    <div className="glass rounded-lg bento-card overflow-hidden mb-4">
      <div
        className="bg-muted/50 px-4 py-3 border-b border-border/50 flex justify-between items-center cursor-pointer select-none hover:bg-muted/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
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
      </div>

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
                <span className="text-foreground">{`Custom Section${customCount > 0 ? ` (${customCount})` : ''}`}</span>
              </div>
              <Plus className="w-4 h-4 text-primary" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {availableSections.map(({ type, label, icon, color, exists, allowMultiple }) => (
              <button
                key={type}
                onClick={() => handleToggleSection(type, exists, allowMultiple)}
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
                {exists ? (
                  allowMultiple ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4 opacity-60" />
                ) : (
                  <Plus className="w-4 h-4 opacity-40" />
                )}
              </button>
            ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SectionManagerPanel.displayName = 'SectionManagerPanel';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ResumeBuilderPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Color picker preview state - allows live preview without saving
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  const sections = useSections();
  const theme = useTheme();
  const isDarkMode = useIsDarkMode();
  const isMobilePreview = useIsMobilePreview();

  const {
    data,
    reorderSections,
    updateTheme,
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

  // Handle PDF export using @react-pdf/renderer.
  // NOTE: This does not capture the Preview DOM/Tailwind CSS; it renders a separate PDF component tree.
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await exportToPDF(data);
      const filename = data.personalInfo.fullName
        ? data.personalInfo.fullName.replace(/\s+/g, '_') + '_Resume.pdf'
        : 'Resume.pdf';
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
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

              {/* Export Button */}
              <button
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

            {/* Auto Generate */}
            <AutoGenerateForm />

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
                <PreviewCanvas
                  data={previewColor ? { ...data, theme: { ...data.theme, color: previewColor } } : data}
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
