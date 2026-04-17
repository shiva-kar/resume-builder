import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Builder - Professional Portfolio Creator',
  description: 'Create stunning, professional resumes with our SaaS-level resume builder. Real-time preview, multiple templates, and instant PDF export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
