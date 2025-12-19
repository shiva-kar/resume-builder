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
// HELPER FUNCTIONS
// ============================================================================

// Check if string is a URL
const isUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || 
         str.includes('.com') || str.includes('.org') || str.includes('.net') ||
         str.includes('.io') || str.includes('.dev');
};

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
// CONTACT ITEM COMPONENT
// ============================================================================

interface ContactItemProps {
  value: string;
  style: any;
  linkStyle: any;
  isEmail?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ value, style, linkStyle, isEmail }) => {
  if (isEmail) {
    return (
      <Link src={`mailto:${value}`} style={linkStyle}>
        {value}
      </Link>
    );
  }
  
  if (isUrl(value)) {
    return (
      <Link src={ensureProtocol(value)} style={linkStyle}>
        {formatUrlDisplay(value)}
      </Link>
    );
  }
  
  return <Text style={style}>{value}</Text>;
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
      gap: 12,
      justifyContent: isMinimal ? 'center' : 'flex-start',
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
      gap: 10,
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
          
          {/* Contact Info - with clickable links */}
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                {personalInfo.email}
              </Link>
            )}
            {personalInfo.phone && (
              <Link src={`tel:${personalInfo.phone.replace(/\s/g, '')}`} style={styles.contactLink}>
                {personalInfo.phone}
              </Link>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.linkedin && (
              <Link src={ensureProtocol(personalInfo.linkedin)} style={styles.contactLink}>
                {formatUrlDisplay(personalInfo.linkedin)}
              </Link>
            )}
            {personalInfo.github && (
              <Link src={ensureProtocol(personalInfo.github)} style={styles.contactLink}>
                {formatUrlDisplay(personalInfo.github)}
              </Link>
            )}
            {personalInfo.website && (
              <Link src={ensureProtocol(personalInfo.website)} style={styles.contactLink}>
                {formatUrlDisplay(personalInfo.website)}
              </Link>
            )}
          </View>
          
          {/* Additional Links */}
          {personalInfo.links.length > 0 && (
            <View style={styles.linksRow}>
              {personalInfo.links.map((link) => (
                <Link key={link.id} src={ensureProtocol(link.url) || '#'} style={styles.link}>
                  {link.label || formatUrlDisplay(link.url) || 'Link'}
                </Link>
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
