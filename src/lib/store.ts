import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';
import {
  ResumeData,
  PersonalInfo,
  Section,
  SectionItem,
  SectionType,
  Theme,
  Link,
  createEmptyState,
  createDummyState,
  DEFAULT_SECTION_FONT_SIZE,
  SectionTypeFontSize,
  TextSize,
  TypographySettings,
  TypographySize,
  DEFAULT_TYPOGRAPHY,
  OpacitySettings,
  OpacityLevel,
  DEFAULT_OPACITY,
  SkillWithLevel,
  CustomFieldDefinition,
  CustomFieldValue,
  CUSTOM_FIELD_TEMPLATES,
  ACCENT_COLORS,
} from './schema';

// STORE INTERFACE

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
  convertToCustomSection: (sectionId: string) => void;
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

  // Theme & Layout
  updateTheme: (theme: Partial<Theme>) => void;
  addRecentColor: (color: string) => void;
  addRecentBackgroundColor: (color: string) => void;
  addRecentTextColor: (color: string) => void;
  updateTypography: (type: keyof TypographySettings, size: TypographySize) => void;
  updateOpacity: (type: keyof OpacitySettings, level: OpacityLevel) => void;
  toggleDarkMode: () => void;
  setMobilePreview: (show: boolean) => void;

  // Utility Actions
  resetStore: () => void;
  importData: (data: ResumeData) => void;
  autoGenerateResume: (data: ResumeData) => void;
}

