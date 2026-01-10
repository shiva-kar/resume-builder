'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Dribbble,
  Globe,
  Link2,
  Layers,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ResumeData,
  PAGE_SIZES,
  GLOBAL_FONT_SCALES,
  LinkIconType,
  DEFAULT_TYPOGRAPHY,
  Section,
} from '@/lib/schema';
import { cn } from '@/lib/utils';

// ============================================================================
// ICON MAPPING
// ============================================================================

const PreviewIcons: Record<LinkIconType | string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  dribbble: Dribbble,
  behance: Layers,
  medium: MessageSquare,
  stackoverflow: Layers,
  portfolio: Globe,
  website: Link2,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (start?: string, end?: string, current?: boolean): string => {
  if (!start) return '';
  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    if (!year || !month) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const startFormatted = formatMonth(start);
  const endFormatted = current ? 'Present' : end ? formatMonth(end) : '';
  return endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted;
};

// Ensure URL has protocol
const ensureProtocol = (url: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.includes('@') && !url.includes('/')) return `mailto:${url}`;
  return `https://${url}`;
};

// Format URL for display (strip protocol)
const formatUrlDisplay = (url: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
};

// Detect if a string is a URL
const isUrl = (str: string): boolean => {
  if (!str) return false;
  return /^(https?:\/\/|www\.)|(\.(com|org|net|io|dev|me|co|app|design))/i.test(str);
};

// Render text with clickable links
const RenderWithLinks: React.FC<{ text: string; className?: string; style?: React.CSSProperties }> = ({
  text,
  className,
  style,
}) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);
  const matches: string[] = text.match(urlRegex) || [];

  return (
    <span className={className} style={style}>
      {parts.map((part, i) => {
        if (matches.includes(part)) {
          const href = ensureProtocol(part);
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {formatUrlDisplay(part)}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// ============================================================================
// RICH TEXT RENDERER - Markdown & Bullet Support
// ============================================================================

interface RichTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  themeColor?: string;
}

// Render inline markdown segments
const RenderInlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Pattern for: **bold**, __bold__, *italic*, _italic_, ***boldItalic***, [text](url)
  const pattern = /(\*\*\*(.+?)\*\*\*|___(.+?)___|(\*\*|__)(.+?)\4|(\*|_)([^*_]+?)\6|\[([^\]]+)\]\(([^)]+)\))/g;

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[2] || match[3]) {
      // Bold + Italic (*** or ___)
      segments.push(<strong key={key++} className="font-bold italic">{match[2] || match[3]}</strong>);
    } else if (match[5]) {
      // Bold (** or __)
      segments.push(<strong key={key++} className="font-bold">{match[5]}</strong>);
    } else if (match[7]) {
      // Italic (* or _)
      segments.push(<em key={key++} className="italic">{match[7]}</em>);
    } else if (match[8] && match[9]) {
      // Link [text](url)
      segments.push(
        <a
          key={key++}
          href={ensureProtocol(match[9])}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <>{segments.length > 0 ? segments : text}</>;
};

// Main rich text renderer with bullets, numbered lists, and markdown
const RichText: React.FC<RichTextProps> = ({ text, className, style, themeColor }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for headers (## or ###)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const sizes: Record<number, string> = {
        1: 'text-lg font-bold',
        2: 'text-base font-bold',
        3: 'text-sm font-semibold',
        4: 'text-sm font-medium',
        5: 'text-xs font-medium',
        6: 'text-xs font-normal',
      };
      elements.push(
        <div key={i} className={sizes[level] || sizes[3]} style={{ color: themeColor }}>
          <RenderInlineMarkdown text={headerMatch[2]} />
        </div>
      );
      continue;
    }

    // Check for bullet points (-, *, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="mt-[0.4em] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor || '#6b7280' }} />
          <span><RenderInlineMarkdown text={bulletMatch[1]} /></span>
        </div>
      );
      continue;
    }

    // Check for numbered lists (1., 2., etc.)
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="font-medium min-w-[1.25em] text-right flex-shrink-0" style={{ color: themeColor || '#6b7280' }}>
            {numberedMatch[1]}.
          </span>
          <span><RenderInlineMarkdown text={numberedMatch[2]} /></span>
        </div>
      );
      continue;
    }

    // Regular text or empty line
    if (trimmed) {
      elements.push(
        <div key={i}>
          <RenderInlineMarkdown text={trimmed} />
        </div>
      );
    } else if (line === '' && i > 0 && i < lines.length - 1) {
      // Empty line (paragraph break)
      elements.push(<div key={i} className="h-2" />);
    }
  }

  return (
    <div className={className} style={style}>
      {elements}
    </div>
  );
};

// Typography pixel sizes
const TYPO_PX = {
  sm: { name: 18, headers: 11, body: 9 },
  md: { name: 22, headers: 13, body: 10 },
  lg: { name: 26, headers: 15, body: 11 },
  xl: { name: 30, headers: 17, body: 12 },
};

// ============================================================================
// DUMMY DATA FOR PREVIEW (shows realistic layout when sections are empty)
// These values are styled distinctively and NEVER appear in exported PDF
// ============================================================================

