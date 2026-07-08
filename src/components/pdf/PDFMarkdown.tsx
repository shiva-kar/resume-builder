import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

interface PDFMarkdownProps {
  text?: string;
  style?: any;
}

const styles = StyleSheet.create({
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
  },
  listItemContent: {
    flex: 1,
  },
  boldText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 4,
  },
});

export const PDFMarkdown: React.FC<PDFMarkdownProps> = ({ text, style }) => {
  if (!text || text.trim() === '') {
    return null;
  }

  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') return null;

        const isListItem = /^[*-]\s/.test(line);
        const rawContent = isListItem ? line.replace(/^[*-]\s/, '') : line;
        
        const parts = rawContent.split(/(\*\*.*?\*\*)/g);

        const parsedInlineContent = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldSegment = part.slice(2, -2);
            return (
              <Text key={partIndex} style={[styles.boldText, style, { fontWeight: 'bold', fontFamily: 'Inter' }]}>
                {boldSegment}
              </Text>
            );
          }
          return part;
        });

        if (isListItem) {
          return (
            <View key={lineIndex} style={styles.listItemContainer}>
              <Text style={[styles.bulletPoint, style]}>•</Text>
              <Text style={[styles.listItemContent, style]}>
                {parsedInlineContent}
              </Text>
            </View>
          );
        }

        return (
          <Text key={lineIndex} style={[styles.paragraph, style]}>
            {parsedInlineContent}
          </Text>
        );
      })}
    </>
  );
};
