'use client';

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
  pdf,
  Svg,
  Path,
} from '@react-pdf/renderer';
import {
  ResumeData,
  PAGE_SIZES,
  GLOBAL_FONT_SCALES,
  DEFAULT_TYPOGRAPHY,
} from '@/lib/schema';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const FONTS = {
  sansSerif: 'Helvetica',
  sansSerifBold: 'Helvetica-Bold',
  serif: 'Times-Roman',
  serifBold: 'Times-Bold',
};

// Typography size scale for PDF
const TYPO_SIZE_MAP = {
  sm: { name: 20, headers: 10, body: 9 },
  md: { name: 24, headers: 12, body: 10 },
  lg: { name: 28, headers: 14, body: 11 },
  xl: { name: 32, headers: 16, body: 12 },
};

// ============================================================================
// SVG ICONS - Lucide icon paths for PDF export
// ============================================================================

interface IconProps {
  size?: number;
  color?: string;
}

const EmailIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const PhoneIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const LocationIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path
      d="M12 10a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const LinkedInIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path d="M2 9h4v12H2z" stroke={color} strokeWidth={2} fill="none" />
    <Path
      d="M4 6a2 2 0 100-4 2 2 0 000 4z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const GitHubIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const GlobeIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path d="M2 12h20" stroke={color} strokeWidth={2} fill="none" />
    <Path
      d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const LinkIcon: React.FC<IconProps> = ({ size = 10, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path
      d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Format URL for display (remove http/https prefix)
const formatUrlDisplay = (url: string): string => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// Ensure URL has protocol
const ensureProtocol = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// ============================================================================
// DATE FORMATTER
// ============================================================================

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
// PDF DOCUMENT COMPONENT
// ============================================================================

interface ResumePDFProps {
  data: ResumeData;
}

export const ResumePDFDocument: React.FC<ResumePDFProps> = ({ data }) => {
  const { personalInfo, sections, theme } = data;
  const pageSize = PAGE_SIZES[theme.pageSize];
  const isHarvard = theme.template === 'harvard';
  const isMinimal = theme.template === 'minimal';
  const fontFamily = isHarvard ? FONTS.serif : FONTS.sansSerif;
  const fontFamilyBold = isHarvard ? FONTS.serifBold : FONTS.sansSerifBold;
  const typography = theme.typography || DEFAULT_TYPOGRAPHY;
  const scale = GLOBAL_FONT_SCALES[theme.fontSize];

  // Consistent font sizes - properly scaled
  const fontSize = {
    name: Math.round(TYPO_SIZE_MAP[typography.name].name * scale),
    summary: Math.round(TYPO_SIZE_MAP[typography.headers].headers * scale),
    contact: Math.round(TYPO_SIZE_MAP[typography.body].body * scale),
    sectionHeading: Math.round(14 * scale),
    itemTitle: Math.round(12 * scale),
    itemSubtitle: Math.round(10 * scale),
    itemBody: Math.round(9 * scale),
    itemDate: Math.round(8 * scale),
  };

  const iconSize = Math.round(fontSize.contact * 1.2);
  const iconColor = '#6b7280';

  const styles = StyleSheet.create({
    page: {
      fontFamily,
      padding: 40,
      fontSize: fontSize.itemBody,
      color: '#1f2937',
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: theme.color,
      textAlign: isMinimal ? 'center' : 'left',
    },
    name: {
      fontSize: fontSize.name,
      fontFamily: fontFamilyBold,
      color: theme.color,
      marginBottom: 4,
    },
    summary: {
      fontSize: fontSize.summary,
      color: '#6b7280',
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      justifyContent: isMinimal ? 'center' : 'flex-start',
    },
    contactItemWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    contactItem: {
      fontSize: fontSize.contact,
      color: '#4b5563',
    },
    contactLink: {
      fontSize: fontSize.contact,
      color: theme.color,
      textDecoration: 'none',
    },
    linksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 6,
      justifyContent: isMinimal ? 'center' : 'flex-start',
    },
    link: {
      fontSize: fontSize.itemDate,
      color: theme.color,
      textDecoration: 'none',
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: fontSize.sectionHeading,
      fontFamily: fontFamilyBold,
      color: theme.color,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottomWidth: isHarvard ? 1 : 0,
      borderBottomColor: '#d1d5db',
      paddingBottom: isHarvard ? 2 : 0,
    },
    item: {
      marginBottom: 10,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    itemTitle: {
      fontSize: fontSize.itemTitle,
      fontFamily: fontFamilyBold,
      color: '#1f2937',
    },
    itemSubtitle: {
      fontSize: fontSize.itemSubtitle,
      color: '#6b7280',
    },
    itemLocation: {
      fontSize: fontSize.itemDate,
      color: '#9ca3af',
      marginTop: 1,
    },
    itemDate: {
      fontSize: fontSize.itemDate,
      color: '#9ca3af',
    },
    itemDescription: {
      fontSize: fontSize.itemBody,
      color: '#4b5563',
      lineHeight: 1.4,
      marginTop: 3,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    skillTag: {
      fontSize: fontSize.itemDate,
      backgroundColor: `${theme.color}20`,
      color: theme.color,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 10,
    },
    skillWithLevel: {
      fontSize: fontSize.itemDate,
      backgroundColor: '#f3f4f6',
      color: '#374151',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      flexDirection: 'row',
    },
    skillLevelText: {
      fontSize: 6,
      color: '#9ca3af',
      marginLeft: 3,
      textTransform: 'uppercase',
    },
    placeholder: {
      color: '#9ca3af',
      fontStyle: 'italic',
    },
  });

  return (
    <Document>
      <Page size={[pageSize.width, pageSize.height]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.fullName || 'Full Name'}
          </Text>
          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}

          {/* Contact Info - with SVG icons and clickable links */}
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <View style={styles.contactItemWrapper}>
                <EmailIcon size={iconSize} color={iconColor} />
                <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                  {personalInfo.email}
                </Link>
              </View>
            )}
            {personalInfo.phone && (
              <View style={styles.contactItemWrapper}>
                <PhoneIcon size={iconSize} color={iconColor} />
                <Link src={`tel:${personalInfo.phone.replace(/\s/g, '')}`} style={styles.contactLink}>
                  {personalInfo.phone}
                </Link>
              </View>
            )}
            {personalInfo.location && (
              <View style={styles.contactItemWrapper}>
                <LocationIcon size={iconSize} color={iconColor} />
                <Text style={styles.contactItem}>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.linkedin && (
              <View style={styles.contactItemWrapper}>
                <LinkedInIcon size={iconSize} color={iconColor} />
                <Link src={ensureProtocol(personalInfo.linkedin)} style={styles.contactLink}>
                  {formatUrlDisplay(personalInfo.linkedin)}
                </Link>
              </View>
            )}
            {personalInfo.github && (
              <View style={styles.contactItemWrapper}>
                <GitHubIcon size={iconSize} color={iconColor} />
                <Link src={ensureProtocol(personalInfo.github)} style={styles.contactLink}>
                  {formatUrlDisplay(personalInfo.github)}
                </Link>
              </View>
            )}
            {personalInfo.website && (
              <View style={styles.contactItemWrapper}>
                <GlobeIcon size={iconSize} color={iconColor} />
                <Link src={ensureProtocol(personalInfo.website)} style={styles.contactLink}>
                  {formatUrlDisplay(personalInfo.website)}
                </Link>
              </View>
            )}
          </View>

          {/* Additional Links */}
          {personalInfo.links.length > 0 && (
            <View style={styles.linksRow}>
              {personalInfo.links.map((link) => (
                <View key={link.id} style={styles.contactItemWrapper}>
                  <LinkIcon size={iconSize} color={iconColor} />
                  <Link src={ensureProtocol(link.url) || '#'} style={styles.link}>
                    {link.label || formatUrlDisplay(link.url) || 'Link'}
                  </Link>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sections */}
        {sections
          .filter((section) => section.isVisible)
          .map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>

              {section.type === 'skills' ? (
                <View style={styles.skillsContainer}>
                  {/* Skills with levels */}
                  {section.items[0]?.skillsWithLevels?.map((skill, idx) => (
                    <View key={`swl-${idx}`} style={styles.skillWithLevel}>
                      <Text>{skill.name}</Text>
                      <Text style={styles.skillLevelText}>{skill.level}</Text>
                    </View>
                  ))}
                  {/* Simple skills */}
                  {section.items[0]?.skills?.map((skill, idx) => (
                    <Text key={`s-${idx}`} style={styles.skillTag}>
                      {skill}
                    </Text>
                  ))}
                  {/* Empty state */}
                  {!section.items[0]?.skills?.length && !section.items[0]?.skillsWithLevels?.length && (
                    <Text style={[styles.skillTag, styles.placeholder]}>
                      Add your skills
                    </Text>
                  )}
                </View>
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
                      <View key={item.id} style={styles.item}>
                        <View style={styles.itemHeader}>
                          <View style={{ flex: 1 }}>
                            {linkValue ? (
                              <Link src={ensureProtocol(linkValue)} style={[styles.itemTitle, { color: theme.color }]}>
                                {title || 'Title'}
                              </Link>
                            ) : (
                              <Text style={styles.itemTitle}>
                                {title || 'Title'}
                              </Text>
                            )}
                            {/* Other text fields */}
                            {fieldDefs
                              .filter((f) => f.type === 'text' && f !== titleField)
                              .map((f) => {
                                const val = getFieldValue(f.id) as string;
                                return val ? (
                                  <Text key={f.id} style={styles.itemSubtitle}>
                                    {val}
                                  </Text>
                                ) : null;
                              })}
                          </View>
                          {dateDisplay && (
                            <Text style={styles.itemDate}>
                              {dateDisplay}
                            </Text>
                          )}
                        </View>
                        {/* Tags/Bubbles */}
                        {tagsValue && tagsValue.length > 0 && (
                          <View style={[styles.skillsContainer, { marginTop: 4 }]}>
                            {tagsValue.map((tag, idx) => (
                              <Text key={idx} style={styles.skillTag}>
                                {tag}
                              </Text>
                            ))}
                          </View>
                        )}
                        {/* Description */}
                        {description && (
                          <Text style={styles.itemDescription}>
                            {description}
                          </Text>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text style={[styles.itemDescription, styles.placeholder]}>
                    Add items to this section
                  </Text>
                )
              ) : section.items.length > 0 ? (
                section.items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>
                          {section.type === 'experience'
                            ? item.position || 'Position Title'
                            : section.type === 'education'
                            ? item.degree || 'Degree / Field of Study'
                            : item.title || 'Title'}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {section.type === 'experience'
                            ? item.company || 'Company Name'
                            : section.type === 'education'
                            ? item.institution || 'Institution Name'
                            : item.subtitle || ''}
                        </Text>
                        {item.location && (
                          <Text style={styles.itemLocation}>{item.location}</Text>
                        )}
                      </View>
                      {(item.startDate || section.type === 'experience' || section.type === 'education') && (
                        <Text style={styles.itemDate}>
                          {formatDate(item.startDate, item.endDate, item.current) || 'Date Range'}
                        </Text>
                      )}
                    </View>
                    {(item.description || section.type === 'experience') && (
                      <Text
                        style={[
                          styles.itemDescription,
                          ...(item.description ? [] : [styles.placeholder]),
                        ]}
                      >
                        {item.description || 'Description of your role and achievements...'}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.itemDescription, styles.placeholder]}>
                  Add items to this section
                </Text>
              )}
            </View>
          ))}
      </Page>
    </Document>
  );
};

// ============================================================================
// PDF EXPORT FUNCTION
// ============================================================================

export async function exportToPDF(data: ResumeData): Promise<Blob> {
  const blob = await pdf(<ResumePDFDocument data={data} />).toBlob();
  return blob;
}

export function downloadPDF(blob: Blob, filename: string = 'resume.pdf') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
