import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export formatting utilities from centralized module
export {
  formatDateRange,
  formatMonth,
  ensureProtocol,
  formatUrlDisplay,
  isUrl,
  parseInlineMarkdown,
  parseFormattedText,
  TYPOGRAPHY_PX,
  HEADER_SIZE_MULTIPLIERS,
  type TextSegment,
  type ParsedLine,
} from './formatting';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if text has any formatting (bullets, markdown, etc.)
 */
export function hasFormatting(text: string): boolean {
  if (!text) return false;
  return /^[-*•]\s+|^\d+[.)]\s+|^#{1,6}\s+|\*\*|__|\*[^*]|_[^_]|\[.+\]\(.+\)/m.test(text);
}

/**
 * Determine if a hex color is dark based on perceived luminance
 */
export function isColorDark(hexColor: string): boolean {
  if (!hexColor) return false;
  
  // Strip # if present
  const hex = hexColor.replace('#', '');
  
  // Handle 3-digit hex
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return false; // Default to light if invalid
  }
  
  // Calculate relative luminance
  // Using WCAG formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const R = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const G = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const B = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  
  // Threshold for dark (standard is ~0.179)
  return luminance < 0.179;
}
