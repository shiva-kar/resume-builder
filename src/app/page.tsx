'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from '@/lib/schema';
import {
  SectionWrapper,
  ExperienceForm,
  EducationForm,
  SkillsForm,
  CustomSectionForm,
  PersonalInfoForm,
} from '@/components/editor';
import { exportToPDF, downloadPDF } from '@/components/pdf';
import { LivePreview } from '@/components/pdf/LivePreview';
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

const DesignSettingsPanel: React.FC = () => {
  const theme = useTheme();
  const { updateTheme, updateTypography } = useResumeStore();
  const [isOpen, setIsOpen] = useState(true);

  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

  return (
    <div className="glass rounded-xl shadow-sm bento-card overflow-hidden mb-4">
      <div
        className="bg-muted/50 px-4 py-3 border-b border-border flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Design & Layout</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'harvard', label: 'Harvard' },
                { value: 'tech', label: 'Tech' },
                { value: 'minimal', label: 'Minimal' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateTheme({ template: t.value as TemplateType })}
                  className={cn(
                    'h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all',
                    theme.template === t.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Page Size
            </label>
            <select
              value={theme.pageSize}
              onChange={(e) => updateTheme({ pageSize: e.target.value as PageSize })}
              className="w-full text-sm py-2 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Accent Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateTheme({ color: c.color })}
                  title={c.name}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    theme.color === c.color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c.color }}
                />
              ))}
              <input
                type="color"
                value={theme.color}
                onChange={(e) => updateTheme({ color: e.target.value })}
                className="w-8 h-8 rounded-full cursor-pointer border border-border overflow-hidden"
                title="Custom color"
              />
            </div>
          </div>

          {/* Global Font Size */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Global Text Size
            </label>
            <div className="flex bg-muted p-1 rounded-lg">
              {(['small', 'medium', 'large'] as FontSizeLevel[]).map((size) => (
                <button
                  key={size}
                  onClick={() => updateTheme({ fontSize: size })}
                  className={cn(
                    'flex-1 text-xs py-2 rounded-md font-medium transition-all capitalize',
                    theme.fontSize === size
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Controls */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Typography Sizing
              </span>
            </div>

            {[
              { label: 'Name', key: 'name' as keyof typeof typography },
              { label: 'Section Headers', key: 'headers' as keyof typeof typography },
              { label: 'Body Text', key: 'body' as keyof typeof typography },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <div className="flex bg-muted p-0.5 rounded">
                  {TYPOGRAPHY_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateTypography(item.key, s)}
                      className={cn(
                        'w-8 text-[10px] py-1 rounded font-medium transition-all uppercase',
                        typography[item.key] === s
                          ? 'bg-background shadow-sm text-foreground'
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
};

// ============================================================================
// SECTION MANAGER PANEL
// ============================================================================

const SectionManagerPanel: React.FC = () => {
  const sections = useSections();
  const { addSection, removeSection, toggleSectionVisibility } = useResumeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get existing section types
  const existingSectionTypes = useMemo(() => {
    return new Set(sections.map(s => s.type));
  }, [sections]);

  // Available sections that can be added (not already present or allow multiple)
  const availableSections = useMemo(() => {
    const types: SectionType[] = ['experience', 'education', 'skills', 'projects', 'certifications', 'custom'];
    return types.map(type => ({
      type,
      ...SECTION_CONFIG[type],
      exists: existingSectionTypes.has(type),
      // These types can have multiple instances
      allowMultiple: type === 'custom',
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

  return (
    <div className="glass rounded-xl shadow-sm bento-card overflow-hidden mb-4">
      <div
        className="bg-muted/50 px-4 py-3 border-b border-border flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Manage Sections</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Toggle sections on/off. Active sections appear in editor below.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableSections.map(({ type, label, icon, color, exists, allowMultiple }) => (
              <button
                key={type}
                onClick={() => handleToggleSection(type, exists, allowMultiple)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium',
                  'flex items-center justify-between gap-2 transition-all',
                  exists
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'bg-muted/50 text-muted-foreground border-2 border-transparent hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-2">
                  {icon}
                  <span>{label}</span>
                </div>
                {exists ? (
                  allowMultiple ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4 opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ResumeBuilderPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
    }
  };

  // Handle PDF export
  const handleExport = async () => {
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
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen transition-colors',
      isDarkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    )}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Resume Builder</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Professional Portfolio Creator
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data?')) {
                    resetStore();
                  }
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                title="Reset Data"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm',
                  'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                  'hover:from-blue-700 hover:to-purple-700',
                  'flex items-center gap-2 shadow-lg transition-all',
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
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 border border-border rounded-lg"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export PDF
                </button>
                <button
                  onClick={() => setMobilePreview(!isMobilePreview)}
                  className="px-4 py-2 border border-border rounded-lg flex items-center gap-2"
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
            <DesignSettingsPanel />

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
                'lg:hidden w-full py-3 rounded-lg font-medium',
                'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                'flex items-center justify-center gap-2 shadow-lg'
              )}
            >
              <Eye className="w-5 h-5" />
              View Preview
            </button>
          </div>

          {/* Right Pane - Live Preview */}
          <div className={cn(
            'relative',
            !isMobilePreview && 'hidden lg:block'
          )}>
            <div className="sticky top-4 glass rounded-xl shadow-lg overflow-hidden h-[calc(100vh-9rem)]">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-xs">
                    {PAGE_SIZES[theme.pageSize].label}
                  </span>
                  <button
                    onClick={() => setMobilePreview(false)}
                    className="lg:hidden p-1 hover:bg-white/20 rounded text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-48px)]">
                <LivePreview data={data} className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
