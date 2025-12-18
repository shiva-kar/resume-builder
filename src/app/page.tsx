'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  useResumeStore,
  useSections,
  useTheme,
  useIsDarkMode,
  useIsMobilePreview,
} from '@/lib/store';
import { SectionType, PAGE_SIZES, TemplateType, FontSizeLevel, PageSize } from '@/lib/schema';
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
// SECTION ICON MAPPING
// ============================================================================

const getSectionIcon = (type: SectionType) => {
  const icons: Record<SectionType, React.ReactNode> = {
    experience: <Briefcase className="w-4 h-4" />,
    education: <GraduationCap className="w-4 h-4" />,
    skills: <Code className="w-4 h-4" />,
    projects: <FolderKanban className="w-4 h-4" />,
    certifications: <BadgeCheck className="w-4 h-4" />,
    custom: <Award className="w-4 h-4" />,
  };
  return icons[type] || <FileText className="w-4 h-4" />;
};

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
    default:
      return <CustomSectionForm section={section} />;
  }
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
    addSection,
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
        ? `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
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

  const sectionButtons: { type: SectionType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300' },
    { type: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300' },
    { type: 'skills', label: 'Skills', icon: <Code className="w-4 h-4" />, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300' },
    { type: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300' },
    { type: 'certifications', label: 'Certifications', icon: <BadgeCheck className="w-4 h-4" />, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300' },
    { type: 'custom', label: 'Custom', icon: <Award className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300' },
  ];

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
              {/* Template Select */}
              <select
                value={theme.template}
                onChange={(e) => updateTheme({ template: e.target.value as TemplateType })}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="harvard">Harvard (Classic)</option>
                <option value="tech">Tech (Modern)</option>
                <option value="minimal">Minimal (Clean)</option>
              </select>

              {/* Page Size Select */}
              <select
                value={theme.pageSize}
                onChange={(e) => updateTheme({ pageSize: e.target.value as PageSize })}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(PAGE_SIZES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              {/* Font Size Select */}
              <select
                value={theme.fontSize}
                onChange={(e) => updateTheme({ fontSize: e.target.value as FontSizeLevel })}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="small">Small Text</option>
                <option value="medium">Medium Text</option>
                <option value="large">Large Text</option>
              </select>

              {/* Color Picker */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.color}
                  onChange={(e) => updateTheme({ color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                  title="Theme Color"
                />
              </div>

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
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={theme.template}
                  onChange={(e) => updateTheme({ template: e.target.value as TemplateType })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                >
                  <option value="harvard">Harvard</option>
                  <option value="tech">Tech</option>
                  <option value="minimal">Minimal</option>
                </select>
                <select
                  value={theme.pageSize}
                  onChange={(e) => updateTheme({ pageSize: e.target.value as PageSize })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                >
                  {Object.entries(PAGE_SIZES).map(([key, val]) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
                <select
                  value={theme.fontSize}
                  onChange={(e) => updateTheme({ fontSize: e.target.value as FontSizeLevel })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.color}
                    onChange={(e) => updateTheme({ color: e.target.value })}
                    className="flex-1 h-10 rounded-lg cursor-pointer border border-border"
                  />
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 border border-border rounded-lg"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
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

            {/* Add Section Buttons */}
            <div className="glass rounded-xl p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Add Sections
              </p>
              <div className="flex flex-wrap gap-2">
                {sectionButtons.map(({ type, label, icon, color }) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium',
                      'flex items-center gap-2 transition-colors',
                      color
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

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
