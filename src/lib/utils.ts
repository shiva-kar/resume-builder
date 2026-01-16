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
