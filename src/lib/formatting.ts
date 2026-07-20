/**
 * Shared formatting utilities for resume text, dates, and URLs.
 * Used by both PreviewCanvas (HTML) and ResumePDF (PDF) renderers.
 */

// DATE FORMATTING

/**
 * Format a month string (YYYY-MM) to display format (e.g., "Jan 2024")
 */
export const formatMonth = (dateStr: string): string => {
  const parts = dateStr.split('-');
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  
  if (!year || !month) return dateStr;
  
  if (day && day !== 'Present') {
    const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
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
  let endFormatted = '';
  if (current) {
    endFormatted = 'Present';
  } else if (end) {
    endFormatted = formatMonth(end);
  }
  return endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted;
};

// URL UTILITIES

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
  return /^(?:https?:\/\/|www\.|.*\.(?:com|org|net|io|dev|me|co|app|design)\b)/i.test(str);
};

// MARKDOWN PARSING

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

type InlinePattern = {
  type: TextSegment['type'];
  regex: RegExp;
};

const INLINE_PATTERNS: InlinePattern[] = [
  { type: 'boldItalic', regex: /^\*\*\*([^*]+)\*\*\*/ },
  { type: 'boldItalic', regex: /^___([^_]+)___/ },
  { type: 'bold', regex: /^\*\*([^*]+)\*\*/ },
  { type: 'bold', regex: /^__([^_]+)__/ },
  { type: 'italic', regex: /^\*([^*\n]+)\*/ },
  { type: 'italic', regex: /^_([^_\n]+)_/ },
  { type: 'link', regex: /^\[([^\]]+)\]\(([^)]+)\)/ },
];

const HEADER_PATTERN = /^(#{1,6})\s+(.+)$/;
const BULLET_PATTERN = /^[-*•]\s+(.+)$/;
const NUMBERED_PATTERN = /^(\d+)[.)]\s+(.+)$/;

type InlineMatchResult = {
  segment: TextSegment;
  consumed: number;
};

const getInlineMatch = (remaining: string): InlineMatchResult | null => {
  for (const pattern of INLINE_PATTERNS) {
    const match = pattern.regex.exec(remaining);
    if (match?.index !== 0) {
      continue;
    }

    const fullMatch = match[0] ?? '';
    if (pattern.type === 'link') {
      const content = match[1] ?? '';
      const href = match[2] ?? '';
      return {
        segment: { type: 'link', content, href: ensureProtocol(href) },
        consumed: fullMatch.length,
      };
    }

    return {
      segment: { type: pattern.type, content: match[1] ?? '' },
      consumed: fullMatch.length,
    };
  }

  return null;
};

const getPlainTextChunk = (remaining: string): { text: string; consumed: number } => {
  const nextSpecial = remaining.search(/[[*_]/);
  if (nextSpecial === -1) {
    return { text: remaining, consumed: remaining.length };
  }

  if (nextSpecial === 0) {
    return { text: remaining[0], consumed: 1 };
  }

  return {
    text: remaining.slice(0, nextSpecial),
    consumed: nextSpecial,
  };
};

/**
 * Parse inline markdown formatting into segments
 */
export const parseInlineMarkdown = (text: string): TextSegment[] => {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remaining = text.slice(cursor);
    const inlineMatch = getInlineMatch(remaining);
    if (inlineMatch) {
      segments.push(inlineMatch.segment);
      cursor += inlineMatch.consumed;
      continue;
    }

    const plainChunk = getPlainTextChunk(remaining);
    segments.push({ type: 'text', content: plainChunk.text });
    cursor += plainChunk.consumed;
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
    const headerMatch = HEADER_PATTERN.exec(trimmed);
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
    const bulletMatch = BULLET_PATTERN.exec(trimmed);
    if (bulletMatch) {
      result.push({
        type: 'bullet',
        content: bulletMatch[1],
        segments: parseInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    // Numbered list (1. text, 2) text)
    const numberedMatch = NUMBERED_PATTERN.exec(trimmed);
    if (numberedMatch) {
      result.push({
        type: 'numbered',
        number: Number.parseInt(numberedMatch[1], 10),
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

// TYPOGRAPHY CONFIGURATION

/**
 * Typography pixel sizes - shared between Preview and PDF
 */
export const TYPOGRAPHY_PX = {
  sm: { name: 18, headers: 11, body: 9, experience: 9, skills: 9 },
  md: { name: 22, headers: 13, body: 10, experience: 10, skills: 10 },
  lg: { name: 26, headers: 15, body: 11, experience: 11, skills: 11 },
  xl: { name: 30, headers: 17, body: 12, experience: 12, skills: 12 },
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
