import { StyleSheet } from '@react-pdf/renderer';

export const colors = {
  slate: {
    50: '#f8fafc',
    200: '#e2e8f0',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  blue: {
    50: '#eff6ff',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  gray: {
    300: '#d1d5db',
    600: '#4b5563',
    800: '#1f2937',
  },
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const typography = {
  xs: 10,
  sm: 11,
  base: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
};

export const globalStyles = StyleSheet.create({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRowBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionWrapper: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
    borderBottomStyle: 'solid',
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: 'bold',
    color: colors.slate[900],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemTitle: {
    fontSize: typography.base,
    fontWeight: 'bold',
    color: colors.slate[900],
  },
  itemSubtitle: {
    fontSize: typography.sm,
    color: colors.blue[600],
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: typography.sm,
    color: colors.slate[500],
  },
  bodyText: {
    fontSize: typography.sm,
    color: colors.slate[700],
    lineHeight: 1.5,
  }
});
