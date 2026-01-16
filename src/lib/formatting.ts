/**
 * Shared formatting utilities for resume text, dates, and URLs.
 * Used by both PreviewCanvas (HTML) and ResumePDF (PDF) renderers.
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a month string (YYYY-MM) to display format (e.g., "Jan 2024")
 */
export const formatMonth = (dateStr: string): string => {
  const [year, month] = dateStr.split('-');
  if (!year || !month) return dateStr;
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Format a date range for display (e.g., "Jan 2020 - Present")
 */
export const formatDateRange = (
  start?: string,
  end?: string,
  current?: boolean
): string => {
  if (!start) return '';
  const startFormatted = formatMonth(start);
  const endFormatted = current ? 'Present' : end ? formatMonth(end) : '';
  return endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted;
};

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Ensure a URL has a proper protocol prefix
 */
export const ensureProtocol = (url: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.includes('@') && !url.includes('/')) return `mailto:${url}`;
  return `https://${url}`;
};

/**
 * Format URL for display (strip protocol and trailing slash)
 */
export const formatUrlDisplay = (url: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
};

/**
 * Check if a string looks like a URL
 */
export const isUrl = (str: string): boolean => {
  if (!str) return false;
  return /^(https?:\/\/|www\.)|(\.(com|org|net|io|dev|me|co|app|design))/i.test(str);
};

// ============================================================================
// MARKDOWN PARSING
// ============================================================================

export type TextSegment = {
  type: 'text' | 'bold' | 'italic' | 'boldItalic' | 'link';
  content: string;
  href?: string;
};

export type ParsedLine = {
  type: 'text' | 'bullet' | 'numbered' | 'header' | 'empty';
  level?: number;
  number?: number;
  content: string;
  segments: TextSegment[];
};

/**
 * Regex pattern for inline markdown: **bold**, *italic*, ***boldItalic***, [link](url)
 */
const INLINE_MARKDOWN_PATTERN =
  /(\*\*\*(.+?)\*\*\*|___(.+?)___|(\*\*|__)(.+?)\4|(\*|_)([^*_]+?)\6|\[([^\]]+)\]\(([^)]+)\))/g;

/**
 * Parse inline markdown formatting into segments
 */
export const parseInlineMarkdown = (text: string): TextSegment[] => {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  INLINE_MARKDOWN_PATTERN.lastIndex = 0;

  while ((match = INLINE_MARKDOWN_PATTERN.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    if (match[2] || match[3]) {
      segments.push({ type: 'boldItalic', content: match[2] || match[3] });
    } else if (match[5]) {
      segments.push({ type: 'bold', content: match[5] });
    } else if (match[7]) {
      segments.push({ type: 'italic', content: match[7] });
    } else if (match[8] && match[9]) {
      segments.push({ type: 'link', content: match[8], href: ensureProtocol(match[9]) });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
};

/**
 * Parse multi-line text with bullets, numbers, headers, and markdown
 */
export const parseFormattedText = (text: string): ParsedLine[] => {
  if (!text) return [];

  const lines = text.split('\n');
  const result: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line (paragraph break)
    if (!trimmed) {
      if (i > 0 && i < lines.length - 1) {
        result.push({ type: 'empty', content: '', segments: [] });
      }
      continue;
    }

    // Header (## text)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      result.push({
        type: 'header',
        level: headerMatch[1].length,
        content: headerMatch[2],
        segments: parseInlineMarkdown(headerMatch[2]),
      });
      continue;
    }

    // Bullet point (- text, * text, • text)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      result.push({
        type: 'bullet',
        content: bulletMatch[1],
        segments: parseInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    // Numbered list (1. text, 2) text)
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      result.push({
        type: 'numbered',
        number: parseInt(numberedMatch[1], 10),
        content: numberedMatch[2],
        segments: parseInlineMarkdown(numberedMatch[2]),
      });
      continue;
    }

    // Plain text
    result.push({
      type: 'text',
      content: trimmed,
      segments: parseInlineMarkdown(trimmed),
    });
  }

  return result;
};

// ============================================================================
// TYPOGRAPHY CONFIGURATION
// ============================================================================

/**
 * Typography pixel sizes - shared between Preview and PDF
 */
export const TYPOGRAPHY_PX = {
  sm: { name: 18, headers: 11, body: 9 },
  md: { name: 22, headers: 13, body: 10 },
  lg: { name: 26, headers: 15, body: 11 },
  xl: { name: 30, headers: 17, body: 12 },
} as const;

/**
 * Header size multipliers by level (h1-h6)
 */
export const HEADER_SIZE_MULTIPLIERS: Record<number, number> = {
  1: 1.4,
  2: 1.25,
  3: 1.1,
  4: 1.05,
  5: 1,
  6: 0.95,
};