const DUMMY_DATA = {
  personalInfo: {
    fullName: 'Your Full Name',
    email: 'email@example.com',
    phone: '(555) 123-4567',
    location: 'City, State',
    summary: 'A brief professional summary highlighting your key skills, experience, and career objectives. This helps recruiters quickly understand your value proposition.',
  },
  experience: [
    {
      id: 'dummy-exp-1',
      title: 'Senior Software Engineer',
      position: 'Senior Software Engineer',
      company: 'Technology Company',
      institution: '',
      degree: '',
      subtitle: 'Technology Company',
      location: 'San Francisco, CA',
      startDate: '2021-01',
      endDate: '',
      current: true,
      description: '• Led development of key features resulting in 40% performance improvement\n• Mentored junior developers and conducted code reviews\n• Collaborated with cross-functional teams on product roadmap',
    },
    {
      id: 'dummy-exp-2',
      title: 'Software Developer',
      position: 'Software Developer',
      company: 'Digital Agency',
      institution: '',
      degree: '',
      subtitle: 'Digital Agency',
      location: 'New York, NY',
      startDate: '2018-06',
      endDate: '2020-12',
      current: false,
      description: '• Built responsive web applications using modern frameworks\n• Implemented CI/CD pipelines reducing deployment time by 60%',
    },
  ],
  education: [
    {
      id: 'dummy-edu-1',
      title: 'Bachelor of Science in Computer Science',
      position: '',
      company: '',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University',
      subtitle: 'State University',
      location: 'Boston, MA',
      startDate: '2014-09',
      endDate: '2018-05',
      current: false,
      description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering',
    },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'Agile'],
};

// Helper to check if data has any real user content
const hasRealContent = (value: string | string[] | undefined | null): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
};

// ============================================================================
// CONTACT ITEM COMPONENT
// ============================================================================

