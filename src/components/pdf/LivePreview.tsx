'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import {
  ResumeData,
  PAGE_SIZES,
  PDF_FONT_SIZES,
  GLOBAL_FONT_SCALES,
  TextSize,
  DEFAULT_SECTION_FONT_SIZE,
  LinkIconType,
  DEFAULT_TYPOGRAPHY,
  SkillLevel,
} from '@/lib/schema';
import { cn } from '@/lib/utils';

// Icon component mapping for preview
const PreviewIcons: Record<LinkIconType, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
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

// Typography size to pixel mapping
const TYPO_PX = {
  sm: { name: 18, headers: 11, body: 9 },
  md: { name: 22, headers: 13, body: 10 },
  lg: { name: 26, headers: 15, body: 11 },
  xl: { name: 30, headers: 17, body: 12 },
};

// ============================================================================
// LIVE PREVIEW COMPONENT
// ============================================================================

export const LivePreview: React.FC<LivePreviewProps> = ({ data, className }) => {
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

  const isHarvard = theme.template === 'harvard';
  const isTech = theme.template === 'tech';
  const isMinimal = theme.template === 'minimal';

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
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

  // Get consistent font size for section items
  const getItemFontSize = (type: 'title' | 'subtitle' | 'body' | 'date') => {
    const scale = GLOBAL_FONT_SCALES[theme.fontSize];
    const sizes = {
      title: Math.round(13 * scale),
      subtitle: Math.round(11 * scale),
      body: Math.round(10 * scale),
      date: Math.round(9 * scale),
    };
    return sizes[type];
  };

  // Get section heading size
  const getSectionHeadingSize = () => {
    const scale = GLOBAL_FONT_SCALES[theme.fontSize];
    return Math.round(14 * scale);
  };

  return (
    <div className={cn('w-full h-full flex flex-col bg-muted/30', className)}>
      {/* Zoom Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-muted rounded-md transition-colors ml-1"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
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
          className="mx-auto bg-white shadow-2xl overflow-hidden origin-center transition-transform duration-75"
          style={{
            width: '100%',
            maxWidth: '595px',
            aspectRatio: aspectRatio,
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          <div
            className={cn(
              'w-full h-full p-8 overflow-auto',
              isHarvard ? 'font-serif' : 'font-sans'
            )}
          >
            {/* Header - Harvard Style */}
            {isHarvard && (
              <div className="text-center border-b-2 border-gray-900 pb-4 mb-5">
                <h1 
                  className="font-bold uppercase tracking-widest mb-2"
                  style={{ fontSize: TYPO_PX[typography.name].name }}
                >
                  {personalInfo.fullName || <span className="text-gray-400 italic normal-case">Full Name</span>}
                </h1>
                {personalInfo.summary && (
                  <p className="text-gray-600 mb-2" style={{ fontSize: TYPO_PX[typography.headers].headers }}>
                    {personalInfo.summary}
                  </p>
                )}
                <div 
                  className="flex flex-wrap justify-center gap-3 text-gray-700"
                  style={{ fontSize: TYPO_PX[typography.body].body }}
                >
                  {personalInfo.email && <span>{personalInfo.email}</span>}
                  {personalInfo.phone && <span>{personalInfo.phone}</span>}
                  {personalInfo.location && <span>{personalInfo.location}</span>}
                  {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                  {personalInfo.github && <span>{personalInfo.github}</span>}
                  {personalInfo.website && <span>{personalInfo.website}</span>}
                  {personalInfo.links.map((l) => (
                    <span key={l.id}>{l.label || l.url}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Header - Tech Style */}
            {isTech && (
              <div className="mb-6">
                <h1 
                  className="font-extrabold tracking-tight mb-1"
                  style={{ fontSize: TYPO_PX[typography.name].name, color: theme.color }}
                >
                  {personalInfo.fullName || <span className="text-gray-400 italic font-normal">Full Name</span>}
                </h1>
                {personalInfo.summary && (
                  <p className="text-gray-500 mb-3" style={{ fontSize: TYPO_PX[typography.headers].headers }}>
                    {personalInfo.summary}
                  </p>
                )}
                <div 
                  className="flex flex-wrap gap-3 text-gray-600"
                  style={{ fontSize: TYPO_PX[typography.body].body }}
                >
                  {personalInfo.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.email}
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.phone}
                    </div>
                  )}
                  {personalInfo.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.location}
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-center gap-1">
                      <Linkedin className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.linkedin}
                    </div>
                  )}
                  {personalInfo.github && (
                    <div className="flex items-center gap-1">
                      <Github className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.github}
                    </div>
                  )}
                  {personalInfo.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" style={{ color: theme.color }} />
                      {personalInfo.website}
                    </div>
                  )}
                  {personalInfo.links.map((link) => {
                    const IconComponent = PreviewIcons[link.icon as LinkIconType] || Link2;
                    return (
                      <div key={link.id} className="flex items-center gap-1">
                        <IconComponent className="w-3 h-3" style={{ color: theme.color }} />
                        {link.label || link.url}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Header - Minimal Style */}
            {isMinimal && (
              <div className="mb-8 text-center">
                <h1 
                  className="font-light tracking-wide mb-2"
                  style={{ fontSize: TYPO_PX[typography.name].name }}
                >
                  {personalInfo.fullName || <span className="text-gray-400 italic">Full Name</span>}
                </h1>
                {personalInfo.summary && (
                  <p className="text-gray-400 mb-3" style={{ fontSize: TYPO_PX[typography.headers].headers }}>
                    {personalInfo.summary}
                  </p>
                )}
                <div 
                  className="flex flex-wrap justify-center gap-3 text-gray-400"
                  style={{ fontSize: TYPO_PX[typography.body].body }}
                >
                  {personalInfo.email && <span>{personalInfo.email}</span>}
                  {personalInfo.phone && <span>{personalInfo.phone}</span>}
                  {personalInfo.location && <span>{personalInfo.location}</span>}
                  {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                  {personalInfo.github && <span>{personalInfo.github}</span>}
                  {personalInfo.website && <span>{personalInfo.website}</span>}
                  {personalInfo.links.map((l) => (
                    <span key={l.id}>{l.label || l.url}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            {sections
              .filter((section) => section.isVisible)
              .map((section) => (
                <div key={section.id} className="mb-4">
                  <h2
                    className={cn(
                      'font-bold mb-2 uppercase tracking-wider',
                      isHarvard && 'border-b border-gray-900 pb-1'
                    )}
                    style={{
                      color: isTech ? theme.color : 'inherit',
                      fontSize: getSectionHeadingSize(),
                    }}
                  >
                    {section.title}
                  </h2>

                  {section.type === 'skills' ? (
                    <div className="space-y-2">
                      {/* Skills with Levels */}
                      {section.items[0]?.skillsWithLevels?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {section.items[0].skillsWithLevels.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-gray-200"
                            >
                              <span className="font-semibold" style={{ color: isTech ? theme.color : 'inherit' }}>
                                {skill.name}
                              </span>
                              <span className="ml-1 text-gray-400 text-[8px] uppercase">
                                {skill.level}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {/* Simple Skills */}
                      {section.items[0]?.skills?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {section.items[0].skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[10px]"
                              style={{
                                backgroundColor: theme.color + '20',
                                color: theme.color,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {/* Empty state */}
                      {!section.items[0]?.skills?.length && !section.items[0]?.skillsWithLevels?.length && (
                        <span className="px-2 py-0.5 rounded-full text-gray-400 italic text-[10px] bg-gray-100">
                          Add your skills
                        </span>
                      )}
                    </div>
                  ) : section.type === 'certifications' || section.type === 'projects' ? (
                    // Certifications and Projects - with optional links
                    section.items.length > 0 ? (
                      section.items.map((item) => (
                        <div key={item.id} className="mb-2.5">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900" style={{ fontSize: getItemFontSize('title') }}>
                                {item.title || <span className="text-gray-400 italic font-normal">Title</span>}
                              </h3>
                              {item.subtitle && item.subtitle.startsWith('http') && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            {item.startDate && (
                              <span className="text-gray-500 italic" style={{ fontSize: getItemFontSize('date') }}>
                                {formatDate(item.startDate, item.endDate, item.current)}
                              </span>
                            )}
                          </div>
                          {item.subtitle && !item.subtitle.startsWith('http') && (
                            <p className="text-gray-600" style={{ fontSize: getItemFontSize('subtitle') }}>
                              {item.subtitle}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: getItemFontSize('body') }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic" style={{ fontSize: getItemFontSize('body') }}>
                        Add items to this section
                      </p>
                    )
                  ) : section.type === 'custom' && section.fieldDefinitions?.length ? (
                    // Custom sections with custom field definitions
                    section.items.length > 0 ? (
                      section.items.map((item) => {
                        const getFieldValue = (fieldId: string) => {
                          const field = (item.customFields || []).find((cf) => cf.fieldId === fieldId);
                          return field?.value;
                        };
                        const fieldDefs = section.fieldDefinitions || [];
                        const titleField = fieldDefs.find((f) => f.type === 'text');
                        const dateField = fieldDefs.find((f) => f.type === 'date' || f.type === 'dateRange');
                        const linkField = fieldDefs.find((f) => f.type === 'link');
                        const tagsField = fieldDefs.find((f) => f.type === 'tags');
                        const textareaField = fieldDefs.find((f) => f.type === 'textarea');
                        
                        const title = titleField ? getFieldValue(titleField.id) : '';
                        const linkValue = linkField ? (getFieldValue(linkField.id) as string) : '';
                        const tagsValue = tagsField ? (getFieldValue(tagsField.id) as string[]) : [];
                        const description = textareaField ? (getFieldValue(textareaField.id) as string) : '';
                        
                        // Handle date range or single date
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
                                <h3 className="font-bold text-gray-900" style={{ fontSize: getItemFontSize('title') }}>
                                  {title || <span className="text-gray-400 italic font-normal">Title</span>}
                                </h3>
                                {linkValue && linkValue.startsWith('http') && (
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              {dateDisplay && (
                                <span className="text-gray-500 italic" style={{ fontSize: getItemFontSize('date') }}>
                                  {dateDisplay}
                                </span>
                              )}
                            </div>
                            {/* Other text fields */}
                            {fieldDefs
                              .filter((f) => f.type === 'text' && f !== titleField)
                              .map((f) => {
                                const val = getFieldValue(f.id) as string;
                                return val ? (
                                  <p key={f.id} className="text-gray-600" style={{ fontSize: getItemFontSize('subtitle') }}>
                                    {val}
                                  </p>
                                ) : null;
                              })}
                            {/* Tags/Bubbles */}
                            {tagsValue && tagsValue.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tagsValue.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[9px]"
                                    style={{
                                      backgroundColor: theme.color + '20',
                                      color: theme.color,
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Description */}
                            {description && (
                              <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: getItemFontSize('body') }}>
                                {description}
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 italic" style={{ fontSize: getItemFontSize('body') }}>
                        Add items to this section
                      </p>
                    )
                  ) : section.items.length > 0 ? (
                    // Experience, Education, Custom sections
                    section.items.map((item) => (
                      <div key={item.id} className="mb-2.5">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-gray-900" style={{ fontSize: getItemFontSize('title') }}>
                            {section.type === 'experience'
                              ? item.position || <span className="text-gray-400 italic font-normal">Position</span>
                              : section.type === 'education'
                              ? item.degree || <span className="text-gray-400 italic font-normal">Degree</span>
                              : item.title || <span className="text-gray-400 italic font-normal">Title</span>}
                          </h3>
                          <span className="text-gray-500 italic ml-4 whitespace-nowrap" style={{ fontSize: getItemFontSize('date') }}>
                            {formatDate(item.startDate, item.endDate, item.current) || 'Date'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center" style={{ fontSize: getItemFontSize('subtitle') }}>
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
                          <p className="text-gray-700 whitespace-pre-line mt-1" style={{ fontSize: getItemFontSize('body') }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic" style={{ fontSize: getItemFontSize('body') }}>
                      Add items to this section
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
