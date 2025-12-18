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
  PDF_FONT_SIZES,
  GLOBAL_FONT_SCALES,
  TextSize,
  DEFAULT_SECTION_FONT_SIZE,
} from '@/lib/schema';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

// Using built-in PDF fonts (no external loading required)
// Helvetica = Sans-serif (Modern), Times-Roman = Serif (Classic)
const FONTS = {
  sansSerif: 'Helvetica',
  sansSerifBold: 'Helvetica-Bold',
  serif: 'Times-Roman',
  serifBold: 'Times-Bold',
};

// ============================================================================
// STYLE GENERATORS
// ============================================================================

const getScaledFontSize = (
  baseSize: TextSize,
  globalScale: 'small' | 'medium' | 'large'
): number => {
  const base = PDF_FONT_SIZES[baseSize];
  const scale = GLOBAL_FONT_SCALES[globalScale];
  return Math.round(base * scale);
};

const createStyles = (data: ResumeData) => {
  const { theme } = data;
  const isHarvard = theme.template === 'harvard';
  const isMinimal = theme.template === 'minimal';
  const fontFamily = isHarvard ? FONTS.serif : FONTS.sansSerif;
  const fontFamilyBold = isHarvard ? FONTS.serifBold : FONTS.sansSerifBold;

  return StyleSheet.create({
    page: {
      fontFamily,
      padding: 40,
      fontSize: getScaledFontSize('sm', theme.fontSize),
      color: '#1f2937',
      backgroundColor: '#ffffff',
    },
    // Header styles
    header: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: theme.color,
      textAlign: isMinimal ? 'center' : 'left',
    },
    name: {
      fontSize: getScaledFontSize('xl', theme.fontSize) + 8,
      fontFamily: fontFamilyBold,
      color: theme.color,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
      justifyContent: isMinimal ? 'center' : 'flex-start',
    },
    contactItem: {
      fontSize: getScaledFontSize('sm', theme.fontSize),
      color: '#4b5563',
    },
    linksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 8,
      justifyContent: isMinimal ? 'center' : 'flex-start',
    },
    link: {
      fontSize: getScaledFontSize('xs', theme.fontSize),
      color: theme.color,
    },
    // Section styles
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: getScaledFontSize('lg', theme.fontSize),
      fontFamily: fontFamilyBold,
      color: theme.color,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottomWidth: isHarvard ? 1 : 0,
      borderBottomColor: '#d1d5db',
      paddingBottom: isHarvard ? 3 : 0,
    },
    // Item styles
    item: {
      marginBottom: 12,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: getScaledFontSize('base', theme.fontSize),
      fontFamily: fontFamilyBold,
      color: '#1f2937',
    },
    itemSubtitle: {
      fontSize: getScaledFontSize('sm', theme.fontSize),
      color: '#6b7280',
      fontStyle: 'italic',
    },
    itemDate: {
      fontSize: getScaledFontSize('xs', theme.fontSize),
      color: '#9ca3af',
    },
    itemDescription: {
      fontSize: getScaledFontSize('sm', theme.fontSize),
      color: '#4b5563',
      lineHeight: 1.5,
      marginTop: 4,
    },
    // Skills styles
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    skillTag: {
      fontSize: getScaledFontSize('xs', theme.fontSize),
      backgroundColor: `${theme.color}20`,
      color: theme.color,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    // Placeholder text style
    placeholder: {
      color: '#9ca3af',
      fontStyle: 'italic',
    },
  });
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
  const styles = createStyles(data);
  const { personalInfo, sections, theme } = data;
  const pageSize = PAGE_SIZES[theme.pageSize];

  const getSectionFontSize = (
    section: typeof sections[0],
    type: 'heading' | 'subheading' | 'body'
  ) => {
    const fontSize = section.fontSize || DEFAULT_SECTION_FONT_SIZE;
    return getScaledFontSize(fontSize[type], theme.fontSize);
  };

  return (
    <Document>
      <Page size={[pageSize.width, pageSize.height]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.fullName || 'Full Name'}
          </Text>
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {!personalInfo.email && (
              <Text style={[styles.contactItem, styles.placeholder]}>email@example.com</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {!personalInfo.phone && (
              <Text style={[styles.contactItem, styles.placeholder]}>Phone Number</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {!personalInfo.location && (
              <Text style={[styles.contactItem, styles.placeholder]}>City, Country</Text>
            )}
          </View>
          {personalInfo.links.length > 0 && (
            <View style={styles.linksRow}>
              {personalInfo.links.map((link) => (
                <Link key={link.id} src={link.url || '#'} style={styles.link}>
                  {link.label || link.url || 'Link'}
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
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: getSectionFontSize(section, 'heading') },
                ]}
              >
                {section.title}
              </Text>

              {section.type === 'skills' ? (
                <View style={styles.skillsContainer}>
                  {section.items[0]?.skills?.length ? (
                    section.items[0].skills.map((skill, idx) => (
                      <Text key={idx} style={styles.skillTag}>
                        {skill}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.skillTag, styles.placeholder]}>
                      Add your skills
                    </Text>
                  )}
                </View>
              ) : section.items.length > 0 ? (
                section.items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.itemTitle,
                            { fontSize: getSectionFontSize(section, 'subheading') },
                          ]}
                        >
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
                          { fontSize: getSectionFontSize(section, 'body') },
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
