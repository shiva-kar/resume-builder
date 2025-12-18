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
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  toggleSectionVisibility: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  updateSectionFontSize: (
    sectionId: string,
    type: keyof SectionTypeFontSize,
    size: TextSize
  ) => void;

  // Section Item Actions
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  updateSectionItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<SectionItem>
  ) => void;

  // Theme Actions
  updateTheme: (theme: Partial<Theme>) => void;
  toggleDarkMode: () => void;
  setMobilePreview: (show: boolean) => void;

  // Utility Actions
  resetStore: () => void;
  importData: (data: ResumeData) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createSectionItem = (type: SectionType): SectionItem => {
  const baseItem: SectionItem = { id: generateId() };
  
  switch (type) {
    case 'experience':
      return { ...baseItem, position: '', company: '', startDate: '', endDate: '', current: false, description: '' };
    case 'education':
      return { ...baseItem, institution: '', degree: '', startDate: '', endDate: '', description: '' };
    case 'skills':
      return { ...baseItem, skills: [] };
    case 'projects':
      return { ...baseItem, title: '', subtitle: '', startDate: '', endDate: '', description: '' };
    case 'certifications':
      return { ...baseItem, title: '', subtitle: '', startDate: '' };
    case 'custom':
      return { ...baseItem, title: '', subtitle: '', description: '' };
    default:
      return baseItem;
  }
};

const createSection = (type: SectionType): Section => {
  const titles: Record<SectionType, string> = {
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    custom: 'Custom Section',
  };

  return {
    id: generateId(),
    type,
    title: titles[type],
    isVisible: true,
    items: type === 'skills' ? [createSectionItem(type)] : [],
    fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
  };
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

      // Section Item Actions
      addSectionItem: (sectionId) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: state.data.sections.map((s) =>
              s.id === sectionId
                ? { ...s, items: [...s.items, createSectionItem(s.type)] }
                : s
            ),
          },
        })),

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

      // Theme Actions
      updateTheme: (theme) =>
        set((state) => ({
          data: {
            ...state.data,
            theme: { ...state.data.theme, ...theme },
          },
        })),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),

      setMobilePreview: (show) => set({ isMobilePreview: show }),

      // Utility Actions
      resetStore: () => set({ data: createEmptyState() }),

      importData: (data) => set({ data }),
    }),
    {
      name: 'resume-builder-storage',
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
