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
  GLOBAL_FONT_SCALES,
  LinkIconType,
  DEFAULT_TYPOGRAPHY,
  Section,
  SectionItem,
  SkillWithLevel,
} from '@/lib/schema';
import { cn } from '@/lib/utils';
import {
  formatDateRange as formatDate,
  ensureProtocol,
  formatUrlDisplay,
  isUrl,
  TYPOGRAPHY_PX as TYPO_PX,
  parseFormattedText,
  TextSegment,
} from '@/lib/formatting';
import { getTemplateBackground } from '@/lib/templates';

// Icon mapping
const PreviewIcons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
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

const normalizeKeyPart = (value: string): string => {
  const normalized = value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-+|-+$/g, '');
  return normalized || 'item';
};

const toKeyedItems = <T,>(
  items: T[],
  getSeed: (item: T) => string,
  prefix: string
): Array<{ key: string; item: T }> => {
  const counters = new Map<string, number>();
  return items.map((item) => {
    const seed = normalizeKeyPart(getSeed(item));
    const occurrence = (counters.get(seed) ?? 0) + 1;
    counters.set(seed, occurrence);
    return {
      key: `${prefix}-${seed}-${occurrence}`,
      item,
    };
  });
};

type UrlToken = {
  type: 'text' | 'url';
  value: string;
};

const tokenizeTextWithUrls = (text: string): UrlToken[] => {
  const pattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const tokens: UrlToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    tokens.push({ type: 'url', value: match[0] });
    lastIndex = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
};

// Render text with clickable links
const RenderWithLinks: React.FC<{ text: string; className?: string; style?: React.CSSProperties }> = ({
  text,
  className,
  style,
}) => {
  if (!text) return null;
  const tokens = tokenizeTextWithUrls(text);
  const keyedTokens = toKeyedItems(tokens, (token) => `${token.type}-${token.value}`, 'url-token');

  return (
    <span className={className} style={style}>
      {keyedTokens.map(({ key, item: token }) => {
        if (token.type === 'url') {
          const href = ensureProtocol(token.value);
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {formatUrlDisplay(token.value)}
            </a>
          );
        }
        return <span key={key}>{token.value}</span>;
      })}
    </span>
  );
};

// Rich Text Renderer

interface RichTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  themeColor?: string;
}

