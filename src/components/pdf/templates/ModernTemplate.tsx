import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schema';
import { PDFIcon } from '../PDFIcon';
import { PDFMarkdown } from '../PDFMarkdown';
import { spacing } from '@/lib/pdfStyles';
import {
  shouldRenderSection,
  isNonEmpty,
  getRenderableItems,
  getPrimaryText,
  getSecondaryText,
  getDateText,
  getSkillLabels
} from '../pdfUtils';

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const accentColor = data.theme.color || "#2563eb";
  const { personalInfo, sections } = data;

  const visibleSections = sections.filter(shouldRenderSection);
  // Simple heuristic for demo: put Skills on the left, everything else on the right.
  const leftSections = visibleSections.filter(s => s.type === 'skills' || s.type === 'custom' || s.title.toLowerCase().includes('language'));
  const rightSections = visibleSections.filter(s => !leftSections.includes(s));

  const contactItems = [
    { icon: 'email' as const, value: personalInfo.email },
    { icon: 'phone' as const, value: personalInfo.phone },
  ].filter(item => isNonEmpty(item.value));
  
  // Custom links and other text-based contact info
  const otherContactItems = [
    { value: personalInfo.location },
    { value: personalInfo.linkedin },
    { value: personalInfo.github },
    { value: personalInfo.website }
  ].filter(item => isNonEmpty(item.value));

  return (
    <Page size="A4" style={{ fontFamily: 'Inter', paddingLeft: '33%' }}>
      {/* 
        STRICT PAGINATED TWO-COLUMN LAYOUT
        The left column is fixed and absolute to repeat on every page.
        The right column flows normally within the remaining 67% width (due to Page padding).
        This guarantees proper pagination without columns bleeding.
      */}
      
      {/* LEFT COLUMN - 33% (FIXED SIDEBAR) */}
      <View fixed style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '33%', 
        backgroundColor: '#1f2937', // Dark slate background
        padding: spacing[6], 
        flexDirection: 'column' 
      }}>
          {/* Header Area */}
          <View style={{ marginBottom: spacing[8] }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: spacing[3] }}>
              {personalInfo.fullName}
            </Text>
            {isNonEmpty(personalInfo.summary) && (
              <Text style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.5, marginBottom: spacing[6] }}>
                {personalInfo.summary}
              </Text>
            )}

            {/* Contact Info (with SVG Icons) */}
            <View style={{ gap: spacing[3] }}>
              {contactItems.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, marginRight: spacing[2] }}>
                    <PDFIcon name={item.icon} color={accentColor} size={12} />
                  </View>
                  <Text style={{ fontSize: 10, color: '#e5e7eb', flex: 1, flexWrap: 'wrap' }}>
                    {item.value}
                  </Text>
                </View>
              ))}
              
              {/* Other links (without exact SVG mapping for brevity) */}
              {otherContactItems.map((item, idx) => (
                <View key={`other-${idx}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#e5e7eb', flex: 1, flexWrap: 'wrap' }}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Left Sections (Skills) */}
          {leftSections.map(section => (
            <View key={section.id} style={{ marginBottom: spacing[6] }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: 'bold', 
                color: accentColor, 
                marginBottom: spacing[3],
                textTransform: 'uppercase',
                letterSpacing: 1,
                borderBottomWidth: 1,
                borderBottomColor: '#374151',
                paddingBottom: spacing[1]
              }}>
                {section.title}
              </Text>
              
              {section.type === 'skills' ? (
                <View style={{ flexDirection: 'column', gap: spacing[2] }}>
                  {getSkillLabels(section).map((skill, idx) => (
                    <Text key={idx} style={{ fontSize: 10, color: '#d1d5db' }}>
                      • {skill}
                    </Text>
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: 'column', gap: spacing[3] }}>
                  {getRenderableItems(section).map(item => (
                    <View key={item.id}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff' }}>
                        {item.title}
                      </Text>
                      {isNonEmpty(item.description) && (
                        <PDFMarkdown text={item.description} style={{ fontSize: 9, color: '#9ca3af' }} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* RIGHT COLUMN - 67% (NORMAL FLOW) */}
        <View style={{ 
          width: '100%', 
          backgroundColor: '#ffffff', 
          padding: spacing[6], 
          flexDirection: 'column' 
        }}>
          {rightSections.map(section => (
            <View key={section.id} style={{ marginBottom: spacing[6] }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: 'bold', 
                color: accentColor, 
                marginBottom: spacing[4],
                textTransform: 'uppercase',
                letterSpacing: 1,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
                paddingBottom: spacing[1]
              }}>
                {section.title}
              </Text>
              
              <View style={{ flexDirection: 'column' }}>
                {getRenderableItems(section).map((item, idx, arr) => (
                  <View key={item.id} style={{ marginBottom: idx === arr.length - 1 ? 0 : spacing[4] }}>
                    
                    {/* Header Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[1] }}>
                      <View style={{ flex: 1, paddingRight: spacing[4] }}>
                        {/* Primary text (Role / Degree) */}
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>
                          {getPrimaryText(section.type, item)}
                        </Text>
                        {/* Secondary text (Company / Institution) */}
                        <Text style={{ fontSize: 11, fontWeight: 'medium', color: accentColor }}>
                          {getSecondaryText(section.type, item)}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>
                        {getDateText(item)}
                      </Text>
                    </View>
                    
                    {/* Description - Safely parsed with Markdown */}
                    {isNonEmpty(item.description) && (
                      <View style={{ marginTop: spacing[2] }}>
                         <PDFMarkdown text={item.description} style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
    </Page>
  );
};
