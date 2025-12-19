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
// SKILL LEVELS
// ============================================================================

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export interface SkillWithLevel {
  name: string;
  level: SkillLevel;
}

// ============================================================================
// ACCENT COLOR PRESETS
// ============================================================================

export const ACCENT_COLORS = [
  { color: '#000000', name: 'Black' },
  { color: '#2563eb', name: 'Blue' },
  { color: '#dc2626', name: 'Red' },
  { color: '#16a34a', name: 'Green' },
  { color: '#9333ea', name: 'Purple' },
  { color: '#ea580c', name: 'Orange' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#be185d', name: 'Pink' },
] as const;

// ============================================================================
// CUSTOM FIELD TYPES - For custom sections
// ============================================================================

export const CUSTOM_FIELD_TYPES = ['text', 'textarea', 'date', 'dateRange', 'link', 'tags'] as const;
export type CustomFieldType = typeof CUSTOM_FIELD_TYPES[number];

export interface CustomFieldDefinition {
  id: string;
  type: CustomFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | string[]; // string[] for tags type
}

// Default field templates for quick setup
export const CUSTOM_FIELD_TEMPLATES = {
  basic: [
    { id: 'title', type: 'text' as const, label: 'Title', required: true },
    { id: 'description', type: 'textarea' as const, label: 'Description' },
  ],
  project: [
    { id: 'title', type: 'text' as const, label: 'Project Name', required: true },
    { id: 'link', type: 'link' as const, label: 'Project URL' },
    { id: 'date', type: 'dateRange' as const, label: 'Duration' },
    { id: 'tags', type: 'tags' as const, label: 'Technologies' },
    { id: 'description', type: 'textarea' as const, label: 'Description' },
  ],
  certification: [
    { id: 'title', type: 'text' as const, label: 'Certification Name', required: true },
    { id: 'issuer', type: 'text' as const, label: 'Issuing Organization' },
    { id: 'date', type: 'date' as const, label: 'Date Obtained' },
    { id: 'link', type: 'link' as const, label: 'Credential URL' },
  ],
  publication: [
    { id: 'title', type: 'text' as const, label: 'Title', required: true },
    { id: 'publisher', type: 'text' as const, label: 'Publisher/Journal' },
    { id: 'date', type: 'date' as const, label: 'Publication Date' },
    { id: 'link', type: 'link' as const, label: 'Link' },
    { id: 'description', type: 'textarea' as const, label: 'Abstract/Summary' },
  ],
  award: [
    { id: 'title', type: 'text' as const, label: 'Award Name', required: true },
    { id: 'issuer', type: 'text' as const, label: 'Issuing Organization' },
    { id: 'date', type: 'date' as const, label: 'Date Received' },
    { id: 'description', type: 'textarea' as const, label: 'Description' },
  ],
  volunteer: [
    { id: 'role', type: 'text' as const, label: 'Role', required: true },
    { id: 'org', type: 'text' as const, label: 'Organization' },
    { id: 'date', type: 'dateRange' as const, label: 'Duration' },
    { id: 'description', type: 'textarea' as const, label: 'Description' },
  ],
} as const;

// ============================================================================
// TYPOGRAPHY SIZE OPTIONS
// ============================================================================

export const TYPOGRAPHY_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export type TypographySize = typeof TYPOGRAPHY_SIZES[number];

export interface TypographySettings {
  name: TypographySize;
  headers: TypographySize;
  body: TypographySize;
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  name: 'lg',
  headers: 'md',
  body: 'sm',
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

export const SkillWithLevelSchema = z.object({
  name: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
});

export const PersonalInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  summary: z.string(), // Job title / headline
  website: z.string(), // Dedicated website field
  linkedin: z.string(), // Dedicated linkedin field
  github: z.string(), // Dedicated github field
  links: z.array(LinkSchema), // Additional custom links
});

export const CustomFieldDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'textarea', 'date', 'dateRange', 'link', 'tags']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

export const CustomFieldValueSchema = z.object({
  fieldId: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
});

export const SectionItemSchema = z.object({
  id: z.string(),
  position: z.string().optional(),
  company: z.string().optional(),
  institution: z.string().optional(),
  degree: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  skills: z.array(z.string()).optional(),
  skillsWithLevels: z.array(SkillWithLevelSchema).optional(),
  // Custom field values for custom sections
  customFields: z.array(CustomFieldValueSchema).optional(),
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
  // Custom field definitions - only for custom sections
  fieldDefinitions: z.array(CustomFieldDefinitionSchema).optional(),
});

export const TypographySettingsSchema = z.object({
  name: z.enum(['sm', 'md', 'lg', 'xl']),
  headers: z.enum(['sm', 'md', 'lg', 'xl']),
  body: z.enum(['sm', 'md', 'lg', 'xl']),
});

export const ThemeSchema = z.object({
  template: z.enum(['harvard', 'tech', 'minimal']),
  color: z.string(),
  fontSize: z.enum(['small', 'medium', 'large']),
  pageSize: z.enum(['A4', 'LETTER', 'LEGAL', 'EXECUTIVE', 'B5', 'A5']),
  typography: TypographySettingsSchema.optional(),
  autoAdjust: z.boolean().optional(), // Auto-adjust page size/font if content overflows
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
export type CustomFieldDef = z.infer<typeof CustomFieldDefinitionSchema>;
export type CustomFieldVal = z.infer<typeof CustomFieldValueSchema>;

// ============================================================================
// PAGE SIZE DIMENSIONS (in points for PDF)
// ============================================================================

export const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89, label: 'A4 (210 x 297 mm)' },
  LETTER: { width: 612, height: 792, label: 'US Letter (8.5 x 11 in)' },
  LEGAL: { width: 612, height: 1008, label: 'US Legal (8.5 x 14 in)' },
  EXECUTIVE: { width: 522, height: 756, label: 'Executive (7.25 x 10.5 in)' },
  B5: { width: 498.9, height: 708.66, label: 'B5 (176 x 250 mm)' },
  A5: { width: 419.53, height: 595.28, label: 'A5 (148 x 210 mm)' },
} as const;

// Ordered by height for auto-adjustment (smallest to largest)
export const PAGE_SIZES_BY_HEIGHT = ['A5', 'EXECUTIVE', 'B5', 'LETTER', 'A4', 'LEGAL'] as const;

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

export const TYPOGRAPHY_SIZE_MAP = {
  sm: { name: 'text-xl', headers: 'text-sm', body: 'text-[10px]' },
  md: { name: 'text-2xl', headers: 'text-base', body: 'text-[11px]' },
  lg: { name: 'text-4xl', headers: 'text-lg', body: 'text-[12px]' },
  xl: { name: 'text-5xl', headers: 'text-xl', body: 'text-[14px]' },
};

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
    summary: '',
    website: '',
    linkedin: '',
    github: '',
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
      items: [{ id: 'skills-item-default', skills: [], skillsWithLevels: [] }],
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
    },
  ],
  theme: {
    template: 'tech',
    color: '#2563eb',
    fontSize: 'medium',
    pageSize: 'A4',
    typography: { ...DEFAULT_TYPOGRAPHY },
  },
});
