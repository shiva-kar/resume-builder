import React from 'react';
import { Svg, Path } from '@react-pdf/renderer';

interface PDFIconProps {
  name: 'email' | 'phone';
  size?: number;
  color?: string;
}

export const PDFIcon: React.FC<PDFIconProps> = ({ name, size = 12, color = '#4b5563' }) => {
  if (name === 'email') {
    return (
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Path 
          fill={color} 
          d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" 
        />
      </Svg>
    );
  }

  if (name === 'phone') {
    return (
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        <Path 
          fill={color} 
          d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" 
        />
      </Svg>
    );
  }

  return null;
};
