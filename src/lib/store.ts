import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ResumeData,
  PersonalInfo,
  Section,
  SectionItem,
  SectionType,
  Theme,
  Link,
  createEmptyState,
  DEFAULT_SECTION_FONT_SIZE,
  SectionTypeFontSize,
  TextSize,
  TypographySettings,
  TypographySize,
  DEFAULT_TYPOGRAPHY,
  SkillWithLevel,
  CustomFieldDefinition,
  CustomFieldValue,
  CUSTOM_FIELD_TEMPLATES,
} from './schema';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface ResumeStore {
  // State
  data: ResumeData;
  isDarkMode: boolean;
  isMobilePreview: boolean;

  // Personal Info Actions
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addLink: (link: Omit<Link, 'id'>) => void;
  updateLink: (id: string, link: Partial<Link>) => void;
  removeLink: (id: string) => void;

  // Section Actions
  addSection: (type: SectionType) => void;
  addCustomSection: (template?: keyof typeof CUSTOM_FIELD_TEMPLATES) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  toggleSectionVisibility: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  updateSectionFontSize: (
    sectionId: string,
    type: keyof SectionTypeFontSize,
    size: TextSize
  ) => void;

  // Custom Field Definition Actions
  addFieldDefinition: (sectionId: string, field: Omit<CustomFieldDefinition, 'id'>) => void;
  updateFieldDefinition: (sectionId: string, fieldId: string, updates: Partial<CustomFieldDefinition>) => void;
  removeFieldDefinition: (sectionId: string, fieldId: string) => void;
  reorderFieldDefinitions: (sectionId: string, activeId: string, overId: string) => void;

  // Section Item Actions
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  updateSectionItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<SectionItem>
  ) => void;

  // Custom Field Value Actions
  updateCustomFieldValue: (
    sectionId: string,
    itemId: string,
    fieldId: string,
    value: string | string[]
  ) => void;

  // Skills with Levels Actions
  addSkillWithLevel: (sectionId: string, itemId: string, skill: SkillWithLevel) => void;
  updateSkillWithLevel: (
    sectionId: string,
    itemId: string,
    skillIndex: number,
    updates: Partial<SkillWithLevel>
  ) => void;
  removeSkillWithLevel: (sectionId: string, itemId: string, skillIndex: number) => void;

  // Theme Actions
  updateTheme: (theme: Partial<Theme>) => void;
  updateTypography: (type: keyof TypographySettings, size: TypographySize) => void;
  toggleDarkMode: () => void;
  setMobilePreview: (show: boolean) => void;

  // Utility Actions
  resetStore: () => void;
  importData: (data: ResumeData) => void;
  autoGenerateResume: (data: ResumeData) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createSectionItem = (type: SectionType, fieldDefinitions?: CustomFieldDefinition[]): SectionItem => {
  const baseItem: SectionItem = { id: generateId() };

  switch (type) {
    case 'experience':
      return { ...baseItem, position: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    case 'education':
      return { ...baseItem, institution: '', degree: '', location: '', startDate: '', endDate: '', description: '' };
    case 'skills':
      return { ...baseItem, skills: [], skillsWithLevels: [] };
    case 'projects':
      return { ...baseItem, title: '', subtitle: '', startDate: '', endDate: '', description: '' };
    case 'certifications':
      return { ...baseItem, title: '', subtitle: '', startDate: '' };
    case 'custom':
      // Initialize custom fields based on field definitions
      const customFields: CustomFieldValue[] = fieldDefinitions?.map((fd) => ({
        fieldId: fd.id,
        value: fd.type === 'tags' ? [] : '',
      })) || [];
      return { ...baseItem, title: '', customFields };
    default:
      return baseItem;
  }
};

const createSection = (type: SectionType, template?: keyof typeof CUSTOM_FIELD_TEMPLATES): Section => {
  const titles: Record<SectionType, string> = {
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    custom: 'Custom Section',
  };

  const baseSection: Section = {
    id: generateId(),
    type,
    title: titles[type],
    isVisible: true,
    items: type === 'skills' ? [createSectionItem(type)] : [],
    fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
  };

  // Add field definitions for custom sections
  if (type === 'custom' && template) {
    const templateFields = CUSTOM_FIELD_TEMPLATES[template];
    baseSection.fieldDefinitions = templateFields.map((f) => ({
      ...f,
      id: generateId(),
    }));
    baseSection.title = template.charAt(0).toUpperCase() + template.slice(1);
  } else if (type === 'custom') {
    // Default basic template
    baseSection.fieldDefinitions = CUSTOM_FIELD_TEMPLATES.basic.map((f) => ({
      ...f,
      id: generateId(),
    }));
  }

  return baseSection;
};

// ============================================================================
// ZUSTAND STORE WITH PERSIST
// ============================================================================

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      // Initial State
      data: createEmptyState(),
      isDarkMode: false,
      isMobilePreview: false,

      // Personal Info Actions
      updatePersonalInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
          },
        })),

      addLink: (link) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: {
              ...state.data.personalInfo,
              links: [...state.data.personalInfo.links, { ...link, id: generateId() }],
            },
          },
        })),

      updateLink: (id, link) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: {
              ...state.data.personalInfo,
              links: state.data.personalInfo.links.map((l) =>
                l.id === id ? { ...l, ...link } : l
              ),
            },
          },
        })),

      removeLink: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: {
              ...state.data.personalInfo,
              links: state.data.personalInfo.links.filter((l) => l.id !== id),
            },
          },
        })),

      // Section Actions
      addSection: (type) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: [...state.data.sections, createSection(type)],
          },
        })),

      addCustomSection: (template) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: [...state.data.sections, createSection('custom', template)],
          },
        })),

      removeSection: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.filter((s) => s.id !== id),
          },
        })),

      updateSection: (id, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        })),

      toggleSectionVisibility: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === id ? { ...s, isVisible: !s.isVisible } : s
            ),
          },
        })),

      reorderSections: (activeId, overId) =>
        set((state) => {
          const sections = [...state.data.sections];
          const activeIndex = sections.findIndex((s) => s.id === activeId);
          const overIndex = sections.findIndex((s) => s.id === overId);

          if (activeIndex === -1 || overIndex === -1) return state;

          const [removed] = sections.splice(activeIndex, 1);
          sections.splice(overIndex, 0, removed);

          return { data: { ...state.data, sections } };
        }),

      updateSectionFontSize: (sectionId, type, size) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    fontSize: {
                      ...(s.fontSize || DEFAULT_SECTION_FONT_SIZE),
                      [type]: size,
                    },
                  }
                : s
            ),
          },
        })),

      // Custom Field Definition Actions
      addFieldDefinition: (sectionId, field) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    fieldDefinitions: [
                      ...(s.fieldDefinitions || []),
                      { ...field, id: generateId() },
                    ],
                  }
                : s
            ),
          },
        })),

      updateFieldDefinition: (sectionId, fieldId, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    fieldDefinitions: (s.fieldDefinitions || []).map((fd) =>
                      fd.id === fieldId ? { ...fd, ...updates } : fd
                    ),
                  }
                : s
            ),
          },
        })),

      removeFieldDefinition: (sectionId, fieldId) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    fieldDefinitions: (s.fieldDefinitions || []).filter(
                      (fd) => fd.id !== fieldId
                    ),
                    // Also remove the field values from items
                    items: s.items.map((item) => ({
                      ...item,
                      customFields: (item.customFields || []).filter(
                        (cf) => cf.fieldId !== fieldId
                      ),
                    })),
                  }
                : s
            ),
          },
        })),

      reorderFieldDefinitions: (sectionId, activeId, overId) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) => {
              if (s.id !== sectionId) return s;
              const fields = [...(s.fieldDefinitions || [])];
              const activeIndex = fields.findIndex((f) => f.id === activeId);
              const overIndex = fields.findIndex((f) => f.id === overId);
              if (activeIndex === -1 || overIndex === -1) return s;
              const [removed] = fields.splice(activeIndex, 1);
              fields.splice(overIndex, 0, removed);
              return { ...s, fieldDefinitions: fields };
            }),
          },
        })),

      // Section Item Actions
      addSectionItem: (sectionId) =>
        set((state) => {
          const section = state.data.sections.find((s) => s.id === sectionId);
          return {
            data: {
              ...state.data,
              sections: state.data.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, items: [...s.items, createSectionItem(s.type, section?.fieldDefinitions)] }
                  : s
              ),
            },
          };
        }),

      removeSectionItem: (sectionId, itemId) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
                : s
            ),
          },
        })),

      updateSectionItem: (sectionId, itemId, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) =>
                      i.id === itemId ? { ...i, ...updates } : i
                    ),
                  }
                : s
            ),
          },
        })),

      // Custom Field Value Actions
      updateCustomFieldValue: (sectionId, itemId, fieldId, value) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) => {
                      if (i.id !== itemId) return i;
                      const existingFields = i.customFields || [];
                      const fieldIndex = existingFields.findIndex(
                        (cf) => cf.fieldId === fieldId
                      );
                      if (fieldIndex >= 0) {
                        const newFields = [...existingFields];
                        newFields[fieldIndex] = { fieldId, value };
                        return { ...i, customFields: newFields };
                      } else {
                        return {
                          ...i,
                          customFields: [...existingFields, { fieldId, value }],
                        };
                      }
                    }),
                  }
                : s
            ),
          },
        })),

      // Skills with Levels Actions
      addSkillWithLevel: (sectionId, itemId, skill) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) =>
                      i.id === itemId
                        ? { ...i, skillsWithLevels: [...(i.skillsWithLevels || []), skill] }
                        : i
                    ),
                  }
                : s
            ),
          },
        })),

      updateSkillWithLevel: (sectionId, itemId, skillIndex, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) =>
                      i.id === itemId
                        ? {
                            ...i,
                            skillsWithLevels: (i.skillsWithLevels || []).map((sk, idx) =>
                              idx === skillIndex ? { ...sk, ...updates } : sk
                            ),
                          }
                        : i
                    ),
                  }
                : s
            ),
          },
        })),

      removeSkillWithLevel: (sectionId, itemId, skillIndex) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) =>
                      i.id === itemId
                        ? {
                            ...i,
                            skillsWithLevels: (i.skillsWithLevels || []).filter(
                              (_, idx) => idx !== skillIndex
                            ),
                          }
                        : i
                    ),
                  }
                : s
            ),
          },
        })),

      // Theme Actions
      updateTheme: (theme) =>
        set((state) => ({
          data: {
            ...state.data,
            theme: { ...state.data.theme, ...theme },
          },
        })),

      updateTypography: (type, size) =>
        set((state) => ({
          data: {
            ...state.data,
            theme: {
              ...state.data.theme,
              typography: {
                ...(state.data.theme.typography || DEFAULT_TYPOGRAPHY),
                [type]: size,
              },
            },
          },
        })),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      setMobilePreview: (show) => set({ isMobilePreview: show }),

      // Utility Actions
      resetStore: () => set({ data: createEmptyState() }),

      importData: (data) => set({ data }),
      autoGenerateResume: (data) => set({ data }),
    }),
    {
      name: 'resume-builder-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

// ============================================================================
// SELECTOR HOOKS FOR OPTIMIZED RERENDERS
// ============================================================================

export const usePersonalInfo = () => useResumeStore((state) => state.data.personalInfo);
export const useSections = () => useResumeStore((state) => state.data.sections);
export const useTheme = () => useResumeStore((state) => state.data.theme);
export const useIsDarkMode = () => useResumeStore((state) => state.isDarkMode);
export const useIsMobilePreview = () => useResumeStore((state) => state.isMobilePreview);
