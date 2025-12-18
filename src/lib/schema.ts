import { z } from 'zod';

// ============================================================================
// LINK ICON TYPES
// ============================================================================

export const LINK_ICONS = {
  linkedin: { label: 'LinkedIn', pattern: /linkedin\.com/i },
  github: { label: 'GitHub', pattern: /github\.com/i },
  twitter: { label: 'X (Twitter)', pattern: /twitter\.com|x\.com/i },
  facebook: { label: 'Facebook', pattern: /facebook\.com/i },
  instagram: { label: 'Instagram', pattern: /instagram\.com/i },
  youtube: { label: 'YouTube', pattern: /youtube\.com/i },
  dribbble: { label: 'Dribbble', pattern: /dribbble\.com/i },
  behance: { label: 'Behance', pattern: /behance\.net/i },
  medium: { label: 'Medium', pattern: /medium\.com/i },
  stackoverflow: { label: 'Stack Overflow', pattern: /stackoverflow\.com/i },
  portfolio: { label: 'Portfolio', pattern: /portfolio|\.dev|\.design/i },
  website: { label: 'Website', pattern: /.*/ },
} as const;

export type LinkIconType = keyof typeof LINK_ICONS;

export const detectLinkIcon = (url: string): LinkIconType => {
  for (const [key, value] of Object.entries(LINK_ICONS)) {
    if (key !== 'website' && value.pattern.test(url)) {
      return key as LinkIconType;
    }
  }
  return 'website';
};

// ============================================================================
// ZOD SCHEMAS - Validation Layer
// ============================================================================

export const LinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  icon: z.string().optional(),
});

export const PersonalInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  links: z.array(LinkSchema),
});

export const SectionItemSchema = z.object({
  id: z.string(),
  // Experience fields
  position: z.string().optional(),
  company: z.string().optional(),
  // Education fields
  institution: z.string().optional(),
  degree: z.string().optional(),
  // Common fields
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  // Custom section fields
  title: z.string().optional(),
  subtitle: z.string().optional(),
  // Skills fields
  skills: z.array(z.string()).optional(),
});

export const SectionTypeFontSizeSchema = z.object({
  heading: z.enum(['xs', 'sm', 'base', 'lg', 'xl']),
  subheading: z.enum(['xs', 'sm', 'base', 'lg', 'xl']),
  body: z.enum(['xs', 'sm', 'base', 'lg', 'xl']),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: z.enum(['experience', 'education', 'skills', 'custom', 'projects', 'certifications']),
  title: z.string(),
  isVisible: z.boolean(),
  items: z.array(SectionItemSchema),
  fontSize: SectionTypeFontSizeSchema.optional(),
});

export const ThemeSchema = z.object({
  template: z.enum(['harvard', 'tech', 'minimal']),
  color: z.string(),
  fontSize: z.enum(['small', 'medium', 'large']),
  pageSize: z.enum(['A4', 'LETTER', 'LEGAL']),
});

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  sections: z.array(SectionSchema),
  theme: ThemeSchema,
});

// ============================================================================
// TYPESCRIPT TYPES - Inferred from Zod Schemas
// ============================================================================

export type Link = z.infer<typeof LinkSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type SectionItem = z.infer<typeof SectionItemSchema>;
export type SectionTypeFontSize = z.infer<typeof SectionTypeFontSizeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section['type'];
export type Theme = z.infer<typeof ThemeSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type PageSize = Theme['pageSize'];
export type FontSizeLevel = Theme['fontSize'];
export type TemplateType = Theme['template'];
export type TextSize = SectionTypeFontSize['heading'];

// ============================================================================
// PAGE SIZE DIMENSIONS (in points for PDF)
// ============================================================================

export const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89, label: 'A4 (210 × 297 mm)' },
  LETTER: { width: 612, height: 792, label: 'Letter (8.5 × 11 in)' },
  LEGAL: { width: 612, height: 1008, label: 'Legal (8.5 × 14 in)' },
} as const;

// ============================================================================
// FONT SIZE MAPPINGS (in points for PDF)
// ============================================================================

export const PDF_FONT_SIZES = {
  xs: 8,
  sm: 10,
  base: 12,
  lg: 14,
  xl: 16,
} as const;

export const GLOBAL_FONT_SCALES = {
  small: 0.85,
  medium: 1,
  large: 1.15,
} as const;

// ============================================================================
// DEFAULT VALUES - Empty/Placeholder State
// ============================================================================

export const DEFAULT_SECTION_FONT_SIZE: SectionTypeFontSize = {
  heading: 'lg',
  subheading: 'base',
  body: 'sm',
};

export const createEmptyState = (): ResumeData => ({
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    links: [],
  },
  sections: [
    {
      id: 'experience-default',
      type: 'experience',
      title: 'Experience',
      isVisible: true,
      items: [],
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
    },
    {
      id: 'education-default',
      type: 'education',
      title: 'Education',
      isVisible: true,
      items: [],
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
    },
    {
      id: 'skills-default',
      type: 'skills',
      title: 'Skills',
      isVisible: true,
      items: [{ id: 'skills-item-default', skills: [] }],
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
    },
  ],
  theme: {
    template: 'tech',
    color: '#3b82f6',
    fontSize: 'medium',
    pageSize: 'A4',
  },
});