interface ContactItemProps {
  icon?: React.FC<{ className?: string; style?: React.CSSProperties }>;
  value: string;
  href?: string;
  color?: string;
  fontSize: number;
  showIcon?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, value, href, color, fontSize, showIcon = true }) => {
  if (!value) return null;
  const displayValue = isUrl(value) ? formatUrlDisplay(value) : value;
  const content = (
    <span className="inline-flex items-center gap-1" style={{ fontSize }}>
      {showIcon && Icon && <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />}
      <span>{displayValue}</span>
    </span>
  );

  if (href) {
    return (
      <a
        href={ensureProtocol(href)}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
        style={{ color: color || 'inherit' }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }
  return content;
};

interface PreviewCanvasProps {
  data: ResumeData;
  className?: string;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ data, className }) => {
  const { personalInfo, sections, theme } = data;
  const pageSize = PAGE_SIZES[theme.pageSize];
  const aspectRatio = pageSize.width / pageSize.height;
  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // Template checks
  const isHarvard = theme.template === 'harvard';
  const isTech = theme.template === 'tech';
  const isMinimal = theme.template === 'minimal';
  const isBold = theme.template === 'bold';
  const isNeo = theme.template === 'neo';
  const isPortfolio = theme.template === 'portfolio';
  const isCorporate = theme.template === 'corporate';
  const isCreative = theme.template === 'creative';
  const isElegant = theme.template === 'elegant';
  const isModern = theme.template === 'modern';

  // Font scale
  const scale = GLOBAL_FONT_SCALES[theme.fontSize];

  // Font sizes (computed once)
  const fontSize = useMemo(() => ({
    name: Math.round(TYPO_PX[typography.name].name * scale),
    summary: Math.round(TYPO_PX[typography.headers].headers * scale),
    contact: Math.round(TYPO_PX[typography.body].body * scale),
    sectionHeading: Math.round(14 * scale),
    itemTitle: Math.round(13 * scale),
    itemSubtitle: Math.round(11 * scale),
    itemBody: Math.round(10 * scale),
    itemDate: Math.round(9 * scale),
  }), [typography, scale]);

  // Visible sections
  const visibleSections = useMemo(() => sections.filter((s) => s.isVisible), [sections]);

  // Page height for multi-page (A4 at ~72 DPI scaled)
  const pageHeightPx = 842;

  // Calculate page breaks
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(contentHeight / pageHeightPx));
      setPageCount(pages);
      if (currentPage >= pages) {
        setCurrentPage(Math.max(0, pages - 1));
      }
    }
  }, [data, currentPage]);

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.defaultPrevented) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.min(Math.max(zoom + delta, 0.5), 3));
    }
  };

  // ============================================================================
  // CONTACT INFO RENDERER
  // ============================================================================

  const renderContactInfo = (centered = false, showIcons = true) => {
    const items = [
      { icon: Mail, value: personalInfo.email, href: `mailto:${personalInfo.email}` },
      { icon: Phone, value: personalInfo.phone, href: `tel:${personalInfo.phone?.replace(/\s/g, '')}` },
      { icon: MapPin, value: personalInfo.location, href: undefined },
      { icon: Linkedin, value: personalInfo.linkedin, href: personalInfo.linkedin },
      { icon: Github, value: personalInfo.github, href: personalInfo.github },
      { icon: Globe, value: personalInfo.website, href: personalInfo.website },
    ].filter((item) => item.value);

    return (
      <div
        className={cn('flex flex-wrap gap-3 text-gray-600', centered && 'justify-center')}
        style={{ fontSize: fontSize.contact }}
      >
        {items.map((item, idx) => (
          <ContactItem
            key={idx}
            icon={item.icon}
            value={item.value!}
            href={item.href}
            color={showIcons ? theme.color : undefined}
            fontSize={fontSize.contact}
            showIcon={showIcons}
          />
        ))}
        {personalInfo.links.map((link) => {
          const IconComponent = PreviewIcons[link.icon as LinkIconType] || Link2;
          return (
            <ContactItem
              key={link.id}
              icon={IconComponent}
              value={link.label || link.url}
              href={link.url}
              color={showIcons ? theme.color : undefined}
              fontSize={fontSize.contact}
              showIcon={showIcons}
            />
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // SECTION RENDERERS
  // ============================================================================

  const renderSkillsSection = (section: Section) => {
    const item = section.items[0];
    const hasSkills = item?.skills?.length || item?.skillsWithLevels?.length;
    const isDummy = !hasSkills;

    // Use dummy skills if none exist
    const displaySkills = hasSkills ? (item.skills || []) : DUMMY_DATA.skills;

    // Elegant template - inline comma-separated list
    if (isElegant) {
      return (
        <div className="text-center">
          {item?.skillsWithLevels?.length ? (
            <p className="text-gray-600 font-serif" style={{ fontSize: fontSize.itemBody }}>
              {item.skillsWithLevels.map((s, i) => (
                <span key={i}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-400 text-[9px] ml-1">({s.level})</span>
                  {i < item.skillsWithLevels!.length - 1 && <span className="mx-2 text-gray-300">·</span>}
                </span>
              ))}
            </p>
          ) : (
            <p className={cn('font-serif', isDummy ? 'text-gray-400 italic' : 'text-gray-600')} style={{ fontSize: fontSize.itemBody }}>
              {displaySkills.join(' · ')}
            </p>
          )}
        </div>
      );
    }

    // Corporate template - clean pills with subtle border
    if (isCorporate) {
      return (
        <div className="space-y-2">
          {item?.skillsWithLevels?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.skillsWithLevels.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 text-[10px] bg-white border border-gray-200 rounded"
                >
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <span className="ml-1.5 text-gray-400 text-[8px]">{skill.level}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className={cn('flex flex-wrap gap-2', isDummy && 'opacity-60')}>
              {displaySkills.map((skill, idx) => (
                <span key={idx} className={cn('px-2.5 py-1 text-[10px] rounded', isDummy ? 'bg-gray-100 text-gray-400 italic' : 'bg-gray-100 text-gray-700')}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Creative template - bold colorful tags
    if (isCreative) {
      return (
        <div className="space-y-2">
          {item?.skillsWithLevels?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {item.skillsWithLevels.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 text-[10px] font-bold rounded"
                  style={{ backgroundColor: theme.color + '15', color: theme.color }}
                >
                  {skill.name}
                  <span className="ml-1 opacity-60 text-[8px] font-normal">• {skill.level}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className={cn('flex flex-wrap gap-1.5', isDummy && 'opacity-60')}>
              {displaySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className={cn('px-2 py-1 text-[10px] rounded', isDummy ? 'font-normal italic' : 'font-bold')}
                  style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '15', color: isDummy ? '#9ca3af' : theme.color }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Modern template - minimal with accent dot
    if (isModern) {
      return (
        <div className="space-y-1.5">
          {item?.skillsWithLevels?.length ? (
            item.skillsWithLevels.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px]">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="font-medium text-gray-800">{skill.name}</span>
                <span className="text-gray-400 text-[8px]">{skill.level}</span>
              </div>
            ))
          ) : (
            <div className={isDummy ? 'opacity-60' : ''}>
              {displaySkills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isDummy ? '#9ca3af' : theme.color }} />
                  <span className={isDummy ? 'text-gray-400 italic' : 'text-gray-700'}>{skill}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Harvard template - simple comma-separated text (matches PDF)
    if (isHarvard) {
      return (
        <p className={cn('font-serif', isDummy ? 'text-gray-400 italic' : 'text-gray-700')} style={{ fontSize: fontSize.itemBody }}>
          {item?.skillsWithLevels?.length
            ? item.skillsWithLevels.map((s) => s.name).join(', ')
            : displaySkills.join(', ')}
        </p>
      );
    }

    // Default rendering for other templates (Tech, Minimal, Bold, Neo, Portfolio)
    return (
      <div className="space-y-2">
        {item?.skillsWithLevels?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {item.skillsWithLevels.map((skill, idx) => (
              <span
                key={idx}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 text-[10px] font-medium border border-gray-200',
                  isNeo ? 'rounded-none' : 'rounded'
                )}
              >
                <span className="font-semibold" style={{ color: isTech || isBold ? theme.color : 'inherit' }}>
                  {skill.name}
                </span>
                <span className="ml-1 text-gray-400 text-[8px] uppercase">{skill.level}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className={cn('flex flex-wrap gap-1.5', isDummy && 'opacity-60')}>
          {displaySkills.map((skill, idx) => (
            <span
              key={idx}
              className={cn('px-2 py-0.5 text-[10px]', isNeo ? 'rounded-none' : 'rounded-sm', isDummy && 'italic')}
              style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '20', color: isDummy ? '#9ca3af' : theme.color }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSection = (section: Section) => {
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    const fieldDefs = section.fieldDefinitions || [];

    return section.items.map((item) => {
      const getFieldValue = (fieldId: string) => {
        const field = (item.customFields || []).find((cf) => cf.fieldId === fieldId);
        return field?.value;
      };

      const titleField = fieldDefs.find((f) => f.type === 'text');
      const dateField = fieldDefs.find((f) => f.type === 'date' || f.type === 'dateRange');
      const linkField = fieldDefs.find((f) => f.type === 'link');
      const tagsField = fieldDefs.find((f) => f.type === 'tags');
      const textareaField = fieldDefs.find((f) => f.type === 'textarea');

      const title = titleField ? (getFieldValue(titleField.id) as string) : '';
      const linkValue = linkField ? (getFieldValue(linkField.id) as string) : '';
      const tagsValue = tagsField ? (getFieldValue(tagsField.id) as string[]) : [];
      const description = textareaField ? (getFieldValue(textareaField.id) as string) : '';

      let dateDisplay = '';
      if (dateField) {
        const dateValue = getFieldValue(dateField.id) as string;
        if (dateField.type === 'dateRange' && dateValue) {
          const [start, end] = dateValue.split('|');
          dateDisplay = formatDate(start, end);
        } else if (dateValue) {
          dateDisplay = formatDate(dateValue);
        }
      }

      return (
        <div key={item.id} className="mb-2.5">
          <div className="flex justify-between items-baseline mb-0.5">
            <div className="flex items-center gap-2">
              {linkValue ? (
                <a
                  href={ensureProtocol(linkValue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline flex items-center gap-1"
                  style={{ fontSize: fontSize.itemTitle, color: theme.color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {title || 'Title'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <h3 className="font-bold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
                  {title || <span className="text-gray-400 italic font-normal">Title</span>}
                </h3>
              )}
            </div>
            {dateDisplay && (
              <span className="text-gray-500 italic" style={{ fontSize: fontSize.itemDate }}>
                {dateDisplay}
              </span>
            )}
          </div>

          {fieldDefs
            .filter((f) => f.type === 'text' && f !== titleField)
            .map((f) => {
              const val = getFieldValue(f.id) as string;
              return val ? (
                <p key={f.id} className="text-gray-600" style={{ fontSize: fontSize.itemSubtitle }}>
                  <RenderWithLinks text={val} />
                </p>
              ) : null;
            })}

          {tagsValue && tagsValue.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tagsValue.map((tag, idx) => (
                <span
                  key={idx}
                  className={cn('px-1.5 py-0.5 text-[9px]', isNeo ? 'rounded-none' : 'rounded')}
                  style={{ backgroundColor: theme.color + '20', color: theme.color }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {description && (
            <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: fontSize.itemBody }}>
              <RenderWithLinks text={description} />
            </p>
          )}
        </div>
      );
    });
  };

  const renderExperienceEducation = (section: Section) => {
    // Use dummy data if section is empty
    const isDummy = !section.items.length;
    const dummyItems = section.type === 'experience' ? DUMMY_DATA.experience : section.type === 'education' ? DUMMY_DATA.education : [];
    const itemsToRender = isDummy ? dummyItems : section.items;

    if (!itemsToRender.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    // Elegant template - centered with refined typography
    if (isElegant) {
      return itemsToRender.map((item) => (
        <div key={item.id} className={cn('mb-4 text-center', isDummy && 'opacity-60')}>
          <h3 className={cn('font-serif font-semibold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-800')} style={{ fontSize: fontSize.itemTitle }}>
            {section.type === 'experience'
              ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
              : section.type === 'education'
                ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
          </h3>
          <p className={cn('font-serif', isDummy ? 'text-gray-400' : 'text-gray-600')} style={{ fontSize: fontSize.itemSubtitle }}>
            {section.type === 'experience'
              ? item.company || <span className="text-gray-400">Company</span>
              : section.type === 'education'
                ? item.institution || <span className="text-gray-400">Institution</span>
                : item.subtitle || ''}
            {item.location && <span className="text-gray-400"> · {item.location}</span>}
          </p>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">
            {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
          </p>
          {item.description && (
            <RichText
              text={item.description}
              className={cn('mt-2 max-w-lg mx-auto', isDummy ? 'text-gray-400' : 'text-gray-600')}
              style={{ fontSize: fontSize.itemBody }}
              themeColor={theme.color}
            />
          )}
        </div>
      ));
    }

    // Corporate template - clean with left border accent
    if (isCorporate) {
      return itemsToRender.map((item) => (
        <div key={item.id} className={cn('mb-3 pl-3 border-l-2', isDummy && 'opacity-60')} style={{ borderLeftColor: theme.color + '40' }}>
          <div className="flex justify-between items-baseline">
            <h3 className={cn('font-semibold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-800')} style={{ fontSize: fontSize.itemTitle }}>
              {section.type === 'experience'
                ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
                : section.type === 'education'
                  ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                  : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
            </h3>
            <span className="text-gray-500 text-[10px] uppercase tracking-wide">
              {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: fontSize.itemSubtitle }}>
            <span style={{ color: isDummy ? '#9ca3af' : theme.color }}>
              {section.type === 'experience'
                ? item.company || <span className="text-gray-400">Company</span>
                : section.type === 'education'
                  ? item.institution || <span className="text-gray-400">Institution</span>
                  : item.subtitle || ''}
            </span>
            {item.location && <span className="text-gray-400">· {item.location}</span>}
          </div>
          {item.description && (
            <RichText
              text={item.description}
              className={cn('mt-1.5', isDummy ? 'text-gray-400' : 'text-gray-600')}
              style={{ fontSize: fontSize.itemBody }}
              themeColor={theme.color}
            />
          )}
        </div>
      ));
    }

    // Creative template - bold with accent block
    if (isCreative) {
      return itemsToRender.map((item) => (
        <div key={item.id} className={cn('mb-4 relative', isDummy && 'opacity-60')}>
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded" style={{ backgroundColor: theme.color + '30' }} />
          <div className="pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn('font-bold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-900')} style={{ fontSize: fontSize.itemTitle }}>
                  {section.type === 'experience'
                    ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
                    : section.type === 'education'
                      ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                      : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
                </h3>
                <p className="font-medium" style={{ fontSize: fontSize.itemSubtitle, color: isDummy ? '#9ca3af' : theme.color }}>
                  {section.type === 'experience'
                    ? item.company || <span className="text-gray-400">Company</span>
                    : section.type === 'education'
                      ? item.institution || <span className="text-gray-400">Institution</span>
                      : item.subtitle || ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px]">
                  {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
                </span>
                {item.location && <p className="text-gray-400 text-[9px]">{item.location}</p>}
              </div>
            </div>
            {item.description && (
              <RichText
                text={item.description}
                className={cn('mt-2', isDummy ? 'text-gray-400' : 'text-gray-600')}
                style={{ fontSize: fontSize.itemBody }}
                themeColor={theme.color}
              />
            )}
          </div>
        </div>
      ));
    }

    // Modern template - clean with subtle dividers
    if (isModern) {
      return itemsToRender.map((item, idx) => (
        <div key={item.id} className={cn('mb-3 pb-3', idx < itemsToRender.length - 1 && 'border-b border-gray-100', isDummy && 'opacity-60')}>
          <div className="flex justify-between items-baseline">
            <h3 className={cn('font-semibold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-900')} style={{ fontSize: fontSize.itemTitle }}>
              {section.type === 'experience'
                ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
                : section.type === 'education'
                  ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                  : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
            </h3>
            <span className="text-gray-400 text-[10px]">
              {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5" style={{ fontSize: fontSize.itemSubtitle }}>
            <span className={isDummy ? 'text-gray-400' : 'text-gray-600'}>
              {section.type === 'experience'
                ? item.company || <span className="text-gray-400">Company</span>
                : section.type === 'education'
                  ? item.institution || <span className="text-gray-400">Institution</span>
                  : item.subtitle || ''}
            </span>
            {item.location && (
              <>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="text-gray-400">{item.location}</span>
              </>
            )}
          </div>
          {item.description && (
            <RichText
              text={item.description}
              className={cn('mt-1.5', isDummy ? 'text-gray-400' : 'text-gray-600')}
              style={{ fontSize: fontSize.itemBody }}
              themeColor={theme.color}
            />
          )}
        </div>
      ));
    }

    // Default layout for Harvard, Tech, Minimal, Bold, Neo, Portfolio
    return itemsToRender.map((item) => (
      <div key={item.id} className={cn('mb-2.5', isDummy && 'opacity-60')}>
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className={cn('font-bold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-900')} style={{ fontSize: fontSize.itemTitle }}>
            {section.type === 'experience'
              ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
              : section.type === 'education'
                ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
          </h3>
          <span className="text-gray-500 italic ml-4 whitespace-nowrap" style={{ fontSize: fontSize.itemDate }}>
            {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
          </span>
        </div>
        <div className="flex justify-between items-center" style={{ fontSize: fontSize.itemSubtitle }}>
          <span className={isDummy ? 'text-gray-400' : 'text-gray-600'}>
            {section.type === 'experience'
              ? item.company || <span className="text-gray-400">Company</span>
              : section.type === 'education'
                ? item.institution || <span className="text-gray-400">Institution</span>
                : item.subtitle || ''}
          </span>
          {item.location && <span className="text-gray-500">{item.location}</span>}
        </div>
        {item.description && (
          <RichText
            text={item.description}
            className={cn('mt-1', isDummy ? 'text-gray-400' : 'text-gray-700')}
            style={{ fontSize: fontSize.itemBody }}
            themeColor={theme.color}
          />
        )}
      </div>
    ));
  };

  const renderProjectsCertifications = (section: Section) => {
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    return section.items.map((item) => (
      <div key={item.id} className="mb-2.5">
        <div className="flex justify-between items-baseline mb-0.5">
          <div className="flex items-center gap-2">
            {item.subtitle && isUrl(item.subtitle) ? (
              <a
                href={ensureProtocol(item.subtitle)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:underline flex items-center gap-1"
                style={{ fontSize: fontSize.itemTitle, color: theme.color }}
                onClick={(e) => e.stopPropagation()}
              >
                {item.title || 'Title'}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <h3 className="font-bold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
                {item.title || <span className="text-gray-400 italic font-normal">Title</span>}
              </h3>
            )}
          </div>
          {item.startDate && (
            <span className="text-gray-500 italic" style={{ fontSize: fontSize.itemDate }}>
              {formatDate(item.startDate, item.endDate, item.current)}
            </span>
          )}
        </div>
        {item.subtitle && !isUrl(item.subtitle) && (
          <p className="text-gray-600" style={{ fontSize: fontSize.itemSubtitle }}>
            <RenderWithLinks text={item.subtitle} />
          </p>
        )}
        {item.description && (
          <RichText
            text={item.description}
            className="text-gray-700 mt-1"
            style={{ fontSize: fontSize.itemBody }}
            themeColor={theme.color}
          />
        )}
      </div>
    ));
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'skills':
        return renderSkillsSection(section);
      case 'custom':
        return section.fieldDefinitions?.length ? renderCustomSection(section) : renderExperienceEducation(section);
      case 'projects':
      case 'certifications':
        return renderProjectsCertifications(section);
      default:
        return renderExperienceEducation(section);
    }
  };

  // ============================================================================
  // HEADER RENDERERS (BY TEMPLATE)
  // ============================================================================

  const renderHarvardHeader = () => (
    <div className="text-center border-b-2 border-gray-900 pb-4 mb-5">
      <h1 className="font-bold uppercase tracking-widest mb-2" style={{ fontSize: fontSize.name }}>
        {personalInfo.fullName || <span className="text-gray-400 italic normal-case">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <p className="text-gray-600 mb-2" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(true, false)}
    </div>
  );

  const renderTechHeader = () => (
    <div className="mb-6">
      <h1 className="font-extrabold tracking-tight mb-1" style={{ fontSize: fontSize.name, color: theme.color }}>
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <p className="text-gray-500 mb-3" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(false, true)}
    </div>
  );

  const renderMinimalHeader = () => (
    <div className="mb-8 text-center">
      <h1 className="font-light tracking-wide mb-2" style={{ fontSize: fontSize.name }}>
        {personalInfo.fullName || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <p className="text-gray-400 mb-3" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-300 italic">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(true, false)}
    </div>
  );

  const renderBoldHeader = () => (
    <div className="mb-6 border-b-4 pb-4" style={{ borderColor: theme.color }}>
      <h1
        className="font-black uppercase tracking-tight mb-1"
        style={{ fontSize: Math.round(fontSize.name * 1.15), color: theme.color }}
      >
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal normal-case">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <p className="text-gray-600 font-medium mb-3" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(false, true)}
    </div>
  );

  const renderNeoHeader = () => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3" style={{ backgroundColor: theme.color }} />
        <h1 className="font-bold tracking-tight" style={{ fontSize: fontSize.name }}>
          {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
        </h1>
      </div>
      <p className="text-gray-500 mb-3" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(false, true)}
    </div>
  );

  // ============================================================================
  // CORPORATE HEADER - Professional boxed header with subtle divider
  // ============================================================================
  const renderCorporateHeader = () => (
    <div className="mb-6 bg-gray-50 p-5 border-l-4" style={{ borderLeftColor: theme.color }}>
      <h1 className="font-semibold tracking-normal mb-1" style={{ fontSize: fontSize.name, color: '#1f2937' }}>
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <p className="text-gray-600 mb-3 leading-relaxed" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      <div className="pt-3 border-t border-gray-200">
        {renderContactInfo(false, true)}
      </div>
    </div>
  );

  // ============================================================================
  // CREATIVE HEADER - Asymmetric layout with bold accent block (matches PDF: 50x50)
  // ============================================================================
  const renderCreativeHeader = () => {
    const displayName = personalInfo.fullName || DUMMY_DATA.personalInfo.fullName;
    const isPlaceholder = !personalInfo.fullName;
    return (
      <div className="mb-5 relative">
        <div className="absolute top-0 left-0" style={{ width: 50, height: 50, backgroundColor: theme.color, opacity: 0.2 }} />
        <div className="pl-5 pt-3">
          <h1 className="font-bold mb-1" style={{ fontSize: Math.round(fontSize.name * 1.1) }}>
            <span style={{ color: isPlaceholder ? '#9ca3af' : theme.color }}>{displayName.charAt(0)}</span>
            <span className={isPlaceholder ? 'text-gray-400 italic font-normal' : 'text-gray-900'}>{displayName.slice(1)}</span>
          </h1>
          <p className="text-gray-600 italic mb-2" style={{ fontSize: fontSize.summary }}>
            {personalInfo.summary ? (
              <>&ldquo;{personalInfo.summary}&rdquo;</>
            ) : (
              <span className="text-gray-400">&ldquo;{DUMMY_DATA.personalInfo.summary}&rdquo;</span>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {renderContactInfo(false, true)}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // ELEGANT HEADER - Centered serif typography with ornamental line (matches PDF)
  // ============================================================================
  const renderElegantHeader = () => (
    <div className="mb-5 text-center">
      <h1 className="font-serif font-normal mb-2" style={{ fontSize: Math.round(fontSize.name * 1.05), letterSpacing: '0.2em' }}>
        {personalInfo.fullName?.toUpperCase() || <span className="text-gray-400 italic normal-case">{DUMMY_DATA.personalInfo.fullName}</span>}
      </h1>
      <div className="flex items-center justify-center gap-3 mb-2">
        <div style={{ width: 40, height: 1, backgroundColor: '#d1d5db' }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.color }} />
        <div style={{ width: 40, height: 1, backgroundColor: '#d1d5db' }} />
      </div>
      <p className="text-gray-500 font-serif italic mb-2.5" style={{ fontSize: fontSize.summary }}>
        {personalInfo.summary || <span className="text-gray-400">{DUMMY_DATA.personalInfo.summary}</span>}
      </p>
      {renderContactInfo(true, false)}
    </div>
  );

  // ============================================================================
  // MODERN HEADER - Clean split layout with accent sidebar
  // ============================================================================
  const renderModernHeader = () => (
    <div className="mb-6 flex gap-4">
      <div className="w-1 rounded-full" style={{ backgroundColor: theme.color }} />
      <div className="flex-1">
        <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: fontSize.name }}>
          {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
        </h1>
        <p className="text-gray-500 mb-3 leading-relaxed" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary || <span className="text-gray-400 italic">{DUMMY_DATA.personalInfo.summary}</span>}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {renderContactInfo(false, true)}
        </div>
      </div>
    </div>
  );

  const renderHeader = () => {
    if (isHarvard) return renderHarvardHeader();
    if (isMinimal) return renderMinimalHeader();
    if (isBold) return renderBoldHeader();
    if (isNeo) return renderNeoHeader();
    if (isCorporate) return renderCorporateHeader();
    if (isCreative) return renderCreativeHeader();
    if (isElegant) return renderElegantHeader();
    if (isModern) return renderModernHeader();
    return renderTechHeader();
  };

  // ============================================================================
  // SECTION TITLE RENDERER - Template-specific styling
  // ============================================================================

  const renderSectionTitle = (title: string) => {
    // Neo - Geometric square accent (matches PDF 10x10)
    if (isNeo) {
      return (
        <div className="flex items-center gap-1.5 mb-2">
          <div style={{ width: 10, height: 10, backgroundColor: theme.color }} />
          <h2 className="font-bold uppercase tracking-wide text-gray-900" style={{ fontSize: fontSize.sectionHeading, letterSpacing: '0.05em' }}>
            {title}
          </h2>
        </div>
      );
    }

    // Corporate - Professional underline with accent (matches PDF: font-bold, #1f2937)
    if (isCorporate) {
      return (
        <div className="mb-2 pb-1 border-b-2 border-gray-200">
          <h2 className="font-bold" style={{ fontSize: fontSize.sectionHeading, color: '#1f2937' }}>
            {title}
          </h2>
        </div>
      );
    }

    // Creative - Bold with accent color background (matches PDF)
    if (isCreative) {
      return (
        <div className="mb-2 flex">
          <div className="px-1.5 py-0.5" style={{ backgroundColor: theme.color + '30' }}>
            <h2 className="font-bold uppercase" style={{ fontSize: fontSize.sectionHeading, color: theme.color, letterSpacing: '0.05em' }}>
              {title}
            </h2>
          </div>
        </div>
      );
    }

    // Elegant - Serif with decorative elements (matches PDF)
    if (isElegant) {
      return (
        <div className="mb-2 text-center">
          <h2 className="font-serif font-normal text-gray-500 uppercase" style={{ fontSize: Math.round(fontSize.sectionHeading * 0.9), letterSpacing: '0.2em' }}>
            {title}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <div style={{ width: 30, height: 1, backgroundColor: theme.color + '60' }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.color }} />
            <div style={{ width: 30, height: 1, backgroundColor: theme.color + '60' }} />
          </div>
        </div>
      );
    }

    // Modern - Clean with vertical accent bar (matches PDF 2x14)
    if (isModern) {
      return (
        <div className="mb-2 flex items-center gap-1.5">
          <div style={{ width: 2, height: 14, backgroundColor: theme.color, borderRadius: 1 }} />
          <h2 className="font-bold text-gray-900" style={{ fontSize: fontSize.sectionHeading }}>
            {title}
          </h2>
        </div>
      );
    }

    // Harvard - Classic with full underline
    if (isHarvard) {
      return (
        <h2 className="font-bold mb-2 uppercase tracking-wider border-b border-gray-900 pb-1" style={{ fontSize: fontSize.sectionHeading }}>
          {title}
        </h2>
      );
    }

    // Minimal - Simple and light (matches PDF: font-bold, color #9ca3af)
    if (isMinimal) {
      return (
        <h2 className="font-bold mb-1.5 uppercase text-gray-400" style={{ fontSize: Math.round(fontSize.sectionHeading * 0.85), letterSpacing: '0.15em' }}>
          {title}
        </h2>
      );
    }

    // Bold - Strong with accent bar (matches PDF)
    if (isBold) {
      return (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-[3px] h-3.5" style={{ backgroundColor: theme.color }} />
          <h2 className="font-bold uppercase" style={{ fontSize: fontSize.sectionHeading, color: '#1f2937' }}>
            {title}
          </h2>
        </div>
      );
    }

    // Tech (default) - Accent colored (matches PDF: no uppercase, no tracking)
    return (
      <h2
        className="font-bold mb-2"
        style={{
          color: theme.color,
          fontSize: fontSize.sectionHeading,
        }}
      >
        {title}
      </h2>
    );
  };

  // ============================================================================
  // PORTFOLIO LAYOUT (TWO-COLUMN - Skills sidebar)
  // ============================================================================

  const renderPortfolioLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const mainSections = visibleSections.filter((s) => s.type !== 'skills');

    return (
      <div className="flex h-full">
        <div className="w-1/3 p-6 bg-gray-50 border-r border-gray-200">
          <h1 className="font-bold mb-1" style={{ fontSize: fontSize.name }}>
            {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
          </h1>
          <p className="mb-4" style={{ fontSize: fontSize.summary, color: personalInfo.summary ? theme.color : '#9ca3af' }}>
            {personalInfo.summary || <span className="italic">{DUMMY_DATA.personalInfo.summary}</span>}
          </p>

          <div className="space-y-2 mb-6">{renderContactInfo(false, true)}</div>

          {skillsSection && (
            <div className="mt-4">
              {renderSectionTitle(skillsSection.title)}
              {renderSkillsSection(skillsSection)}
            </div>
          )}
        </div>

        <div className="w-2/3 p-6">
          {mainSections.map((section) => (
            <div key={section.id} className="mb-4">
              {renderSectionTitle(section.title)}
              {renderSection(section)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // CORPORATE LAYOUT - Clean professional with subtle cards
  // ============================================================================

  const renderCorporateLayout = () => (
    <div ref={contentRef} className="w-full h-full p-8 font-sans bg-white">
      {renderCorporateHeader()}
      <div className="space-y-5">
        {visibleSections.map((section) => (
          <div key={section.id} className="bg-gray-50/50 p-4 rounded border border-gray-100">
            {renderSectionTitle(section.title)}
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // CREATIVE LAYOUT - Asymmetric with visual flair
  // ============================================================================

  const renderCreativeLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const experienceSection = visibleSections.find((s) => s.type === 'experience');
    const otherSections = visibleSections.filter((s) => s.type !== 'skills' && s.type !== 'experience');

    return (
      <div ref={contentRef} className="w-full h-full p-6 font-sans">
        {renderCreativeHeader()}

        {/* Main content in asymmetric grid */}
        <div className="grid grid-cols-5 gap-6">
          {/* Left column - 3/5 width */}
          <div className="col-span-3 space-y-5">
            {experienceSection && (
              <div>
                {renderSectionTitle(experienceSection.title)}
                {renderSection(experienceSection)}
              </div>
            )}
            {otherSections.map((section) => (
              <div key={section.id}>
                {renderSectionTitle(section.title)}
                {renderSection(section)}
              </div>
            ))}
          </div>

          {/* Right column - 2/5 width with accent background */}
          <div className="col-span-2">
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.color + '08' }}>
              {skillsSection && (
                <div>
                  {renderSectionTitle(skillsSection.title)}
                  {renderSkillsSection(skillsSection)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // ELEGANT LAYOUT - Centered serif with generous spacing
  // ============================================================================

  const renderElegantLayout = () => (
    <div ref={contentRef} className="w-full h-full px-12 py-10 font-serif" style={{ backgroundColor: '#fdfbf7' }}>
      {renderElegantHeader()}
      <div className="max-w-2xl mx-auto space-y-8">
        {visibleSections.map((section) => (
          <div key={section.id}>
            {renderSectionTitle(section.title)}
            <div className="text-center">
              {renderSection(section)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MODERN LAYOUT - Clean lines with accent bars
  // ============================================================================

  const renderModernLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const mainSections = visibleSections.filter((s) => s.type !== 'skills');

    return (
      <div ref={contentRef} className="w-full h-full font-sans flex">
        {/* Thin accent sidebar */}
        <div className="w-1" style={{ backgroundColor: theme.color }} />

        <div className="flex-1 p-8">
          {renderModernHeader()}

          <div className="grid grid-cols-3 gap-6">
            {/* Main content - 2/3 */}
            <div className="col-span-2 space-y-5">
              {mainSections.map((section) => (
                <div key={section.id} className="border-l-2 border-gray-100 pl-4">
                  {renderSectionTitle(section.title)}
                  {renderSection(section)}
                </div>
              ))}
            </div>

            {/* Skills sidebar - 1/3 */}
            <div>
              {skillsSection && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderSectionTitle(skillsSection.title)}
                  {renderSkillsSection(skillsSection)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // STANDARD LAYOUT (Harvard, Tech, Minimal, Bold, Neo)
  // ============================================================================

  const renderStandardLayout = () => (
    <div ref={contentRef} className={cn('w-full h-full p-8', isHarvard || isElegant ? 'font-serif' : 'font-sans')}>
      {renderHeader()}
      {visibleSections.map((section) => (
        <div key={section.id} className="mb-4">
          {renderSectionTitle(section.title)}
          {renderSection(section)}
        </div>
      ))}
    </div>
  );

  // ============================================================================
  // LAYOUT SELECTOR
  // ============================================================================

  const renderLayout = () => {
    if (isPortfolio) return renderPortfolioLayout();
    if (isCorporate) return renderCorporateLayout();
    if (isCreative) return renderCreativeLayout();
    if (isElegant) return renderElegantLayout();
    if (isModern) return renderModernLayout();
    return renderStandardLayout();
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('w-full h-full flex flex-col bg-muted/30', className)}>
      {/* Zoom Controls and Page Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-background border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-muted rounded-none transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-muted rounded-none transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-muted rounded-none transition-colors ml-1"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Page Navigation */}
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-muted rounded-none transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
              disabled={currentPage >= pageCount - 1}
              className="p-1 hover:bg-muted rounded-none transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 text-muted-foreground">
          <Move className="w-3 h-3" />
          <span className="text-[10px]">Drag to pan</span>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden p-4 cursor-grab select-none',
          isPanning && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="mx-auto bg-white border border-border shadow-sm overflow-hidden origin-center transition-transform duration-75"
          style={{
            width: '100%',
            maxWidth: '595px',
            aspectRatio: aspectRatio,
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          {renderLayout()}
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;
