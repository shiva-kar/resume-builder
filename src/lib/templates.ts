/**
 * Template configuration shared between PreviewCanvas and ResumePDF.
 * Contains font mappings, style constants, and template metadata.
 */

import type { TemplateType } from './schema';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

/**
 * Font family mapping for PDF templates
 * Note: PDF renderer only supports built-in fonts (Times-Roman, Helvetica, Courier)
 */
export const TEMPLATE_FONTS: Record<TemplateType, string> = {
  harvard: 'Times-Roman',
  tech: 'Helvetica',
  minimal: 'Helvetica',
  bold: 'Helvetica',
  neo: 'Helvetica',
  portfolio: 'Helvetica',
  corporate: 'Helvetica',
  creative: 'Helvetica',
  elegant: 'Times-Roman',
  modern: 'Helvetica',
};

/**
 * CSS font family mapping for Preview templates
 */
export const TEMPLATE_CSS_FONTS: Record<TemplateType, string> = {
  harvard: 'Georgia, "Times New Roman", serif',
  tech: 'Inter, system-ui, sans-serif',
  minimal: 'Inter, system-ui, sans-serif',
  bold: 'Inter, system-ui, sans-serif',
  neo: 'Inter, system-ui, sans-serif',
  portfolio: 'Inter, system-ui, sans-serif',
  corporate: 'Inter, system-ui, sans-serif',
  creative: 'Inter, system-ui, sans-serif',
  elegant: 'Georgia, "Times New Roman", serif',
  modern: 'Inter, system-ui, sans-serif',
};

/**
 * Templates that use serif fonts
 */
export const SERIF_TEMPLATES: TemplateType[] = ['harvard', 'elegant'];

/**
 * Check if a template uses serif fonts
 */
export const isSerifTemplate = (template: TemplateType): boolean =>
  SERIF_TEMPLATES.includes(template);

// ============================================================================
// PAGE BACKGROUNDS
// ============================================================================

/**
 * Template-specific page background colors
 * These should match between Preview and PDF for visual consistency
 */
export const TEMPLATE_BACKGROUNDS: Partial<Record<TemplateType, string>> = {
  elegant: '#fdfbf7', // Warm cream/off-white
};

/**
 * Get the background color for a template (or white if none)
 */
export const getTemplateBackground = (template: TemplateType): string =>
  TEMPLATE_BACKGROUNDS[template] || '#ffffff';

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

/**
 * Templates with sidebar layouts
 */
export const SIDEBAR_TEMPLATES: TemplateType[] = ['portfolio', 'modern'];

/**
 * Check if template has sidebar layout
 */
export const hasSidebarLayout = (template: TemplateType): boolean =>
  SIDEBAR_TEMPLATES.includes(template);

/**
 * Sidebar width ratio (0.35 = 35% sidebar, 65% main)
 */
export const SIDEBAR_WIDTH_RATIO = 0.35;

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

/**
 * Common spacing values (in points for PDF, pixels for Preview)
 */
export const SPACING = {
  page: 40,
  sectionGap: 12,
  itemGap: 8,
  lineHeight: 1.4,
} as const;

/**
 * Common font sizes for section content
 */
export const SECTION_FONT_SIZES = {
  sectionHeading: 14,
  itemTitle: 13,
  itemSubtitle: 11,
  itemBody: 10,
  itemDate: 9,
} as const;

// ============================================================================
// CONTACT ICON TYPES
// ============================================================================

export type ContactIconType =
  | 'email'
  | 'phone'
  | 'location'
  | 'linkedin'
  | 'github'
  | 'website'
  | 'link';

/**
 * Map contact field names to icon types
 */
export const CONTACT_FIELD_ICONS: Record<string, ContactIconType> = {
  email: 'email',
  phone: 'phone',
  location: 'location',
  linkedin: 'linkedin',
  github: 'github',
  website: 'website',
};