// HELPER FUNCTIONS

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

  // Add field definitions for custom sections and built-in types that use CustomSectionForm
  if (type === 'certifications') {
    baseSection.fieldDefinitions = CUSTOM_FIELD_TEMPLATES.certification.map((f) => ({
      ...f,
      id: generateId(),
    }));
  } else if (type === 'projects') {
    baseSection.fieldDefinitions = CUSTOM_FIELD_TEMPLATES.project.map((f) => ({
      ...f,
      id: generateId(),
    }));
  } else if (type === 'custom' && template) {
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

// ZUSTAND STORE WITH PERSIST

export const useResumeStore = create<ResumeStore>()(
  temporal(
    persist(
      (set, get) => ({
      // Initial State
      data: createEmptyState(),
      isDarkMode: false,
      isMobilePreview: false,

      // Personal Info Actions
      updatePersonalInfo: (info) =>
        set((state) => {
          if (info.fullName === 'DEV_DUMMY_FILL') {
            return {
              data: {
                ...createDummyState(state.data.theme),
              },
            };
          }
          return {
            data: {
              ...state.data,
              personalInfo: { ...state.data.personalInfo, ...info },
            },
          };
        }),

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

      convertToCustomSection: (id) =>
        set((state) => {
          const sectionIndex = state.data.sections.findIndex(s => s.id === id);
          if (sectionIndex === -1) return state;

          const section = state.data.sections[sectionIndex];
          if (section.type === 'custom') return state; // Already custom

          let newFieldDefinitions: CustomFieldDefinition[] = [];
          
          if (section.type === 'experience') {
            newFieldDefinitions = [
              { id: 'position', type: 'text', label: 'Position / Title', required: true },
              { id: 'company', type: 'text', label: 'Company Name' },
              { id: 'location', type: 'text', label: 'Location' },
              { id: 'date', type: 'dateRange', label: 'Duration' },
              { id: 'description', type: 'textarea', label: 'Description' }
            ];
          } else if (section.type === 'education') {
            newFieldDefinitions = [
              { id: 'degree', type: 'text', label: 'Degree / Program', required: true },
              { id: 'institution', type: 'text', label: 'Institution' },
              { id: 'location', type: 'text', label: 'Location' },
              { id: 'date', type: 'dateRange', label: 'Duration' },
              { id: 'description', type: 'textarea', label: 'Description' }
            ];
          } else if (section.type === 'skills') {
            newFieldDefinitions = [
              { id: 'category', type: 'text', label: 'Category', required: true },
              { id: 'skills', type: 'tags', label: 'Skills' }
            ];
          } else if (section.type === 'projects') {
            newFieldDefinitions = [...CUSTOM_FIELD_TEMPLATES.project];
          } else if (section.type === 'certifications') {
            newFieldDefinitions = [...CUSTOM_FIELD_TEMPLATES.certification];
          }

          const newItems = section.items.map(item => {
            const customFields = [];
            if (section.type === 'experience') {
              customFields.push({ fieldId: 'position', value: item.position || '' });
              customFields.push({ fieldId: 'company', value: item.company || '' });
              customFields.push({ fieldId: 'location', value: item.location || '' });
              customFields.push({ fieldId: 'date', value: `${item.startDate || ''}|${item.current ? 'Present' : (item.endDate || '')}` });
              customFields.push({ fieldId: 'description', value: item.description || '' });
            } else if (section.type === 'education') {
              customFields.push({ fieldId: 'degree', value: item.degree || '' });
              customFields.push({ fieldId: 'institution', value: item.institution || '' });
              customFields.push({ fieldId: 'location', value: item.location || '' });
              customFields.push({ fieldId: 'date', value: `${item.startDate || ''}|${item.current ? 'Present' : (item.endDate || '')}` });
              customFields.push({ fieldId: 'description', value: item.description || '' });
            } else if (section.type === 'skills') {
              const combinedSkills = [
                ...(item.skillsWithLevels || []).map(s => `${s.name}${s.level ? ` (${s.level})` : ''}`),
                ...(item.skills || [])
              ];
              customFields.push({ fieldId: 'category', value: item.title || '' });
              customFields.push({ fieldId: 'skills', value: combinedSkills });
            } else if (section.type === 'projects') {
              customFields.push({ fieldId: 'title', value: item.title || '' });
              customFields.push({ fieldId: 'link', value: item.subtitle || '' });
              customFields.push({ fieldId: 'date', value: `${item.startDate || ''}|${item.current ? 'Present' : (item.endDate || '')}` });
              customFields.push({ fieldId: 'description', value: item.description || '' });
            } else if (section.type === 'certifications') {
              customFields.push({ fieldId: 'title', value: item.title || '' });
              customFields.push({ fieldId: 'issuer', value: item.institution || '' });
              customFields.push({ fieldId: 'date', value: item.startDate || '' });
            }
            return {
              id: item.id,
              customFields
            };
          });

          const newSections = [...state.data.sections];
          newSections[sectionIndex] = {
            ...section,
            type: 'custom',
            fieldDefinitions: newFieldDefinitions,
            items: newItems
          };

          return {
            data: {
              ...state.data,
              sections: newSections
            }
          };
        }),

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
        set((state) => {
          const newTheme = { ...state.data.theme, ...theme };
          return {
            data: {
              ...state.data,
              theme: newTheme,
            },
          };
        }),

      addRecentColor: (color) =>
        set((state) => {
          const isPresetColor = ACCENT_COLORS.some(c => c.color.toLowerCase() === color.toLowerCase());
          if (isPresetColor) return state; // Don't add presets to recent
          
          const recentColors = state.data.theme.recentColors || [];
          // If it's already in recent colors, don't move it to the front! 
          // Just leave it where it is.
          if (recentColors.some(c => c.toLowerCase() === color.toLowerCase())) {
            return state;
          }
          
          return {
            data: {
              ...state.data,
              theme: {
                ...state.data.theme,
                // Append custom colors (no limit)
                recentColors: [...recentColors, color],
              },
            },
          };
        }),

      addRecentBackgroundColor: (color) =>
        set((state) => {
          const recentBackgroundColors = state.data.theme.recentBackgroundColors || [];
          
          // Don't add if it's already the most recent
          if (recentBackgroundColors[recentBackgroundColors.length - 1] === color) {
            return state;
          }
          
          return {
            data: {
              ...state.data,
              theme: {
                ...state.data.theme,
                // Append custom background colors (no limit)
                recentBackgroundColors: [...recentBackgroundColors, color],
              },
            },
          };
        }),

      addRecentTextColor: (color) =>
        set((state) => {
          const recentTextColors = state.data.theme.recentTextColors || [];
          
          if (recentTextColors[recentTextColors.length - 1] === color) {
            return state;
          }
          
          return {
            data: {
              ...state.data,
              theme: {
                ...state.data.theme,
                recentTextColors: [...recentTextColors, color],
              },
            },
          };
        }),

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
      updateOpacity: (type, level) =>
        set((state) => ({
          data: {
            ...state.data,
            theme: {
              ...state.data.theme,
              opacity: {
                ...(state.data.theme.opacity || DEFAULT_OPACITY),
                [type]: level,
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
  ),
  {
    partialize: (state) => ({ data: state.data }),
    limit: 50,
  }
)
);

// SELECTOR HOOKS FOR OPTIMIZED RERENDERS

export const usePersonalInfo = () => useResumeStore((state) => state.data.personalInfo);
export const useSections = () => useResumeStore((state) => state.data.sections);
export const useTheme = () => useResumeStore((state) => state.data.theme);
export const useIsDarkMode = () => useResumeStore((state) => state.isDarkMode);
export const useIsMobilePreview = () => useResumeStore((state) => state.isMobilePreview);
