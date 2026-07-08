import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFIcon } from './PDFIcon';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
  },
  // 1. & 2. Main Wrapper with strict flex rules
  mainWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  leftColumn: {
    width: '30%',
    backgroundColor: '#1f2937', // dark slate
    color: '#ffffff',
    padding: 30,
    flexDirection: 'column', 
  },
  rightColumn: {
    width: '70%',
    backgroundColor: '#ffffff',
    padding: 30,
    flexDirection: 'column', 
  },
  // Icon and Text alignment
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center', // Centers icon vertically with text
    marginBottom: 12,
  },
  iconWrapper: {
    marginRight: 8,
    // Prevents icon from getting squished if text is too long
    width: 12, 
  },
  contactText: {
    fontSize: 10,
    color: '#e5e7eb',
    // flex: 1 allows the text to wrap internally instead of pushing out the box
    flex: 1, 
    flexWrap: 'wrap',
  },
  rightText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  }
});

export const TwoColumnLayout = () => {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.mainWrapper}>
        
        {/* LEFT COLUMN - 30% */}
        <View style={styles.leftColumn}>
          
          <View style={styles.contactRow}>
            <View style={styles.iconWrapper}>
              <PDFIcon name="email" color="#e5e7eb" size={12} />
            </View>
            <Text style={styles.contactText}>super.long.email.that.will.wrap@example.com</Text>
          </View>
          
          <View style={styles.contactRow}>
            <View style={styles.iconWrapper}>
              <PDFIcon name="phone" color="#e5e7eb" size={12} />
            </View>
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>

        </View>

        {/* RIGHT COLUMN - 70% */}
        <View style={styles.rightColumn}>
          <Text style={styles.rightText}>
            Because the mainWrapper has flexDirection: "row" and flexWrap: "wrap", 
            and the columns are strictly limited to 30% and 70% width, 
            the text in this column can be endlessly long. It will always push down 
            vertically within its 70% boundary and will NEVER bleed into or overlap 
            the left column.
          </Text>
        </View>

      </View>
    </Page>
  );
};
