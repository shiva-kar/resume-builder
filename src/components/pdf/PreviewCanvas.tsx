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

// Typography pixel sizes
const TYPO_PX = {
  sm: { name: 18, headers: 11, body: 9 },
  md: { name: 22, headers: 13, body: 10 },
  lg: { name: 26, headers: 15, body: 11 },
  xl: { name: 30, headers: 17, body: 12 },
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
    if (!item) return <p className="text-gray-400 italic text-[10px]">Add your skills</p>;

    // Elegant template - inline comma-separated list
    if (isElegant) {
      return (
        <div className="text-center">
          {item.skillsWithLevels?.length ? (
            <p className="text-gray-600 font-serif" style={{ fontSize: fontSize.itemBody }}>
              {item.skillsWithLevels.map((s, i) => (
                <span key={i}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-400 text-[9px] ml-1">({s.level})</span>
                  {i < item.skillsWithLevels!.length - 1 && <span className="mx-2 text-gray-300">·</span>}
                </span>
              ))}
            </p>
          ) : item.skills?.length ? (
            <p className="text-gray-600 font-serif" style={{ fontSize: fontSize.itemBody }}>
              {item.skills.join(' · ')}
            </p>
          ) : (
            <span className="text-gray-400 italic text-[10px]">Add your skills</span>
          )}
        </div>
      );
    }

    // Corporate template - clean pills with subtle border
    if (isCorporate) {
      return (
        <div className="space-y-2">
          {item.skillsWithLevels?.length ? (
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
          ) : item.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 text-[10px] bg-gray-100 text-gray-700 rounded">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 italic text-[10px]">Add your skills</span>
          )}
        </div>
      );
    }

    // Creative template - bold colorful tags
    if (isCreative) {
      return (
        <div className="space-y-2">
          {item.skillsWithLevels?.length ? (
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
          ) : item.skills?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {item.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-[10px] font-bold rounded"
                  style={{ backgroundColor: theme.color + '15', color: theme.color }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 italic text-[10px]">Add your skills</span>
          )}
        </div>
      );
    }

    // Modern template - minimal with accent dot
    if (isModern) {
      return (
        <div className="space-y-1.5">
          {item.skillsWithLevels?.length ? (
            item.skillsWithLevels.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px]">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="font-medium text-gray-800">{skill.name}</span>
                <span className="text-gray-400 text-[8px]">{skill.level}</span>
              </div>
            ))
          ) : item.skills?.length ? (
            item.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px]">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="text-gray-700">{skill}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-400 italic text-[10px]">Add your skills</span>
          )}
        </div>
      );
    }

    // Default rendering for other templates (Tech, Harvard, Minimal, Bold, Neo, Portfolio)
    return (
      <div className="space-y-2">
        {item.skillsWithLevels?.length ? (
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
        {item.skills?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {item.skills.map((skill, idx) => (
              <span
                key={idx}
                className={cn('px-2 py-0.5 text-[10px]', isNeo ? 'rounded-none' : 'rounded-sm')}
                style={{ backgroundColor: theme.color + '20', color: theme.color }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
        {!item.skills?.length && !item.skillsWithLevels?.length && (
          <span className="px-2 py-0.5 text-gray-400 italic text-[10px] bg-gray-100">Add your skills</span>
        )}
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
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    // Elegant template - centered with refined typography
    if (isElegant) {
      return section.items.map((item) => (
        <div key={item.id} className="mb-4 text-center">
          <h3 className="font-serif font-semibold text-gray-800" style={{ fontSize: fontSize.itemTitle }}>
            {section.type === 'experience'
              ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
              : section.type === 'education'
                ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
          </h3>
          <p className="font-serif text-gray-600" style={{ fontSize: fontSize.itemSubtitle }}>
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
            <p className="text-gray-600 whitespace-pre-line mt-2 max-w-lg mx-auto" style={{ fontSize: fontSize.itemBody }}>
              <RenderWithLinks text={item.description} />
            </p>
          )}
        </div>
      ));
    }

    // Corporate template - clean with left border accent
    if (isCorporate) {
      return section.items.map((item) => (
        <div key={item.id} className="mb-3 pl-3 border-l-2" style={{ borderLeftColor: theme.color + '40' }}>
          <div className="flex justify-between items-baseline">
            <h3 className="font-semibold text-gray-800" style={{ fontSize: fontSize.itemTitle }}>
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
            <span style={{ color: theme.color }}>
              {section.type === 'experience'
                ? item.company || <span className="text-gray-400">Company</span>
                : section.type === 'education'
                  ? item.institution || <span className="text-gray-400">Institution</span>
                  : item.subtitle || ''}
            </span>
            {item.location && <span className="text-gray-400">· {item.location}</span>}
          </div>
          {item.description && (
            <p className="text-gray-600 whitespace-pre-line mt-1.5" style={{ fontSize: fontSize.itemBody }}>
              <RenderWithLinks text={item.description} />
            </p>
          )}
        </div>
      ));
    }

    // Creative template - bold with accent block
    if (isCreative) {
      return section.items.map((item) => (
        <div key={item.id} className="mb-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded" style={{ backgroundColor: theme.color + '30' }} />
          <div className="pl-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
                  {section.type === 'experience'
                    ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
                    : section.type === 'education'
                      ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                      : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
                </h3>
                <p className="font-medium" style={{ fontSize: fontSize.itemSubtitle, color: theme.color }}>
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
              <p className="text-gray-600 whitespace-pre-line mt-2" style={{ fontSize: fontSize.itemBody }}>
                <RenderWithLinks text={item.description} />
              </p>
            )}
          </div>
        </div>
      ));
    }

    // Modern template - clean with subtle dividers
    if (isModern) {
      return section.items.map((item, idx) => (
        <div key={item.id} className={cn('mb-3 pb-3', idx < section.items.length - 1 && 'border-b border-gray-100')}>
          <div className="flex justify-between items-baseline">
            <h3 className="font-semibold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
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
            <span className="text-gray-600">
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
            <p className="text-gray-600 whitespace-pre-line mt-1.5" style={{ fontSize: fontSize.itemBody }}>
              <RenderWithLinks text={item.description} />
            </p>
          )}
        </div>
      ));
    }

    // Default layout for Harvard, Tech, Minimal, Bold, Neo, Portfolio
    return section.items.map((item) => (
      <div key={item.id} className="mb-2.5">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="font-bold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
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
          <span className="text-gray-600">
            {section.type === 'experience'
              ? item.company || <span className="text-gray-400">Company</span>
              : section.type === 'education'
                ? item.institution || <span className="text-gray-400">Institution</span>
                : item.subtitle || ''}
          </span>
          {item.location && <span className="text-gray-500">{item.location}</span>}
        </div>
        {item.description && (
          <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: fontSize.itemBody }}>
            <RenderWithLinks text={item.description} />
          </p>
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
          <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: fontSize.itemBody }}>
            <RenderWithLinks text={item.description} />
          </p>
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
        {personalInfo.fullName || <span className="text-gray-400 italic normal-case">Full Name</span>}
      </h1>
      {personalInfo.summary && (
        <p className="text-gray-600 mb-2" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      {renderContactInfo(true, false)}
    </div>
  );

  const renderTechHeader = () => (
    <div className="mb-6">
      <h1 className="font-extrabold tracking-tight mb-1" style={{ fontSize: fontSize.name, color: theme.color }}>
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
      </h1>
      {personalInfo.summary && (
        <p className="text-gray-500 mb-3" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      {renderContactInfo(false, true)}
    </div>
  );

  const renderMinimalHeader = () => (
    <div className="mb-8 text-center">
      <h1 className="font-light tracking-wide mb-2" style={{ fontSize: fontSize.name }}>
        {personalInfo.fullName || <span className="text-gray-400 italic">Full Name</span>}
      </h1>
      {personalInfo.summary && (
        <p className="text-gray-400 mb-3" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      {renderContactInfo(true, false)}
    </div>
  );

  const renderBoldHeader = () => (
    <div className="mb-6 border-b-4 pb-4" style={{ borderColor: theme.color }}>
      <h1
        className="font-black uppercase tracking-tight mb-1"
        style={{ fontSize: Math.round(fontSize.name * 1.15), color: theme.color }}
      >
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal normal-case">Full Name</span>}
      </h1>
      {personalInfo.summary && (
        <p className="text-gray-600 font-medium mb-3" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      {renderContactInfo(false, true)}
    </div>
  );

  const renderNeoHeader = () => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3" style={{ backgroundColor: theme.color }} />
        <h1 className="font-bold tracking-tight" style={{ fontSize: fontSize.name }}>
          {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
        </h1>
      </div>
      {personalInfo.summary && (
        <p className="text-gray-500 mb-3" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      {renderContactInfo(false, true)}
    </div>
  );

  // ============================================================================
  // CORPORATE HEADER - Professional boxed header with subtle divider
  // ============================================================================
  const renderCorporateHeader = () => (
    <div className="mb-6 bg-gray-50 p-5 border-l-4" style={{ borderLeftColor: theme.color }}>
      <h1 className="font-semibold tracking-normal mb-1" style={{ fontSize: fontSize.name, color: '#1f2937' }}>
        {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
      </h1>
      {personalInfo.summary && (
        <p className="text-gray-600 mb-3 leading-relaxed" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
      <div className="pt-3 border-t border-gray-200">
        {renderContactInfo(false, true)}
      </div>
    </div>
  );

  // ============================================================================
  // CREATIVE HEADER - Asymmetric layout with bold accent block
  // ============================================================================
  const renderCreativeHeader = () => (
    <div className="mb-8 relative">
      <div className="absolute top-0 left-0 w-16 h-16 opacity-20" style={{ backgroundColor: theme.color }} />
      <div className="pl-6 pt-4">
        <h1 className="font-black tracking-tight mb-2" style={{ fontSize: Math.round(fontSize.name * 1.1) }}>
          <span style={{ color: theme.color }}>{(personalInfo.fullName || 'Full Name').charAt(0)}</span>
          <span className="text-gray-900">{(personalInfo.fullName || 'Full Name').slice(1)}</span>
        </h1>
        {personalInfo.summary && (
          <p className="text-gray-600 italic mb-4 max-w-md" style={{ fontSize: fontSize.summary }}>
            &ldquo;{personalInfo.summary}&rdquo;
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm">
          {renderContactInfo(false, true)}
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // ELEGANT HEADER - Centered serif typography with ornamental line
  // ============================================================================
  const renderElegantHeader = () => (
    <div className="mb-8 text-center">
      <h1 className="font-serif font-normal tracking-wide mb-3" style={{ fontSize: Math.round(fontSize.name * 1.05), letterSpacing: '0.1em' }}>
        {personalInfo.fullName?.toUpperCase() || <span className="text-gray-400 italic normal-case">Full Name</span>}
      </h1>
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="h-px w-12 bg-gray-300" />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
        <div className="h-px w-12 bg-gray-300" />
      </div>
      {personalInfo.summary && (
        <p className="text-gray-500 font-serif italic mb-4 max-w-lg mx-auto" style={{ fontSize: fontSize.summary }}>
          {personalInfo.summary}
        </p>
      )}
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
          {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
        </h1>
        {personalInfo.summary && (
          <p className="text-gray-500 mb-3 leading-relaxed" style={{ fontSize: fontSize.summary }}>
            {personalInfo.summary}
          </p>
        )}
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
    // Neo - Geometric square accent
    if (isNeo) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5" style={{ backgroundColor: theme.color }} />
          <h2 className="font-bold uppercase tracking-wider text-gray-900" style={{ fontSize: fontSize.sectionHeading }}>
            {title}
          </h2>
        </div>
      );
    }

    // Corporate - Professional underline with accent
    if (isCorporate) {
      return (
        <div className="mb-3 pb-1 border-b-2 border-gray-200">
          <h2 className="font-semibold text-gray-800 tracking-normal" style={{ fontSize: fontSize.sectionHeading }}>
            {title}
          </h2>
        </div>
      );
    }

    // Creative - Bold with accent color background
    if (isCreative) {
      return (
        <div className="mb-3 flex items-center gap-2">
          <div className="px-2 py-0.5" style={{ backgroundColor: theme.color + '20' }}>
            <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: fontSize.sectionHeading, color: theme.color }}>
              {title}
            </h2>
          </div>
        </div>
      );
    }

    // Elegant - Serif with decorative elements
    if (isElegant) {
      return (
        <div className="mb-3 text-center">
          <h2 className="font-serif font-normal tracking-widest text-gray-700 uppercase" style={{ fontSize: Math.round(fontSize.sectionHeading * 0.9), letterSpacing: '0.15em' }}>
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-px w-8" style={{ backgroundColor: theme.color + '60' }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
            <div className="h-px w-8" style={{ backgroundColor: theme.color + '60' }} />
          </div>
        </div>
      );
    }

    // Modern - Clean with vertical accent bar
    if (isModern) {
      return (
        <div className="mb-2 flex items-center gap-2">
          <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: theme.color }} />
          <h2 className="font-semibold text-gray-900 tracking-tight" style={{ fontSize: fontSize.sectionHeading }}>
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

    // Minimal - Simple and light
    if (isMinimal) {
      return (
        <h2 className="font-medium mb-2 uppercase tracking-widest text-gray-500" style={{ fontSize: Math.round(fontSize.sectionHeading * 0.85) }}>
          {title}
        </h2>
      );
    }

    // Bold - Strong colored title
    if (isBold) {
      return (
        <h2 className="font-black mb-2 uppercase tracking-wider" style={{ fontSize: fontSize.sectionHeading, color: theme.color }}>
          {title}
        </h2>
      );
    }

    // Tech (default) - Accent colored
    return (
      <h2
        className="font-bold mb-2 uppercase tracking-wider"
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
            {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
          </h1>
          {personalInfo.summary && (
            <p className="mb-4" style={{ fontSize: fontSize.summary, color: theme.color }}>
              {personalInfo.summary}
            </p>
          )}

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
    <div ref={contentRef} className="w-full h-full px-12 py-10 font-serif">
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
