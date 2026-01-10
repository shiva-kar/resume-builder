import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// ============================================================================
// TEXT FORMATTING UTILITIES - Markdown & Bullet List Support
// ============================================================================

export type TextSegment = {
  type: 'text' | 'bold' | 'italic' | 'boldItalic' | 'link';
  content: string;
  href?: string;
};

export type ParsedLine = {
  type: 'text' | 'bullet' | 'numbered' | 'header';
  level?: number; // For headers (1-6) or bullet indentation
  number?: number; // For numbered lists
  segments: TextSegment[];
};

/**
 * Parse inline markdown formatting (bold, italic, links)
 */
export function parseInlineMarkdown(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  // Pattern for: **bold**, __bold__, *italic*, _italic_, ***boldItalic***, ___boldItalic___, [text](url)
  const pattern = /(\*\*\*(.+?)\*\*\*|___(.+?)___|(\*\*|__)(.+?)\4|(\*|_)(.+?)\6|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    if (match[2] || match[3]) {
      // Bold + Italic (*** or ___)
      segments.push({ type: 'boldItalic', content: match[2] || match[3] });
    } else if (match[5]) {
      // Bold (** or __)
      segments.push({ type: 'bold', content: match[5] });
    } else if (match[7]) {
      // Italic (* or _)
      segments.push({ type: 'italic', content: match[7] });
    } else if (match[8] && match[9]) {
      // Link [text](url)
      segments.push({ type: 'link', content: match[8], href: match[9] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

/**
 * Parse text with bullet lists, numbered lists, and markdown
 */
export function parseFormattedText(text: string): ParsedLine[] {
  if (!text) return [];

  const lines = text.split('\n');
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for headers (## or ###)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      result.push({
        type: 'header',
        level: headerMatch[1].length,
        segments: parseInlineMarkdown(headerMatch[2]),
      });
      continue;
    }

    // Check for bullet points (-, *, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      result.push({
        type: 'bullet',
        segments: parseInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    // Check for numbered lists (1., 2., etc.)
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      result.push({
        type: 'numbered',
        number: parseInt(numberedMatch[1], 10),
        segments: parseInlineMarkdown(numberedMatch[2]),
      });
      continue;
    }

    // Regular text (or empty line)
    if (trimmed || line === '') {
      result.push({
        type: 'text',
        segments: parseInlineMarkdown(trimmed),
      });
    }
  }

  return result;
}

/**
 * Check if text has any formatting (bullets, markdown, etc.)
 */
export function hasFormatting(text: string): boolean {
  if (!text) return false;
  return /^[-*•]\s+|^\d+[.)]\s+|^#{1,6}\s+|\*\*|__|\*[^*]|_[^_]|\[.+\]\(.+\)/m.test(text);
}
