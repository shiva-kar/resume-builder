'use client';

import React from 'react';
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
} from 'lucide-react';
import {
  ResumeData,
  PAGE_SIZES,
  PDF_FONT_SIZES,
  GLOBAL_FONT_SCALES,
  TextSize,
  DEFAULT_SECTION_FONT_SIZE,
  LinkIconType,
} from '@/lib/schema';
import { cn } from '@/lib/utils';

// Icon component mapping for preview
const PreviewIcons: Record<LinkIconType, React.FC<{ className?: string }>> = {
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

interface LivePreviewProps {
  data: ResumeData;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getScaledFontSize = (
  baseSize: TextSize,
  globalScale: 'small' | 'medium' | 'large'
): number => {
  const base = PDF_FONT_SIZES[baseSize];
  const scale = GLOBAL_FONT_SCALES[globalScale];
  return Math.round(base * scale);
};

const formatDate = (
  start?: string,
  end?: string,
  current?: boolean
): string => {
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

// ============================================================================
// LIVE PREVIEW COMPONENT
// ============================================================================

export const LivePreview: React.FC<LivePreviewProps> = ({ data, className }) => {
  const { personalInfo, sections, theme } = data;
  const pageSize = PAGE_SIZES[theme.pageSize];
  const aspectRatio = pageSize.width / pageSize.height;

  const isHarvard = theme.template === 'harvard';
  const isMinimal = theme.template === 'minimal';

  const getSectionFontSize = (
    section: typeof sections[0],
    type: 'heading' | 'subheading' | 'body'
  ) => {
    const fontSize = section.fontSize || DEFAULT_SECTION_FONT_SIZE;
    return getScaledFontSize(fontSize[type], theme.fontSize);
  };

  return (
    <div className={cn('w-full h-full overflow-auto bg-muted/30 p-4', className)}>
      <div
        className="mx-auto bg-white shadow-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '595px',
          aspectRatio: aspectRatio,
        }}
      >
        <div
          className={cn(
            'w-full h-full p-10 overflow-auto',
            isHarvard ? 'font-serif' : 'font-sans'
          )}
          style={{ fontSize: getScaledFontSize('sm', theme.fontSize) }}
        >
          {/* Header */}
          <div
            className={cn(
              'mb-5 pb-4 border-b-2',
              isMinimal && 'text-center'
            )}
            style={{ borderColor: theme.color }}
          >
            <h1
              className="font-bold mb-2"
              style={{
                color: theme.color,
                fontSize: getScaledFontSize('xl', theme.fontSize) + 8,
              }}
            >
              {personalInfo.fullName || (
                <span className="text-gray-400 italic">Full Name</span>
              )}
            </h1>

            <div
              className={cn(
                'flex flex-wrap gap-4 text-gray-600',
                isMinimal && 'justify-center'
              )}
              style={{ fontSize: getScaledFontSize('sm', theme.fontSize) }}
            >
              {personalInfo.email ? (
                <span>{personalInfo.email}</span>
              ) : (
                <span className="text-gray-400 italic">email@example.com</span>
              )}
              {personalInfo.phone ? (
                <span>{personalInfo.phone}</span>
              ) : (
                <span className="text-gray-400 italic">Phone Number</span>
              )}
              {personalInfo.location ? (
                <span>{personalInfo.location}</span>
              ) : (
                <span className="text-gray-400 italic">City, Country</span>
              )}
            </div>

            {personalInfo.links.length > 0 && (
              <div
                className={cn(
                  'flex flex-wrap gap-4 mt-2',
                  isMinimal && 'justify-center'
                )}
                style={{
                  fontSize: getScaledFontSize('xs', theme.fontSize),
                  color: theme.color,
                }}
              >
                {personalInfo.links.map((link) => {
                  const IconComponent = PreviewIcons[link.icon as LinkIconType] || Link2;
                  const displayText = link.label || link.url || 'No URL';
                  return (
                    <span key={link.id} className="flex items-center gap-1">
                      <IconComponent className="w-3 h-3" />
                      {displayText}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sections */}
          {sections
            .filter((section) => section.isVisible)
            .map((section) => (
              <div key={section.id} className="mb-4">
                <h2
                  className={cn(
                    'font-bold mb-2 uppercase tracking-wide',
                    isHarvard && 'border-b border-gray-300 pb-1'
                  )}
                  style={{
                    color: theme.color,
                    fontSize: getSectionFontSize(section, 'heading'),
                  }}
                >
                  {section.title}
                </h2>

                {section.type === 'skills' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {section.items[0]?.skills?.length ? (
                      section.items[0].skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            fontSize: getScaledFontSize('xs', theme.fontSize),
                            backgroundColor: `${theme.color}20`,
                            color: theme.color,
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span
                        className="px-2 py-0.5 rounded-full text-gray-400 italic"
                        style={{
                          fontSize: getScaledFontSize('xs', theme.fontSize),
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        Add your skills
                      </span>
                    )}
                  </div>
                ) : section.items.length > 0 ? (
                  section.items.map((item) => (
                    <div key={item.id} className="mb-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-gray-900"
                            style={{
                              fontSize: getSectionFontSize(section, 'subheading'),
                            }}
                          >
                            {section.type === 'experience'
                              ? item.position || (
                                  <span className="text-gray-400 italic font-normal">
                                    Position Title
                                  </span>
                                )
                              : section.type === 'education'
                              ? item.degree || (
                                  <span className="text-gray-400 italic font-normal">
                                    Degree / Field of Study
                                  </span>
                                )
                              : item.title || (
                                  <span className="text-gray-400 italic font-normal">
                                    Title
                                  </span>
                                )}
                          </h3>
                          <p
                            className="text-gray-600 italic"
                            style={{
                              fontSize: getScaledFontSize('sm', theme.fontSize),
                            }}
                          >
                            {section.type === 'experience'
                              ? item.company || (
                                  <span className="text-gray-400">Company Name</span>
                                )
                              : section.type === 'education'
                              ? item.institution || (
                                  <span className="text-gray-400">Institution Name</span>
                                )
                              : item.subtitle || ''}
                          </p>
                        </div>
                        <span
                          className="text-gray-400 ml-4 whitespace-nowrap"
                          style={{
                            fontSize: getScaledFontSize('xs', theme.fontSize),
                          }}
                        >
                          {formatDate(item.startDate, item.endDate, item.current) || (
                            <span className="italic">Date Range</span>
                          )}
                        </span>
                      </div>
                      {(item.description || section.type === 'experience') && (
                        <p
                          className="text-gray-700 mt-1 leading-relaxed"
                          style={{
                            fontSize: getSectionFontSize(section, 'body'),
                          }}
                        >
                          {item.description || (
                            <span className="text-gray-400 italic">
                              Description of your role and achievements...
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p
                    className="text-gray-400 italic"
                    style={{
                      fontSize: getScaledFontSize('sm', theme.fontSize),
                    }}
                  >
                    Add items to this section
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
