import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { globalStyles, spacing } from '@/lib/pdfStyles';
import { PDFMarkdown } from './PDFMarkdown';

// Note: In your actual app, this might be imported from '@/lib/schema'
interface ExperienceItem {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) return null;

  return (
    // Applies mt-4, mb-4, pb-4, and a bottom border from our shared layout
    <View style={globalStyles.sectionWrapper}>
      
      <Text style={globalStyles.sectionTitle}>Experience</Text>

      <View style={globalStyles.flexCol}>
        {experiences.map((exp, index) => {
          // Determine if we need bottom margin (Tailwind: `mb-4` or `mb-0`)
          const isLast = index === experiences.length - 1;
          
          return (
            <View 
              key={index} 
              // Array syntax allows composing shared styles with inline overrides!
              style={[
                globalStyles.flexCol, 
                { marginBottom: isLast ? 0 : spacing[4] }
              ]}
            >
              {/* Header: Role (Left) & Date (Right) -> Tailwind: flex justify-between */}
              <View style={globalStyles.flexRowBetween}>
                <Text style={globalStyles.itemTitle}>{exp.position || exp.company}</Text>
                <Text style={globalStyles.itemDate}>
                  {exp.startDate} - {exp.endDate}
                </Text>
              </View>
              
              {/* Subtitle: Company -> Tailwind: mb-2 */}
              <Text style={[globalStyles.itemSubtitle, { marginBottom: spacing[2] }]}>
                {exp.company}
              </Text>

              {/* Body: Description parsed safely by our custom markdown component */}
              <View style={globalStyles.bodyText}>
                <PDFMarkdown text={exp.description} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