const renderInlineSegment = (segment: TextSegment, key: string): React.ReactNode => {
  switch (segment.type) {
    case 'boldItalic':
      return <strong key={key} className="font-bold italic">{segment.content}</strong>;
    case 'bold':
      return <strong key={key} className="font-bold">{segment.content}</strong>;
    case 'italic':
      return <em key={key} className="italic">{segment.content}</em>;
    case 'link':
      return (
        <a
          key={key}
          href={ensureProtocol(segment.href || segment.content)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {segment.content}
        </a>
      );
    default:
      return <span key={key}>{segment.content}</span>;
  }
};

const RenderInlineMarkdown: React.FC<{ segments: TextSegment[] }> = ({ segments }) => {
  if (!segments.length) {
    return null;
  }

  const keyedSegments = toKeyedItems(
    segments,
    (segment) => `${segment.type}-${segment.content}-${segment.href ?? ''}`,
    'inline-segment'
  );

  return <>{keyedSegments.map(({ key, item }) => renderInlineSegment(item, key))}</>;
};

// Main rich text renderer with bullets, numbered lists, and markdown
const RichText: React.FC<RichTextProps> = ({ text, className, style, themeColor }) => {
  if (!text) return null;

  const parsedLines = parseFormattedText(text);
  const keyedLines = toKeyedItems(
    parsedLines,
    (line) => `${line.type}-${line.level ?? ''}-${line.number ?? ''}-${line.content}`,
    'rich-line'
  );

  const headerStyles: Record<number, string> = {
    1: 'text-lg font-bold',
    2: 'text-base font-bold',
    3: 'text-sm font-semibold',
    4: 'text-sm font-medium',
    5: 'text-xs font-medium',
    6: 'text-xs font-normal',
  };

  return (
    <div className={className} style={style}>
      {keyedLines.map(({ key, item: line }) => {
        if (line.type === 'empty') {
          return <div key={key} className="h-2" />;
        }

        if (line.type === 'header') {
          const level = line.level ?? 3;
          return (
            <div key={key} className={headerStyles[level] || headerStyles[3]} style={{ color: themeColor }}>
              <RenderInlineMarkdown segments={line.segments} />
            </div>
          );
        }

        if (line.type === 'bullet') {
          return (
            <div key={key} className="flex items-start gap-2 ml-1">
              <span className="mt-[0.4em] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor || '#6b7280' }} />
              <span><RenderInlineMarkdown segments={line.segments} /></span>
            </div>
          );
        }

        if (line.type === 'numbered') {
          return (
            <div key={key} className="flex items-start gap-2 ml-1">
              <span className="font-medium min-w-[1.25em] text-right flex-shrink-0" style={{ color: themeColor || '#6b7280' }}>
                {line.number}.
              </span>
              <span><RenderInlineMarkdown segments={line.segments} /></span>
            </div>
          );
        }

        return (
          <div key={key}>
            <RenderInlineMarkdown segments={line.segments} />
          </div>
        );
      })}
    </div>
  );
};

// Dummy data for preview (shows realistic layout when sections are empty)

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
    <span className={cn('contact-item', !showIcon && 'contact-item-no-icon')} style={{ fontSize }}>
      {showIcon && Icon && <Icon className="contact-icon" style={{ color }} />}
      <span className="contact-value">{displayValue}</span>
    </span>
  );

  if (href) {
    return (
      <a
        href={ensureProtocol(href)}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline contact-link"
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
  resumeRef?: React.MutableRefObject<HTMLDivElement | null>;
  className?: string;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ data, resumeRef, className }) => {
  const { personalInfo, sections, theme } = data;
  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

  // Locked 1:1 render state to keep preview and export pixel-identical
  const zoom = 1;
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

  const handleZoomIn = () => undefined;
  const handleZoomOut = () => undefined;
  const handleReset = () => undefined;

  const setResumeExportNode = (node: HTMLDivElement | null): void => {
    if (resumeRef) {
      resumeRef.current = node;
    }
  };

  // ============================================================================
  // CONTACT INFO RENDERER
  // ============================================================================

  const renderContactInfo = (centered = false, showIcons = true) => {
    const rawItems = [
      { icon: Mail, value: personalInfo.email, href: `mailto:${personalInfo.email}` },
      { icon: Phone, value: personalInfo.phone, href: `tel:${personalInfo.phone?.replaceAll(/\s/g, '')}` },
      { icon: MapPin, value: personalInfo.location, href: undefined },
      { icon: Linkedin, value: personalInfo.linkedin, href: personalInfo.linkedin },
      { icon: Github, value: personalInfo.github, href: personalInfo.github },
      { icon: Globe, value: personalInfo.website, href: personalInfo.website },
    ];

    const items = rawItems.reduce<Array<{ icon: ContactItemProps['icon']; value: string; href?: string }>>(
      (acc, item) => {
        if (!item.value) {
          return acc;
        }

        acc.push({
          icon: item.icon,
          value: item.value,
          href: item.href,
        });
        return acc;
      },
      []
    );

    const keyedItems = toKeyedItems(items, (item) => `${item.value}-${item.href ?? ''}`, 'contact');

    return (
      <div
        className={cn('contact-row text-gray-600', centered && 'contact-row-centered')}
        style={{ fontSize: fontSize.contact }}
      >
        {keyedItems.map(({ key, item }) => (
          <ContactItem
            key={key}
            icon={item.icon}
            value={item.value}
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

  const getSkillsPayload = (section: Section): {
    skillsWithLevels: SkillWithLevel[];
    displaySkills: string[];
    isDummy: boolean;
  } => {
    const item = section.items[0];
    const skillsWithLevels = item?.skillsWithLevels || [];
    const hasLevelSkills = skillsWithLevels.length > 0;
    const hasPlainSkills = Boolean(item?.skills?.length);
    const hasAnySkills = hasLevelSkills || hasPlainSkills;

    return {
      skillsWithLevels,
      displaySkills: hasPlainSkills ? (item?.skills || []) : DUMMY_DATA.skills,
      isDummy: !hasAnySkills,
    };
  };

  const renderElegantSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    if (skillsWithLevels.length > 0) {
      const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
      const lastKey = keyedLevels.at(-1)?.key;
      return (
        <div className="text-center">
          <p className="text-gray-600 font-serif" style={{ fontSize: fontSize.itemBody }}>
            {keyedLevels.map(({ key, item }) => (
              <span key={key}>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400 text-[9px] ml-1">({item.level})</span>
                {key !== lastKey && <span className="mx-2 text-gray-300">·</span>}
              </span>
            ))}
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className={cn('font-serif', isDummy ? 'text-gray-400 italic' : 'text-gray-600')} style={{ fontSize: fontSize.itemBody }}>
          {displaySkills.join(' · ')}
        </p>
      </div>
    );
  };

  const renderCorporateSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    if (skillsWithLevels.length > 0) {
      const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
      return (
        <div className="space-y-2">
          <div className="skills-container">
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className="skill-chip border border-gray-200 bg-white text-[10px]">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="ml-1.5 text-gray-400 text-[8px]">{item.level}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className="space-y-2">
        <div className={cn('skills-container', isDummy && 'opacity-60')}>
          {keyedSkills.map(({ key, item }) => (
            <span key={key} className={cn('skill-chip text-[10px]', isDummy ? 'bg-gray-100 text-gray-400 italic' : 'bg-gray-100 text-gray-700')}>
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCreativeSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    if (skillsWithLevels.length > 0) {
      const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
      return (
        <div className="space-y-2">
          <div className="skills-container skills-container-compact">
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className="skill-chip text-[10px] font-bold" style={{ backgroundColor: theme.color + '15', color: theme.color }}>
                {item.name}
                <span className="ml-1 opacity-60 text-[8px] font-normal">• {item.level}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className="space-y-2">
        <div className={cn('skills-container skills-container-compact', isDummy && 'opacity-60')}>
          {keyedSkills.map(({ key, item }) => (
            <span
              key={key}
              className={cn('skill-chip text-[10px]', isDummy ? 'font-normal italic' : 'font-bold')}
              style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '15', color: isDummy ? '#9ca3af' : theme.color }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderModernSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    if (skillsWithLevels.length > 0) {
      const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
      return (
        <div className="space-y-1.5">
          {keyedLevels.map(({ key, item }) => (
            <div key={key} className="flex items-center gap-2 text-[10px]">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-400 text-[8px]">{item.level}</span>
            </div>
          ))}
        </div>
      );
    }

    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className={isDummy ? 'opacity-60' : ''}>
        {keyedSkills.map(({ key, item }) => (
          <div key={key} className="flex items-center gap-2 text-[10px]">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isDummy ? '#9ca3af' : theme.color }} />
            <span className={isDummy ? 'text-gray-400 italic' : 'text-gray-700'}>{item}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');

    return (
      <div className="space-y-2">
        {keyedLevels.length > 0 && (
          <div className="skills-container skills-container-compact">
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className={cn('skill-chip text-[10px] font-medium border border-gray-200', isNeo ? 'rounded-none' : 'rounded')}>
                <span className="font-semibold" style={{ color: isTech || isBold ? theme.color : 'inherit' }}>
                  {item.name}
                </span>
                <span className="ml-1 text-gray-400 text-[8px] uppercase">{item.level}</span>
              </span>
            ))}
          </div>
        )}
        <div className={cn('skills-container skills-container-compact', isDummy && 'opacity-60')}>
          {keyedSkills.map(({ key, item }) => (
            <span
              key={key}
              className={cn('skill-chip text-[10px]', isNeo ? 'rounded-none' : 'rounded-sm', isDummy && 'italic')}
              style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '20', color: isDummy ? '#9ca3af' : theme.color }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (section: Section) => {
    const { skillsWithLevels, displaySkills, isDummy } = getSkillsPayload(section);

    switch (theme.template) {
      case 'elegant':
        return renderElegantSkills(skillsWithLevels, displaySkills, isDummy);
      case 'corporate':
        return renderCorporateSkills(skillsWithLevels, displaySkills, isDummy);
      case 'creative':
        return renderCreativeSkills(skillsWithLevels, displaySkills, isDummy);
      case 'modern':
        return renderModernSkills(skillsWithLevels, displaySkills, isDummy);
      case 'harvard':
        return (
          <p className={cn('font-serif', isDummy ? 'text-gray-400 italic' : 'text-gray-700')} style={{ fontSize: fontSize.itemBody }}>
            {skillsWithLevels.length > 0
              ? skillsWithLevels.map((skill) => skill.name).join(', ')
              : displaySkills.join(', ')}
          </p>
        );
      default:
        return renderDefaultSkills(skillsWithLevels, displaySkills, isDummy);
    }
  };

  const getCustomFieldValue = (item: SectionItem, fieldId: string): unknown => {
    const field = (item.customFields || []).find((customField) => customField.fieldId === fieldId);
    return field?.value;
  };

  const toStringValue = (value: unknown): string => {
    return typeof value === 'string' ? value : '';
  };

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((entry): entry is string => typeof entry === 'string');
  };

  const getItemTitleContent = (sectionType: Section['type'], item: SectionItem): React.ReactNode => {
    if (sectionType === 'experience') {
      return item.position || <span className="text-gray-400 italic font-normal">Position</span>;
    }
    if (sectionType === 'education') {
      return item.degree || <span className="text-gray-400 italic font-normal">Degree</span>;
    }
    return item.title || <span className="text-gray-400 italic font-normal">Title</span>;
  };

  const getItemSubtitleContent = (sectionType: Section['type'], item: SectionItem): React.ReactNode => {
    if (sectionType === 'experience') {
      return item.company || <span className="text-gray-400">Company</span>;
    }
    if (sectionType === 'education') {
      return item.institution || <span className="text-gray-400">Institution</span>;
    }
    return item.subtitle || '';
  };

  const getDummyItemsBySectionType = (sectionType: Section['type']) => {
    if (sectionType === 'experience') {
      return DUMMY_DATA.experience;
    }
    if (sectionType === 'education') {
      return DUMMY_DATA.education;
    }
    return [];
  };

  const renderCustomSection = (section: Section) => {
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    const fieldDefs = section.fieldDefinitions || [];

    return section.items.map((item) => {
      const titleField = fieldDefs.find((f) => f.type === 'text');
      const dateField = fieldDefs.find((f) => f.type === 'date' || f.type === 'dateRange');
      const linkField = fieldDefs.find((f) => f.type === 'link');
      const tagsField = fieldDefs.find((f) => f.type === 'tags');
      const textareaField = fieldDefs.find((f) => f.type === 'textarea');

      const title = titleField ? toStringValue(getCustomFieldValue(item, titleField.id)) : '';
      const linkValue = linkField ? toStringValue(getCustomFieldValue(item, linkField.id)) : '';
      const tagsValue = tagsField ? toStringArray(getCustomFieldValue(item, tagsField.id)) : [];
      const description = textareaField ? toStringValue(getCustomFieldValue(item, textareaField.id)) : '';

      let dateDisplay = '';
      if (dateField) {
        const dateValue = toStringValue(getCustomFieldValue(item, dateField.id));
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
              const val = toStringValue(getCustomFieldValue(item, f.id));
              return val ? (
                <p key={f.id} className="text-gray-600" style={{ fontSize: fontSize.itemSubtitle }}>
                  <RenderWithLinks text={val} />
                </p>
              ) : null;
            })}

          {tagsValue && tagsValue.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {toKeyedItems(tagsValue, (tag) => tag, 'custom-tag').map(({ key, item: tag }) => (
                <span
                  key={key}
                  className={cn('px-1.5 py-0.5 text-[9px]', isNeo ? 'rounded-none' : 'rounded')}
                  style={{ backgroundColor: theme.color + '20', color: theme.color }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {description && (
            <RichText
              text={description}
              className="text-gray-700 mt-1"
              style={{ fontSize: fontSize.itemBody }}
              themeColor={theme.color}
            />
          )}
        </div>
      );
    });
  };

  const renderExperienceEducation = (section: Section) => {
    // Use dummy data if section is empty
    const isDummy = !section.items.length;
    const dummyItems = getDummyItemsBySectionType(section.type);
    const itemsToRender = isDummy ? dummyItems : section.items;

    if (!itemsToRender.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    // Elegant template - centered with refined typography
    if (isElegant) {
      return itemsToRender.map((item) => (
        <div key={item.id} className={cn('mb-4 text-center', isDummy && 'opacity-60')}>
          <h3 className={cn('font-serif font-semibold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-800')} style={{ fontSize: fontSize.itemTitle }}>
            {getItemTitleContent(section.type, item)}
          </h3>
          <p className={cn('font-serif', isDummy ? 'text-gray-400' : 'text-gray-600')} style={{ fontSize: fontSize.itemSubtitle }}>
            {getItemSubtitleContent(section.type, item)}
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
              {getItemTitleContent(section.type, item)}
            </h3>
            <span className="text-gray-500 text-[10px] uppercase tracking-wide">
              {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: fontSize.itemSubtitle }}>
            <span style={{ color: isDummy ? '#9ca3af' : theme.color }}>
              {getItemSubtitleContent(section.type, item)}
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
                  {getItemTitleContent(section.type, item)}
                </h3>
                <p className="font-medium" style={{ fontSize: fontSize.itemSubtitle, color: isDummy ? '#9ca3af' : theme.color }}>
                  {getItemSubtitleContent(section.type, item)}
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
              {getItemTitleContent(section.type, item)}
            </h3>
            <span className="text-gray-400 text-[10px]">
              {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5" style={{ fontSize: fontSize.itemSubtitle }}>
            <span className={isDummy ? 'text-gray-400' : 'text-gray-600'}>
              {getItemSubtitleContent(section.type, item)}
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
            {getItemTitleContent(section.type, item)}
          </h3>
          <span className="text-gray-500 italic ml-4 whitespace-nowrap" style={{ fontSize: fontSize.itemDate }}>
            {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
          </span>
        </div>
        <div className="flex justify-between items-center" style={{ fontSize: fontSize.itemSubtitle }}>
          <span className={isDummy ? 'text-gray-400' : 'text-gray-600'}>
            {getItemSubtitleContent(section.type, item)}
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
      case 'projects':
      case 'certifications':
        return section.fieldDefinitions?.length ? renderCustomSection(section) : renderProjectsCertifications(section);
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
          {renderContactInfo(false, true)}
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
        {renderContactInfo(false, true)}
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
            <div key={section.id} className="section-block">
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
          <div key={section.id} className="section-block bg-gray-50/50 p-4 rounded border border-gray-100">
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
        <div className="main-grid">
          <div className="left-column section">
            {experienceSection && (
              <div className="section-block">
                {renderSectionTitle(experienceSection.title)}
                {renderSection(experienceSection)}
              </div>
            )}
            {otherSections.map((section) => (
              <div key={section.id} className="section-block">
                {renderSectionTitle(section.title)}
                {renderSection(section)}
              </div>
            ))}
          </div>

          <div className="right-column">
            <div className="skills-card" style={{ backgroundColor: theme.color + '08' }}>
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

  // Elegant layout - Centered serif with generous spacing
  const renderElegantLayout = () => (
    <div ref={contentRef} className="w-full h-full px-12 py-10 font-serif" style={{ backgroundColor: getTemplateBackground('elegant') }}>
      {renderElegantHeader()}
      <div className="max-w-2xl mx-auto space-y-8">
        {visibleSections.map((section) => (
          <div key={section.id} className="section-block">
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

          <div className="main-grid">
            <div className="left-column section">
              {mainSections.map((section) => (
                <div key={section.id} className="section-block border-l-2 border-gray-100 pl-4">
                  {renderSectionTitle(section.title)}
                  {renderSection(section)}
                </div>
              ))}
            </div>

            <div className="right-column">
              {skillsSection && (
                <div className="skills-card" style={{ backgroundColor: '#f9fafb' }}>
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
        <div key={section.id} className="section-block">
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
            type="button"
            onClick={handleZoomOut}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed"
            title="Zoom is locked to 100% for export consistency"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed"
            title="Zoom is locked to 100% for export consistency"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled
            className="p-1.5 rounded-none text-muted-foreground/50 cursor-not-allowed ml-1"
            title="View is already reset"
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
          <span className="text-[10px]">1:1 render lock</span>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 w-full"
      >
        <div className="preview-wrapper mx-auto border border-border shadow-sm bg-white">
          <div
            ref={setResumeExportNode}
            id="resume-pdf-export-container"
            className="resume-container"
            style={{
              backgroundColor: getTemplateBackground(theme.template),
              boxSizing: 'border-box',
            }}
          >
            {renderLayout()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;
