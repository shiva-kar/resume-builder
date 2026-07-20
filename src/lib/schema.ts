import { z } from 'zod';

// LINK ICON TYPES

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

// SKILL LEVELS

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export interface SkillWithLevel {
  name: string;
  level: SkillLevel;
}

// ACCENT COLOR PRESETS - Refined Palette

export const ACCENT_COLORS = [
  // Neutrals
  { color: '#1a1a2e', name: 'Charcoal' },
  { color: '#374151', name: 'Slate' },
  // Blues
  { color: '#2563eb', name: 'Azure' },
  { color: '#0ea5e9', name: 'Sky' },
  { color: '#0d9488', name: 'Teal' },
  // Warm
  { color: '#dc2626', name: 'Crimson' },
  { color: '#ea580c', name: 'Amber' },
  { color: '#ca8a04', name: 'Gold' },
  // Cool
  { color: '#7c3aed', name: 'Violet' },
  { color: '#db2777', name: 'Rose' },
  { color: '#059669', name: 'Emerald' },
] as const;

// TEMPLATE METADATA - For UI Display

export const TEMPLATE_INFO = {
  harvard: {
    name: 'Academic Classic',
    description: 'Traditional academic style with serif typography',
    category: 'professional',
  },
  tech: {
    name: 'Modern Tech',
    description: 'Clean and modern with accent colors',
    category: 'modern',
  },
  minimal: {
    name: 'Minimal Light',
    description: 'Ultra-clean with lots of whitespace',
    category: 'minimal',
  },
  bold: {
    name: 'Bold Statement',
    description: 'High-contrast with strong typography',
    category: 'creative',
  },
  neo: {
    name: 'Neo Geometric',
    description: 'Sharp edges with geometric accents',
    category: 'modern',
  },
  portfolio: {
    name: 'Portfolio Grid',
    description: 'Two-column layout for creatives',
    category: 'creative',
  },
  corporate: {
    name: 'Corporate Clean',
    description: 'Professional and business-ready',
    category: 'professional',
  },
  creative: {
    name: 'Creative Studio',
    description: 'Expressive layout for designers',
    category: 'creative',
  },
  elegant: {
    name: 'Elegant Serif',
    description: 'Refined typography with subtle details',
    category: 'professional',
  },
  modern: {
    name: 'Modern Edge',
    description: 'Contemporary with clean lines',
    category: 'modern',
  },
} as const;

// CUSTOM FIELD TYPES - For custom sections

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
    { id: 'description', type: 'textarea' as const, label: 'Description' },
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

// TYPOGRAPHY SIZE OPTIONS

export const TYPOGRAPHY_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export type TypographySize = typeof TYPOGRAPHY_SIZES[number];

export interface TypographySettings {
  name: TypographySize;
  headers: TypographySize;
  body: TypographySize;
  experience: TypographySize;
  skills: TypographySize;
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  name: 'lg',
  headers: 'md',
  body: 'sm',
  experience: 'sm',
  skills: 'sm',
};

// ZOD SCHEMAS - Validation Layer

export const MetadataSchema = z.object({
  template: z.string(),
  theme: z.string(),
  paperSize: z.enum(['a4', 'letter', 'a5']).default('a4'),
  font: z.string().optional(),
  color: z.string().optional(),
});

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
  title: z.string().optional(), // Job Title
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  summary: z.string(), // Headline
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
  type: z.enum(['experience', 'education', 'skills', 'custom', 'projects', 'certifications', 'volunteer', 'awards', 'publications']),
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
  experience: z.enum(['sm', 'md', 'lg', 'xl']).default('sm'),
  skills: z.enum(['sm', 'md', 'lg', 'xl']).default('sm'),
});


// OPACITY LEVELS
export const OPACITY_LEVELS = ['light', 'medium', 'dark', 'solid'] as const;
export type OpacityLevel = typeof OPACITY_LEVELS[number];

export interface OpacitySettings {
  name: OpacityLevel;
  headers: OpacityLevel;
  subheaders: OpacityLevel;
  body: OpacityLevel;
  skills: OpacityLevel;
}

export const DEFAULT_OPACITY: OpacitySettings = {
  name: 'solid',
  headers: 'solid',
  subheaders: 'solid',
  body: 'solid',
  skills: 'solid',
};

export const OpacitySettingsSchema = z.object({
  name: z.enum(['light', 'medium', 'dark', 'solid']),
  headers: z.enum(['light', 'medium', 'dark', 'solid']),
  subheaders: z.enum(['light', 'medium', 'dark', 'solid']),
  body: z.enum(['light', 'medium', 'dark', 'solid']),
  skills: z.enum(['light', 'medium', 'dark', 'solid']),
});

export const OPACITY_LEVEL_MAP = {
  light: 0.4,
  medium: 0.6,
  dark: 0.8,
  solid: 1.0,
};


export const ThemeSchema = z.object({
  template: z.enum([
    'harvard',
    'tech',
    'minimal',
    'bold',
    'neo',
    'portfolio',
    'corporate',
    'creative',
    'elegant',
    'modern'
  ]),
  color: z.string(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  opacity: OpacitySettingsSchema.optional(),
  fontSize: z.enum(['small', 'medium', 'large']),
  pageSize: z.enum(['A4', 'LETTER', 'LEGAL', 'EXECUTIVE', 'B5', 'A5']),
  typography: TypographySettingsSchema.optional(),
  autoAdjust: z.boolean().optional(), // Auto-adjust page size/font if content overflows
  recentColors: z.array(z.string()).optional(), // Recently used custom colors
  recentBackgroundColors: z.array(z.string()).optional(), // Recently used custom background colors
  recentTextColors: z.array(z.string()).optional(), // Recently used custom text colors
});

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  sections: z.array(SectionSchema),
  theme: ThemeSchema,
});

