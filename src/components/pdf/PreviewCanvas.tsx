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
import { PAPER_SIZES, PaperSize } from '@/lib/paperSizes';
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

// Context for passing spacer heights from the pagination engine to PageBreakable components
const SpacerContext = React.createContext<Record<string, number>>({});

export const PageBreakable: React.FC<{ children: React.ReactNode; id?: string; className?: string; style?: React.CSSProperties }> = ({ children, id, className, style }) => {
  const spacerMap = React.useContext(SpacerContext);
  const spacerHeight = (id && spacerMap[id]) || 0;
  return (
    <div className={cn("page-breakable-container", className)} style={style}>
      <div className="page-spacer" style={{ height: `${spacerHeight}px` }} />
      <div className="page-breakable-content flow-root" data-breakable-id={id}>
        {children}
      </div>
    </div>
  );
};

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
    title: 'Senior Software Engineer',
    email: 'email@example.com',
    phone: '(555) 123-4567',
    location: 'City, State',
    summary: 'A brief professional summary highlighting key skills, experience, and career objectives.',
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
  spacerMap?: Record<string, number>;
  resumeRef?: React.MutableRefObject<HTMLDivElement | null>;
  className?: string;
  minHeight?: number;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ 
  data, 
  spacerMap, 
  resumeRef, 
  className,
  minHeight 
}) => {
  const { personalInfo, sections, theme } = data;
  const typography = theme.typography || DEFAULT_TYPOGRAPHY;

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
  const fontSize = useMemo(() => {
    // Fallback to 'body' size for older saved themes that don't have experience/skills
    const expSize = typography.experience || typography.body || 'sm';
    const skillsSize = typography.skills || typography.body || 'sm';
    
    const expBase = TYPO_PX[expSize].experience;
    return {
      name: Math.round(TYPO_PX[typography.name || 'lg'].name * scale),
      summary: Math.round(TYPO_PX[typography.headers || 'md'].headers * scale),
      contact: Math.round(TYPO_PX[typography.body || 'sm'].body * scale),
      sectionHeading: Math.round((TYPO_PX[typography.headers || 'md'].headers + 1) * scale),
      itemTitle: Math.round((expBase + 3) * scale),
      itemSubtitle: Math.round((expBase + 1) * scale),
      itemBody: Math.round(expBase * scale),
      itemDate: Math.round((expBase - 1) * scale),
      skills: Math.round(TYPO_PX[skillsSize].skills * scale),
    };
  }, [typography, scale]);

  // Visible sections
  const visibleSections = useMemo(() => sections.filter((s) => s.isVisible), [sections]);

  const setResumeExportNode = (node: HTMLDivElement | null): void => {
    if (resumeRef) {
      resumeRef.current = node;
    }
  };

  // ============================================================================
  // CONTACT INFO RENDERER
  // ============================================================================

  const renderContactInfo = (centered = false, showIcons = true, layout: 'row' | 'column' = 'row') => {
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
        className={cn(layout === 'row' ? 'contact-row' : 'contact-column', 'text-gray-600', centered && 'contact-row-centered')}
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
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    return (
      <div className="text-center space-y-1">
        {keyedLevels.length > 0 && (
          <p className="text-gray-600 font-serif" style={{ fontSize: fontSize.itemBody }}>
            {keyedLevels.map(({ key, item }, index) => (
              <span key={key}>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400 text-[9px] ml-1">({item.level})</span>
                {index !== keyedLevels.length - 1 && <span className="mx-2 text-gray-300">·</span>}
              </span>
            ))}
          </p>
        )}
        {displaySkills.length > 0 && (
          <p className={cn('font-serif', isDummy ? 'text-gray-400 italic' : 'text-gray-600')} style={{ fontSize: fontSize.itemBody }}>
            {displaySkills.join(' · ')}
          </p>
        )}
      </div>
    );
  };

  const renderCorporateSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className="space-y-2">
        {keyedLevels.length > 0 && (
          <div className="skills-container">
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className="skill-chip border border-gray-200 bg-white" style={{ fontSize: fontSize.skills }}>
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="ml-1.5 text-gray-400" style={{ fontSize: Math.max(8, fontSize.skills - 2) }}>{item.level}</span>
              </span>
            ))}
          </div>
        )}
        {keyedSkills.length > 0 && (
          <div className={cn('skills-container', isDummy && 'opacity-60')}>
            {keyedSkills.map(({ key, item }) => (
              <span key={key} className={cn('skill-chip', isDummy ? 'bg-gray-100 text-gray-400 italic' : 'bg-gray-100 text-gray-700')} style={{ fontSize: fontSize.skills }}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCreativeSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className="space-y-2">
        {keyedLevels.length > 0 && (
          <div className="skills-container skills-container-compact">
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className="skill-chip font-bold" style={{ backgroundColor: theme.color + '15', color: theme.color, fontSize: fontSize.skills }}>
                {item.name}
                <span className="ml-1 opacity-60 font-normal" style={{ fontSize: Math.max(8, fontSize.skills - 2) }}>• {item.level}</span>
              </span>
            ))}
          </div>
        )}
        {keyedSkills.length > 0 && (
          <div className={cn('skills-container skills-container-compact', isDummy && 'opacity-60')}>
            {keyedSkills.map(({ key, item }) => (
              <span
                key={key}
                className={cn('skill-chip', isDummy ? 'font-normal italic' : 'font-bold')}
                style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '15', color: isDummy ? '#9ca3af' : theme.color, fontSize: fontSize.skills }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderModernSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');
    return (
      <div className="space-y-1.5">
        {keyedLevels.map(({ key, item }) => (
          <div key={key} className="flex items-center gap-2" style={{ fontSize: fontSize.skills }}>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
            <span className="font-medium text-gray-800">{item.name}</span>
            <span className="text-gray-400" style={{ fontSize: Math.max(8, fontSize.skills - 2) }}>{item.level}</span>
          </div>
        ))}
        {keyedSkills.length > 0 && (
          <div className={cn("flex flex-wrap gap-x-4 gap-y-1.5", keyedLevels.length > 0 ? "mt-1" : "", isDummy ? 'opacity-60' : '')}>
            {keyedSkills.map(({ key, item }) => (
              <div key={key} className="flex items-center gap-2" style={{ fontSize: fontSize.skills }}>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isDummy ? '#9ca3af' : theme.color }} />
                <span className={isDummy ? 'text-gray-400 italic' : 'text-gray-700'}>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDefaultSkills = (skillsWithLevels: SkillWithLevel[], displaySkills: string[], isDummy: boolean) => {
    const keyedLevels = toKeyedItems(skillsWithLevels, (skill) => `${skill.name}-${skill.level}`, 'skill-level');
    const keyedSkills = toKeyedItems(displaySkills, (skill) => skill, 'skill');

    const containerClass = "skills-container skills-container-compact";
    return (
      <div className="space-y-2">
        {keyedLevels.length > 0 && (
          <div className={containerClass}>
            {keyedLevels.map(({ key, item }) => (
              <span key={key} className={cn('skill-chip font-medium border border-gray-200', isNeo ? 'rounded-none' : 'rounded')} style={{ fontSize: fontSize.skills }}>
                <span className="font-semibold" style={{ color: isTech || isBold ? theme.color : 'inherit' }}>
                  {item.name}
                </span>
                <span className="ml-1 text-gray-400 uppercase" style={{ fontSize: Math.max(8, fontSize.skills - 2) }}>{item.level}</span>
              </span>
            ))}
          </div>
        )}
        <div className={cn(containerClass, isDummy && 'opacity-60')}>
          {keyedSkills.map(({ key, item }) => (
            <span
              key={key}
              className={cn('skill-chip', isNeo ? 'rounded-none' : 'rounded-sm', isDummy && 'italic')}
              style={{ backgroundColor: isDummy ? '#f3f4f6' : theme.color + '20', color: isDummy ? '#9ca3af' : theme.color, fontSize: fontSize.skills }}
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
          <div className={cn('font-serif space-y-1', isDummy ? 'text-gray-400 italic' : 'text-gray-700')} style={{ fontSize: fontSize.itemBody }}>
            {skillsWithLevels.length > 0 && (
              <p>
                {skillsWithLevels.map((skill) => `${skill.name} (${skill.level})`).join(', ')}
              </p>
            )}
            {displaySkills.length > 0 && (
              <p>
                {displaySkills.join(', ')}
              </p>
            )}
          </div>
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

  const renderCustomSection = (section: Section, sectionTitle?: string) => {
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    const fieldDefs = section.fieldDefinitions || [];

    return section.items.map((item, index) => {
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
        <PageBreakable key={item.id} id={item.id} className="mb-2.5">
          {index === 0 && sectionTitle && renderSectionTitle(sectionTitle)}
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
        </PageBreakable>
      );
    });
  };

  const renderExperienceEducation = (section: Section, sectionTitle?: string) => {
    // Use dummy data if section is empty
    const isDummy = !section.items.length;
    const dummyItems = getDummyItemsBySectionType(section.type);
    const itemsToRender = isDummy ? dummyItems : section.items;

    if (!itemsToRender.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    if (isModern || isNeo || isCreative || isElegant) {
      return itemsToRender.map((item, index) => (
        <PageBreakable key={item.id} id={item.id} className={cn('mb-4', isDummy && 'opacity-60')}>
          {index === 0 && sectionTitle && renderSectionTitle(sectionTitle)}
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={cn('font-bold', isDummy ? 'text-gray-400 italic font-normal' : 'text-gray-900')} style={{ fontSize: fontSize.itemTitle, color: isModern ? theme.color : undefined }}>
              {getItemTitleContent(section.type, item)}
            </h3>
            <span className="text-gray-400" style={{ fontSize: fontSize.itemDate }}>
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
        </PageBreakable>
      ));
    }

    // Default layout for Harvard, Tech, Minimal, Bold, Neo, Portfolio
    return itemsToRender.map((item, index) => (
      <PageBreakable key={item.id} id={item.id} className={cn('mb-2.5', isDummy && 'opacity-60')}>
        {index === 0 && sectionTitle && renderSectionTitle(sectionTitle)}
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
      </PageBreakable>
    ));
  };

  const renderProjectsCertifications = (section: Section, sectionTitle?: string) => {
    if (!section.items.length) {
      return <p className="text-gray-400 italic" style={{ fontSize: fontSize.itemBody }}>Add items to this section</p>;
    }

    return section.items.map((item, index) => (
      <PageBreakable key={item.id} id={item.id} className="mb-2.5">
        {index === 0 && sectionTitle && renderSectionTitle(sectionTitle)}
        <div className="flex justify-between items-baseline mb-0.5">
          <div className="flex items-center gap-2">
            {item.subtitle && isUrl(item.subtitle) ? (
              <a
                href={ensureProtocol(item.subtitle)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline"
                style={{ fontSize: fontSize.itemTitle, color: theme.color }}
              >
                {item.title}
              </a>
            ) : (
              <h3 className="font-bold text-gray-900" style={{ fontSize: fontSize.itemTitle }}>
                {item.title}
              </h3>
            )}
          </div>
          <span className="text-gray-500 italic ml-4 whitespace-nowrap" style={{ fontSize: fontSize.itemDate }}>
            {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
          </span>
        </div>
        {item.subtitle && !isUrl(item.subtitle) && (
          <div className="text-gray-600" style={{ fontSize: fontSize.itemSubtitle }}>
            {item.subtitle}
          </div>
        )}
        {item.description && (
          <RichText
            text={item.description}
            className="mt-1 text-gray-700"
            style={{ fontSize: fontSize.itemBody }}
            themeColor={theme.color}
          />
        )}
      </PageBreakable>
    ));
  };

  const renderSection = (section: Section, sectionTitle?: string) => {
    switch (section.type) {
      case 'skills':
        return (
          <PageBreakable id={section.id}>
            {sectionTitle && renderSectionTitle(sectionTitle)}
            {renderSkillsSection(section)}
          </PageBreakable>
        );
      case 'custom':
      case 'projects':
      case 'certifications':
        return section.fieldDefinitions?.length ? renderCustomSection(section, sectionTitle) : renderProjectsCertifications(section, sectionTitle);
      default:
        return renderExperienceEducation(section, sectionTitle);
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
      <div className="text-gray-600 mb-1 font-medium" style={{ fontSize: fontSize.summary }}>
        {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
      </div>
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
      <div className="text-gray-700 font-semibold mb-1" style={{ fontSize: Math.round(fontSize.summary * 1.1) }}>
        {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
      </div>
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
      <div className="text-gray-500 tracking-widest uppercase mb-2" style={{ fontSize: fontSize.itemSubtitle }}>
        {personalInfo.title || <span className="text-gray-400 italic normal-case">{DUMMY_DATA.personalInfo.title}</span>}
      </div>
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
      <div className="font-bold text-gray-800 mb-1" style={{ fontSize: Math.round(fontSize.summary * 1.1) }}>
        {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
      </div>
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
      <div className="font-medium text-gray-800 mb-1" style={{ fontSize: fontSize.summary }}>
        {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
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
      <div className="font-medium text-gray-700 mb-1.5" style={{ fontSize: Math.round(fontSize.summary * 1.05) }}>
        {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
      </div>
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
          <div className="font-semibold text-gray-800 mb-1" style={{ fontSize: Math.round(fontSize.summary * 1.05) }}>
            {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
          </div>
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
      <div className="font-serif text-gray-700 tracking-wide mb-2" style={{ fontSize: Math.round(fontSize.summary * 1.1) }}>
        {personalInfo.title?.toUpperCase() || <span className="text-gray-400 italic normal-case">{DUMMY_DATA.personalInfo.title.toUpperCase()}</span>}
      </div>
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
        <div className="font-semibold text-gray-700 mb-1" style={{ fontSize: Math.round(fontSize.summary * 1.05) }}>
          {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
        </div>
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
      <div className="flex min-h-full">
        <div className="w-1/3 p-6 bg-gray-50 border-r border-gray-200">
          <h1 className="font-bold mb-1" style={{ fontSize: fontSize.name }}>
            {personalInfo.fullName || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.fullName}</span>}
          </h1>
          <div className="font-semibold text-gray-700 mb-1.5" style={{ fontSize: Math.round(fontSize.summary * 1.05) }}>
            {personalInfo.title || <span className="text-gray-400 italic font-normal">{DUMMY_DATA.personalInfo.title}</span>}
          </div>
          <p className="mb-4" style={{ fontSize: fontSize.summary, color: personalInfo.summary ? theme.color : '#9ca3af' }}>
            {personalInfo.summary || <span className="italic">{DUMMY_DATA.personalInfo.summary}</span>}
          </p>

          <div className="space-y-2 mb-6">{renderContactInfo(false, true, 'column')}</div>

          {skillsSection && (
            <div className="mt-4">
              <PageBreakable id={`skills-${skillsSection.id}`}>
                {renderSectionTitle(skillsSection.title)}
                {renderSkillsSection(skillsSection)}
              </PageBreakable>
            </div>
          )}
        </div>

        <div className="w-2/3 p-6">
          {mainSections.map((section) => (
            <div key={section.id} className="section-block">
              {renderSection(section, section.title)}
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
    <div  className="w-full min-h-full p-8 font-sans bg-white">
      {renderCorporateHeader()}
      <div className="space-y-5">
        {visibleSections.map((section) => (
          <div key={section.id} className="section-block bg-gray-50/50 p-4 rounded border border-gray-100">
            {renderSection(section, section.title)}
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
      <div  className="w-full min-h-full p-6 font-sans">
        {renderCreativeHeader()}

        {/* Main content in asymmetric grid */}
        <div className="main-grid">
          <div className="left-column section">
            {experienceSection && (
              <div className="section-block">
                {renderSection(experienceSection, experienceSection.title)}
              </div>
            )}
            {otherSections.map((section) => (
              <div key={section.id} className="section-block">
                {renderSection(section, section.title)}
              </div>
            ))}
          </div>

          <div className="right-column">
            <div className="skills-card" style={{ backgroundColor: theme.color + '08' }}>
              {skillsSection && (
                <PageBreakable id={`skills-${skillsSection.id}`}>
                  {renderSectionTitle(skillsSection.title)}
                  {renderSkillsSection(skillsSection)}
                </PageBreakable>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Elegant layout - Centered serif with generous spacing
  const renderElegantLayout = () => (
    <div  className="w-full min-h-full px-12 py-10 font-serif" style={{ backgroundColor: getTemplateBackground('elegant') }}>
      {renderElegantHeader()}
      <div className="max-w-2xl mx-auto space-y-8">
        {visibleSections.map((section) => (
          <div key={section.id} className="section-block text-center">
            {renderSection(section, section.title)}
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
      <div  className="w-full min-h-full font-sans flex">
        {/* Thin accent sidebar */}
        <div className="w-1" style={{ backgroundColor: theme.color }} />

        <div className="flex-1 p-8">
          {renderModernHeader()}

          <div className="main-grid">
            <div className="left-column section">
              {mainSections.map((section) => (
                <div key={section.id} className="section-block border-l-2 border-gray-100 pl-4">
                  {renderSection(section, section.title)}
                </div>
              ))}
            </div>

            <div className="right-column">
              {skillsSection && (
                <PageBreakable id={`skills-${skillsSection.id}`} className="skills-card" style={{ backgroundColor: '#f9fafb' }}>
                  {renderSectionTitle(skillsSection.title)}
                  {renderSkillsSection(skillsSection)}
                </PageBreakable>
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
    <div  className={cn('w-full min-h-full p-8', isHarvard || isElegant ? 'font-serif' : 'font-sans')}>
      {renderHeader()}
      {visibleSections.map((section) => (
        <div key={section.id} className="section-block">
          {renderSection(section, section.title)}
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

  const paperSize = theme.pageSize || 'A4';
  const dimensions = PAPER_SIZES[paperSize as PaperSize];

  return (
    <SpacerContext.Provider value={spacerMap || {}}>
      <div
        ref={setResumeExportNode}
        id="resume-pdf-export-container"
        className={`resume-container ${className || ''}`}
        style={{
          backgroundColor: getTemplateBackground(theme.template),
          boxSizing: 'border-box',
          position: 'relative',
          width: dimensions.width,
          minHeight: minHeight || dimensions.height,
        }}
      >
        <div style={{ padding: '40px', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {renderLayout()}
        </div>
      </div>
    </SpacerContext.Provider>
  );
};

export default PreviewCanvas;
