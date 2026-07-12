export type PaperSize = 'A4' | 'LETTER' | 'LEGAL' | 'EXECUTIVE' | 'B5' | 'A5';

export interface PaperDimensions {
  width: number;
  height: number;
  label: string;
}

// Dimensions are calculated at 96 DPI
export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  'A4': { width: 794, height: 1123, label: 'A4 (210 x 297 mm)' },
  'LETTER': { width: 816, height: 1056, label: 'US Letter (8.5 x 11 in)' },
  'LEGAL': { width: 816, height: 1344, label: 'US Legal (8.5 x 14 in)' },
  'EXECUTIVE': { width: 696, height: 1008, label: 'Executive (7.25 x 10.5 in)' },
  'B5': { width: 665, height: 945, label: 'B5 (176 x 250 mm)' },
  'A5': { width: 559, height: 794, label: 'A5 (148 x 210 mm)' },
};