// TYPESCRIPT TYPES - Inferred from Zod Schemas

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

// PAGE SIZE DIMENSIONS (in points for PDF)

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

// FONT SIZE MAPPINGS (in points for PDF)

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

// DEFAULT VALUES - Empty/Placeholder State

export const DEFAULT_SECTION_FONT_SIZE: SectionTypeFontSize = {
  heading: 'lg',
  subheading: 'base',
  body: 'sm',
};

export const createEmptyState = (): ResumeData => ({
  personalInfo: {
    fullName: '',
    title: '',
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
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    opacity: { ...DEFAULT_OPACITY },
    fontSize: 'medium',
    pageSize: 'A4',
    typography: { ...DEFAULT_TYPOGRAPHY },
  },
});

export const createDummyState = (currentTheme?: Theme): ResumeData => ({
  personalInfo: {
    fullName: 'Jane Doe',
    title: 'Senior Software Engineer',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'A brief professional summary highlighting key skills, experience, and career objectives. Built responsive applications and scaled infrastructure.',
    website: 'https://janedoe.com',
    linkedin: 'https://linkedin.com/in/janedoe',
    github: 'https://github.com/janedoe',
    links: [],
  },
  sections: [
    {
      id: 'experience-dummy',
      type: 'experience',
      title: 'Experience',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'exp-1',
          position: 'Senior Software Engineer',
          company: 'Technology Company',
          location: 'San Francisco, CA',
          startDate: '2021-01',
          endDate: '',
          current: true,
          description: '• Led development of key features resulting in 40% performance improvement\n• Mentored junior developers and conducted code reviews\n• Collaborated with cross-functional teams on product roadmap',
        },
        {
          id: 'exp-2',
          position: 'Software Developer',
          company: 'Digital Agency',
          location: 'New York, NY',
          startDate: '2018-06',
          endDate: '2020-12',
          current: false,
          description: '• Built responsive web applications using modern frameworks\n• Implemented CI/CD pipelines reducing deployment time by 60%',
        }
      ],
    },
    {
      id: 'education-dummy',
      type: 'education',
      title: 'Education',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Science in Computer Science',
          institution: 'State University',
          location: 'Boston, MA',
          startDate: '2014-09',
          endDate: '2018-05',
          description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering',
        }
      ]
    },
    {
      id: 'skills-dummy',
      type: 'skills',
      title: 'Skills',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [{
        id: 'skills-1',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker'],
        skillsWithLevels: [
          { name: 'TypeScript', level: 'Expert' },
          { name: 'React', level: 'Advanced' }
        ]
      }]
    },
    {
      id: 'projects-dummy',
      type: 'projects',
      title: 'Projects',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'proj-1',
          title: 'E-Commerce Platform',
          subtitle: 'https://github.com/example/ecommerce',
          startDate: '2022-01',
          endDate: '2022-06',
          current: false,
          skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          description: '• Developed a full-stack e-commerce platform serving 10k+ monthly users\n• Implemented secure payment processing and real-time inventory management',
        }
      ]
    },
    {
      id: 'certifications-dummy',
      type: 'certifications',
      title: 'Certifications',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'cert-1',
          title: 'AWS Certified Solutions Architect',
          institution: 'Amazon Web Services',
          subtitle: 'https://aws.amazon.com/verification',
          startDate: '2023-08',
          endDate: '',
          current: false,
          description: '• Validates expertise in designing distributed systems on AWS',
        }
      ]
    },
    {
      id: 'volunteer-dummy',
      type: 'volunteer',
      title: 'Volunteer Experience',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'vol-1',
          position: 'Community Outreach Lead',
          company: 'Habitat for Humanity',
          location: 'Austin, TX',
          startDate: '2020-03',
          endDate: '2022-12',
          current: false,
          description: '• Organized weekly building events with 50+ volunteers\n• Coordinated logistics for 12 housing projects',
        }
      ]
    },
    {
      id: 'awards-dummy',
      type: 'awards',
      title: 'Awards & Honors',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'award-1',
          title: 'Dean\'s List',
          institution: 'State University',
          startDate: '2017-05',
          description: '• Recognized for maintaining a 3.9+ GPA across 4 consecutive semesters',
        }
      ]
    },
    {
      id: 'publications-dummy',
      type: 'publications',
      title: 'Publications',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      items: [
        {
          id: 'pub-1',
          title: 'Scalable Microservice Architectures',
          institution: 'IEEE Software Journal',
          subtitle: 'https://doi.org/example',
          startDate: '2023-03',
          description: '• Published peer-reviewed paper on event-driven microservice patterns',
        }
      ]
    },
    {
      id: 'custom-dummy',
      type: 'custom',
      title: 'Languages',
      isVisible: true,
      fontSize: { ...DEFAULT_SECTION_FONT_SIZE },
      fieldDefinitions: [
        { id: 'field-1', type: 'text', label: 'Language' },
        { id: 'field-2', type: 'text', label: 'Proficiency' }
      ],
      items: [
        {
          id: 'custom-item-1',
          customFields: [
            { fieldId: 'field-1', value: 'English' },
            { fieldId: 'field-2', value: 'Native/Bilingual' }
          ]
        },
        {
          id: 'custom-item-2',
          customFields: [
            { fieldId: 'field-1', value: 'Spanish' },
            { fieldId: 'field-2', value: 'Professional Working' }
          ]
        }
      ]
    },
  ],
  theme: currentTheme || {
    template: 'tech',
    color: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    opacity: { ...DEFAULT_OPACITY },
    fontSize: 'medium',
    pageSize: 'A4',
    typography: { ...DEFAULT_TYPOGRAPHY },
  },
});
