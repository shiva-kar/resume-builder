"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Svg,
  Path,
  pdf,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ResumeData, Section, SectionItem, TemplateType } from "@/lib/schema";
import { GLOBAL_FONT_SCALES, DEFAULT_TYPOGRAPHY } from "@/lib/schema";

// Font family mapping for templates
const TEMPLATE_FONTS: Record<TemplateType, string> = {
  harvard: 'Times-Roman',    // Serif - classic academic style
  tech: 'Helvetica',         // Sans - modern tech style
  minimal: 'Helvetica',      // Sans - clean minimal
  bold: 'Helvetica',         // Sans - strong presence
  neo: 'Helvetica',          // Sans - contemporary
  portfolio: 'Helvetica',    // Sans - creative portfolio
  corporate: 'Helvetica',    // Sans - professional business
  creative: 'Helvetica',     // Sans - artistic style
  elegant: 'Times-Roman',    // Serif - refined typography
  modern: 'Helvetica',       // Sans - sleek modern
};

// Get the appropriate font family for a template
const getTemplateFont = (template: TemplateType): string => {
  return TEMPLATE_FONTS[template] || 'Helvetica';
};

// =====================================================
// SHARED TYPOGRAPHY CONFIGURATION (Matches PreviewCanvas)
// =====================================================

// Typography pixel sizes - MUST match PreviewCanvas TYPO_PX
const TYPO_PX = {
  sm: { name: 18, headers: 11, body: 9 },
  md: { name: 22, headers: 13, body: 10 },
  lg: { name: 26, headers: 15, body: 11 },
  xl: { name: 30, headers: 17, body: 12 },
};

// Date formatting helper - matches PreviewCanvas
const formatDate = (start?: string, end?: string, current?: boolean): string => {
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

// Helper to compute font sizes from theme
const getFontSizes = (data: ResumeData) => {
  const typography = data.theme.typography || DEFAULT_TYPOGRAPHY;
  const scale = GLOBAL_FONT_SCALES[data.theme.fontSize] || 1;

  return {
    name: Math.round(TYPO_PX[typography.name].name * scale),
    summary: Math.round(TYPO_PX[typography.headers].headers * scale),
    contact: Math.round(TYPO_PX[typography.body].body * scale),
    sectionHeading: Math.round(14 * scale),
    itemTitle: Math.round(13 * scale),
    itemSubtitle: Math.round(11 * scale),
    itemBody: Math.round(10 * scale),
    itemDate: Math.round(9 * scale),
  };
};

// Get base page styles with template-specific font
const getPageStyles = (template: TemplateType) => {
  const fontFamily = getTemplateFont(template);
  return StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: fontFamily,
      lineHeight: 1.4,
      color: "#1a1a1a",
    },
  });
};

// Base styles shared across templates (non-font-specific)
const baseStyles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  itemContainer: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bullet: {
    width: 15,
  },
  bulletText: {
    flex: 1,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
});

// Icon components for contact info
const EmailIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
    <Path
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const LinkedInIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
    <Path d="M4 2a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" />
  </Svg>
);

const GithubIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const WebsiteIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
    <Path
      d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

// =====================================================
// PDF RICH TEXT RENDERER - Markdown & Bullet Support
// =====================================================

interface PDFRichTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  themeColor?: string;
  style?: Style;
  textStyle?: Style;
}

// Render inline markdown segments for PDF (strong/em/link) using nested <Text>.
// NOTE: This is not HTML; it is React-PDF text nesting.
const renderInlineMarkdownChildrenPDF = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Pattern for: **bold**, __bold__, *italic*, _italic_, ***boldItalic***, [text](url)
  const pattern = /(\*\*\*(.+?)\*\*\*|___(.+?)___|(\*\*|__)(.+?)\4|(\*|_)([^*_]+?)\6|\[([^\]]+)\]\(([^)]+)\))/g;

  const children: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push(text.slice(lastIndex, match.index));
    }

    if (match[2] || match[3]) {
      children.push(
        <Text key={key++} style={{ fontWeight: "bold", fontStyle: "italic" }}>
          {match[2] || match[3]}
        </Text>
      );
    } else if (match[5]) {
      children.push(
        <Text key={key++} style={{ fontWeight: "bold" }}>
          {match[5]}
        </Text>
      );
    } else if (match[7]) {
      children.push(
        <Text key={key++} style={{ fontStyle: "italic" }}>
          {match[7]}
        </Text>
      );
    } else if (match[8] && match[9]) {
      const href = match[9].startsWith("http") ? match[9] : `https://${match[9]}`;
      children.push(
        <Link key={key++} src={href} style={{ color: "#2563eb", textDecoration: "none" }}>
          {match[8]}
        </Link>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    children.push(text.slice(lastIndex));
  }

  return children;
};

const InlineMarkdownPDF: React.FC<{ text: string; style: Style }> = ({ text, style }) => {
  if (!text) return null;
  const children = renderInlineMarkdownChildrenPDF(text);
  return <Text style={style}>{children.length > 0 ? children : text}</Text>;
};

// Main PDF rich text renderer with bullets, numbered lists, headers, and markdown
const PDFRichText: React.FC<PDFRichTextProps> = ({
  text,
  fontSize = 10,
  color = "#4b5563",
  themeColor = "#2563eb",
  style = {},
  textStyle = {}
}) => {
  if (!text) return null;

  const baseTextStyle: Style = { fontSize, color, ...textStyle };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for headers (## or ###)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerSizes: Record<number, number> = {
        1: fontSize * 1.4,
        2: fontSize * 1.25,
        3: fontSize * 1.1,
        4: fontSize * 1.05,
        5: fontSize,
        6: fontSize * 0.95,
      };
      const headerSize = headerSizes[level] || headerSizes[3];
      elements.push(
        <View key={i} style={{ marginBottom: 2 }}>
          <InlineMarkdownPDF
            text={headerMatch[2]}
            style={{ fontSize: headerSize, color: themeColor, fontWeight: level <= 2 ? "bold" : "bold" }}
          />
        </View>
      );
      continue;
    }

    // Check for bullet points (-, *, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginBottom: 1.5 }}>
          <View style={{ width: 12, alignItems: "center", paddingTop: fontSize * 0.35 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: themeColor }} />
          </View>
          <View style={{ flex: 1 }}>
            <InlineMarkdownPDF text={bulletMatch[1]} style={baseTextStyle} />
          </View>
        </View>
      );
      continue;
    }

    // Check for numbered lists (1., 2., etc.)
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginBottom: 1.5 }}>
          <Text style={{ width: 16, fontSize, color: themeColor, fontWeight: "bold" }}>
            {numberedMatch[1]}.
          </Text>
          <View style={{ flex: 1 }}>
            <InlineMarkdownPDF text={numberedMatch[2]} style={baseTextStyle} />
          </View>
        </View>
      );
      continue;
    }

    // Regular text or empty line
    if (trimmed) {
      elements.push(
        <View key={i} style={{ marginBottom: 1 }}>
          <InlineMarkdownPDF text={trimmed} style={baseTextStyle} />
        </View>
      );
    } else if (line === '' && i > 0 && i < lines.length - 1) {
      // Empty line (paragraph break)
      elements.push(<View key={i} style={{ height: fontSize * 0.5 }} />);
    }
  }

  return <View style={style}>{elements}</View>;
};

// =====================================================
// TEMPLATE-SPECIFIC HEADER RENDERERS
// =====================================================

type FontSizes = ReturnType<typeof getFontSizes>;

const renderHarvardHeader = (data: ResumeData, fontSize: FontSizes) => (
  <View style={{ marginBottom: 16, borderBottom: "2 solid #1f2937", paddingBottom: 10, textAlign: "center" }}>
    <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: "#1f2937", textAlign: "center", marginBottom: 4, textTransform: "uppercase", letterSpacing: 2 }}>
      {data.personalInfo?.fullName || ""}
    </Text>
    {data.personalInfo?.summary && (
      <PDFRichText
        text={data.personalInfo.summary}
        fontSize={fontSize.summary}
        color="#4b5563"
        themeColor={data.theme.color}
        style={{ marginBottom: 8 }}
      />
    )}
    <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
      {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
      {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
      {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
    </View>
    <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
      {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: "#4b5563" }}>LinkedIn</Link>}
      {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: "#4b5563" }}>GitHub</Link>}
      {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: "#4b5563" }}>Portfolio</Link>}
    </View>
  </View>
);

const renderTechHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: color, marginBottom: 2 }}>
        {data.personalInfo?.fullName || ""}
      </Text>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#6b7280"
          themeColor={color}
          style={{ marginBottom: 8 }}
        />
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
        {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
        {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
        {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
        {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
        {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
      </View>
    </View>
  );
};

const renderMinimalHeader = (data: ResumeData, fontSize: FontSizes) => (
  <View style={{ marginBottom: 20, textAlign: "center" }}>
    <Text style={{ fontSize: fontSize.name, fontWeight: "light", color: "#1f2937", textAlign: "center", marginBottom: 6, letterSpacing: 1 }}>
      {data.personalInfo?.fullName || ""}
    </Text>
    {data.personalInfo?.summary && (
      <PDFRichText
        text={data.personalInfo.summary}
        fontSize={fontSize.summary}
        color="#9ca3af"
        themeColor={data.theme.color}
        style={{ marginBottom: 8 }}
      />
    )}
    <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
      {data.personalInfo?.email && <Text style={{ color: "#6b7280" }}>{data.personalInfo.email}</Text>}
      {data.personalInfo?.phone && <Text style={{ color: "#6b7280" }}>{data.personalInfo.phone}</Text>}
      {data.personalInfo?.location && <Text style={{ color: "#6b7280" }}>{data.personalInfo.location}</Text>}
    </View>
    <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
      {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: "#6b7280" }}>LinkedIn</Link>}
      {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: "#6b7280" }}>GitHub</Link>}
      {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: "#6b7280" }}>Portfolio</Link>}
    </View>
  </View>
);

const renderBoldHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16, borderBottom: `4 solid ${color}`, paddingBottom: 12 }}>
      <Text style={{ fontSize: Math.round(fontSize.name * 1.15), fontWeight: "bold", color: color, marginBottom: 2, textTransform: "uppercase" }}>
        {data.personalInfo?.fullName || ""}
      </Text>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#4b5563"
          themeColor={color}
          style={{ marginBottom: 8 }}
        />
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
        {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
        {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
        {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
        {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
        {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
      </View>
    </View>
  );
};

const renderNeoHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <View style={{ width: 12, height: 12, backgroundColor: color }} />
        <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: "#1f2937" }}>
          {data.personalInfo?.fullName || ""}
        </Text>
      </View>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#6b7280"
          themeColor={color}
          style={{ marginBottom: 8 }}
        />
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
        {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
        {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
        {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
        {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
        {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
      </View>
    </View>
  );
};

const renderPortfolioHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16, borderBottom: `2 solid ${color}`, paddingBottom: 12 }}>
      <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: color, marginBottom: 4 }}>
        {data.personalInfo?.fullName || ""}
      </Text>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#6b7280"
          themeColor={color}
          style={{ marginBottom: 8 }}
        />
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
        {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
        {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
        {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
        {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
        {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
      </View>
    </View>
  );
};

const renderCorporateHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16, backgroundColor: "#f9fafb", padding: 14, borderLeft: `4 solid ${color}` }}>
      <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: "#1f2937", marginBottom: 4 }}>
        {data.personalInfo?.fullName || ""}
      </Text>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#4b5563"
          themeColor={color}
          style={{ marginBottom: 8 }}
        />
      )}
      <View style={{ borderTop: "1 solid #e5e7eb", paddingTop: 8, marginTop: 4 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
          {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
          {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
          {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
          {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
          {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
          {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
        </View>
      </View>
    </View>
  );
};

const renderCreativeHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  const fullName = data.personalInfo?.fullName || "";
  return (
    <View style={{ marginBottom: 20, position: "relative" }}>
      <View style={{ position: "absolute", top: 0, left: 0, width: 50, height: 50, backgroundColor: color, opacity: 0.2 }} />
      <View style={{ paddingLeft: 20, paddingTop: 12 }}>
        <Text style={{ fontSize: Math.round(fontSize.name * 1.1), fontWeight: "bold", marginBottom: 4 }}>
          <Text style={{ color: color }}>{fullName.charAt(0)}</Text>
          <Text style={{ color: "#1f2937" }}>{fullName.slice(1)}</Text>
        </Text>
        {data.personalInfo?.summary && (
          <PDFRichText
            text={`“${data.personalInfo.summary}”`}
            fontSize={fontSize.summary}
            color="#4b5563"
            themeColor={color}
            textStyle={{ fontStyle: "italic" }}
            style={{ marginBottom: 8 }}
          />
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
          {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
          {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
          {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
          {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
          {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
          {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
        </View>
      </View>
    </View>
  );
};

const renderElegantHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 20, textAlign: "center" }}>
      <Text style={{ fontSize: Math.round(fontSize.name * 1.05), fontWeight: "normal", color: "#1f2937", textAlign: "center", marginBottom: 8, letterSpacing: 3, textTransform: "uppercase" }}>
        {data.personalInfo?.fullName || ""}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <View style={{ width: 40, height: 1, backgroundColor: "#d1d5db" }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        <View style={{ width: 40, height: 1, backgroundColor: "#d1d5db" }} />
      </View>
      {data.personalInfo?.summary && (
        <PDFRichText
          text={data.personalInfo.summary}
          fontSize={fontSize.summary}
          color="#6b7280"
          themeColor={color}
          textStyle={{ fontStyle: "italic" }}
          style={{ marginBottom: 10 }}
        />
      )}
      <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
        {data.personalInfo?.email && <Text style={{ color: "#6b7280" }}>{data.personalInfo.email}</Text>}
        {data.personalInfo?.phone && <Text style={{ color: "#6b7280" }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo?.location && <Text style={{ color: "#6b7280" }}>{data.personalInfo.location}</Text>}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
        {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: "#6b7280" }}>LinkedIn</Link>}
        {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: "#6b7280" }}>GitHub</Link>}
        {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: "#6b7280" }}>Portfolio</Link>}
      </View>
    </View>
  );
};

const renderModernHeader = (data: ResumeData, fontSize: FontSizes) => {
  const color = data.theme.color;
  return (
    <View style={{ marginBottom: 16, flexDirection: "row", gap: 10 }}>
      <View style={{ width: 4, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.name, fontWeight: "bold", color: "#1f2937", marginBottom: 2 }}>
          {data.personalInfo?.fullName || ""}
        </Text>
        {data.personalInfo?.summary && (
          <PDFRichText
            text={data.personalInfo.summary}
            fontSize={fontSize.summary}
            color="#6b7280"
            themeColor={color}
            style={{ marginBottom: 8 }}
          />
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact }}>
          {data.personalInfo?.email && <Text style={{ color: "#4b5563" }}>{data.personalInfo.email}</Text>}
          {data.personalInfo?.phone && <Text style={{ color: "#4b5563" }}>{data.personalInfo.phone}</Text>}
          {data.personalInfo?.location && <Text style={{ color: "#4b5563" }}>{data.personalInfo.location}</Text>}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: fontSize.contact, marginTop: 4 }}>
          {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ color: color }}>LinkedIn</Link>}
          {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ color: color }}>GitHub</Link>}
          {data.personalInfo?.website && <Link src={data.personalInfo.website} style={{ color: color }}>Portfolio</Link>}
        </View>
      </View>
    </View>
  );
};

// =====================================================
// TEMPLATE-SPECIFIC SECTION TITLE RENDERERS
// =====================================================

const renderSectionTitle = (title: string, template: TemplateType, color: string, sectionHeadingSize: number = 12) => {
  switch (template) {
    case "harvard":
      return (
        <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: "#1f2937", borderBottom: "1 solid #1f2937", paddingBottom: 2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          {title}
        </Text>
      );
    case "tech":
      return (
        <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: color, marginBottom: 8 }}>
          {title}
        </Text>
      );
    case "bold":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <View style={{ width: 3, height: 14, backgroundColor: color }} />
          <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: "#1f2937", textTransform: "uppercase" }}>{title}</Text>
        </View>
      );
    case "neo":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <View style={{ width: 10, height: 10, backgroundColor: color }} />
          <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: "#1f2937", textTransform: "uppercase", letterSpacing: 1 }}>{title}</Text>
        </View>
      );
    case "portfolio":
      return (
        <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: color, marginBottom: 8 }}>
          {title}
        </Text>
      );
    case "corporate":
      return (
        <View style={{ marginBottom: 8, borderBottom: "2 solid #e5e7eb", paddingBottom: 4 }}>
          <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: "#1f2937" }}>{title}</Text>
        </View>
      );
    case "creative":
      return (
        <View style={{ marginBottom: 8, flexDirection: "row" }}>
          <View style={{ backgroundColor: color + "30", paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2 }}>
            <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: color, textTransform: "uppercase", letterSpacing: 1 }}>{title}</Text>
          </View>
        </View>
      );
    case "elegant":
      return (
        <View style={{ marginBottom: 8, textAlign: "center" }}>
          <Text style={{ fontSize: Math.round(sectionHeadingSize * 0.9), fontWeight: "normal", color: "#6b7280", textAlign: "center", letterSpacing: 3, textTransform: "uppercase" }}>{title}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 4 }}>
            <View style={{ width: 30, height: 1, backgroundColor: color + "60" }} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
            <View style={{ width: 30, height: 1, backgroundColor: color + "60" }} />
          </View>
        </View>
      );
    case "modern":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <View style={{ width: 2, height: 14, backgroundColor: color, borderRadius: 1 }} />
          <Text style={{ fontSize: sectionHeadingSize, fontWeight: "bold", color: "#1f2937" }}>{title}</Text>
        </View>
      );
    case "minimal":
    default:
      return (
        <Text style={{ fontSize: Math.round(sectionHeadingSize * 0.85), fontWeight: "bold", color: "#9ca3af", marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>
          {title}
        </Text>
      );
  }
};

// =====================================================
// TEMPLATE-SPECIFIC SKILLS RENDERERS
// =====================================================

const renderSkills = (skills: string[], template: TemplateType, color: string) => {
  if (!skills || skills.length === 0) return null;

  switch (template) {
    case "elegant":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, color: "#6b7280" }}>
              {skill}{idx < skills.length - 1 ? " · " : ""}
            </Text>
          ))}
        </View>
      );

    case "corporate":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: "#f3f4f6", padding: "3 8", borderRadius: 3, color: "#374151" }}>
              {skill}
            </Text>
          ))}
        </View>
      );

    case "creative":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: color + "15", color: color, padding: "3 8", borderRadius: 4, fontWeight: "bold" }}>
              {skill}
            </Text>
          ))}
        </View>
      );

    case "modern":
      return (
        <View style={{ flexDirection: "column", gap: 4 }}>
          {skills.map((skill, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
              <Text style={{ fontSize: 9, color: "#374151" }}>{skill}</Text>
            </View>
          ))}
        </View>
      );

    case "bold":
    case "tech":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: color + "20", color: color, padding: "3 8", borderRadius: 3 }}>
              {skill}
            </Text>
          ))}
        </View>
      );

    case "neo":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: color + "20", color: color, padding: "3 8" }}>
              {skill}
            </Text>
          ))}
        </View>
      );

    case "portfolio":
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: color + "20", color: color, padding: "3 8", borderRadius: 4 }}>
              {skill}
            </Text>
          ))}
        </View>
      );

    case "harvard":
      return (
        <Text style={{ fontSize: 9, color: "#374151" }}>
          {skills.join(", ")}
        </Text>
      );

    case "minimal":
    default:
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {skills.map((skill, idx) => (
            <Text key={idx} style={{ fontSize: 9, backgroundColor: color + "20", color: color, padding: "3 8", borderRadius: 3 }}>
              {skill}
            </Text>
          ))}
        </View>
      );
  }
};

// =====================================================
// TEMPLATE-SPECIFIC ITEM RENDERERS (Experience/Education)
// =====================================================

const getTemplateColors = (template: TemplateType, color: string) => {
  switch (template) {
    case "harvard": return { title: "#1f2937", subtitle: "#4b5563", date: "#6b7280" };
    case "tech": return { title: "#0f172a", subtitle: color, date: "#64748b" };
    case "bold": return { title: "#0f172a", subtitle: color, date: "#94a3b8" };
    case "neo": return { title: "#1f2937", subtitle: color, date: "#9ca3af" };
    case "portfolio": return { title: "#1f2937", subtitle: color, date: "#9ca3af" };
    case "corporate": return { title: "#1f2937", subtitle: "#4b5563", date: "#6b7280" };
    case "creative": return { title: color, subtitle: "#6b7280", date: "#9ca3af" };
    case "elegant": return { title: "#1f2937", subtitle: "#6b7280", date: "#9ca3af" };
    case "modern": return { title: "#1f2937", subtitle: color, date: "#9ca3af" };
    case "minimal":
    default: return { title: "#1f2937", subtitle: "#4b5563", date: "#9ca3af" };
  }
};

const renderExperienceItem = (item: SectionItem, template: TemplateType, color: string) => {
  const colors = getTemplateColors(template, color);
  const dateStr = formatDate(item.startDate, item.endDate, item.current);

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.title }}>{item.position || item.title || ""}</Text>
          <Text style={{ fontSize: 10, color: colors.subtitle }}>{item.company || item.subtitle || ""}</Text>
        </View>
        <Text style={{ fontSize: 9, color: colors.date, fontStyle: "italic" }}>{dateStr}</Text>
      </View>
      {item.description && (
        <PDFRichText
          text={item.description}
          fontSize={9}
          color="#4b5563"
          themeColor={color}
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  );
};

const renderEducationItem = (item: SectionItem, template: TemplateType, color: string) => {
  const colors = getTemplateColors(template, color);
  const dateStr = formatDate(item.startDate, item.endDate, item.current);

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.title }}>{item.degree || item.title || ""}</Text>
          <Text style={{ fontSize: 10, color: colors.subtitle }}>{item.institution || item.subtitle || ""}</Text>
        </View>
        <Text style={{ fontSize: 9, color: colors.date, fontStyle: "italic" }}>{dateStr}</Text>
      </View>
      {item.description && (
        <PDFRichText
          text={item.description}
          fontSize={9}
          color="#4b5563"
          themeColor={color}
          style={{ marginTop: 4 }}
        />
      )}
    </View>
  );
};

const renderCustomItem = (item: SectionItem, template: TemplateType, color: string) => {
  const colors = getTemplateColors(template, color);

  return (
    <View style={{ marginBottom: 8 }}>
      {item.title && <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.title }}>{item.title}</Text>}
      {item.subtitle && <Text style={{ fontSize: 10, color: colors.subtitle }}>{item.subtitle}</Text>}
      {item.description && (
        <PDFRichText
          text={item.description}
          fontSize={9}
          color="#4b5563"
          themeColor={color}
          style={{ marginTop: 2 }}
        />
      )}
    </View>
  );
};

// =====================================================
// SECTION RENDERER
// =====================================================

const renderSection = (section: Section, template: TemplateType, color: string) => {
  if (!section.isVisible) return null;

  // Filter items to only include those with real content (not placeholders)
  const realItems = (section.items || []).filter(item => {
    const hasTitle = isRealContent(item.title) || isRealContent(item.position) || isRealContent(item.degree);
    const hasSubtitle = isRealContent(item.subtitle) || isRealContent(item.company) || isRealContent(item.institution);
    const hasDescription = isRealContent(item.description);
    const hasSkills = item.skills && item.skills.length > 0 && item.skills.some(s => isRealContent(s));
    return hasTitle || hasSubtitle || hasDescription || hasSkills;
  });

  // Core sections (experience, education, skills) always show header even if empty
  const isCoreSection = ['experience', 'education', 'skills'].includes(section.type);

  // For non-core sections (projects, certifications, custom), hide entirely if no real content
  if (!isCoreSection && realItems.length === 0) {
    return null;
  }

  switch (section.type) {
    case "experience":
      return (
        <View style={baseStyles.section} key={section.id}>
          {renderSectionTitle(section.title, template, color)}
          {realItems.length > 0 ? (
            realItems.map((item) => (
              <View key={item.id}>
                {renderExperienceItem(item, template, color)}
              </View>
            ))
          ) : (
            <View style={{ height: 20 }} /> // Empty space placeholder
          )}
        </View>
      );

    case "education":
      return (
        <View style={baseStyles.section} key={section.id}>
          {renderSectionTitle(section.title, template, color)}
          {realItems.length > 0 ? (
            realItems.map((item) => (
              <View key={item.id}>
                {renderEducationItem(item, template, color)}
              </View>
            ))
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>
      );

    case "skills":
      const skillsItem = section.items?.[0];
      const allSkills = skillsItem?.skills || [];
      const realSkills = allSkills.filter(s => isRealContent(s));
      return (
        <View style={baseStyles.section} key={section.id}>
          {renderSectionTitle(section.title, template, color)}
          {realSkills.length > 0 ? (
            renderSkills(realSkills, template, color)
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>
      );

    case "projects":
    case "certifications":
    case "custom":
    default:
      return (
        <View style={baseStyles.section} key={section.id}>
          {renderSectionTitle(section.title, template, color)}
          {realItems.map((item) => (
            <View key={item.id}>
              {renderCustomItem(item, template, color)}
            </View>
          ))}
        </View>
      );
  }
};

// =====================================================
// MAIN RESUME PDF COMPONENT
// =====================================================

interface ResumePDFProps {
  data: ResumeData;
  template: TemplateType;
}

// Helper to check if content is real (not placeholder)
const isRealContent = (value: string | undefined | null): boolean => {
  if (!value || value.trim() === '') return false;
  const placeholders = [
    'your name', 'full name', 'your title', 'job title',
    'your email', 'your phone', 'your location', 'city, country',
    'write a short', 'professional summary', 'add your',
    'xyz company', 'company name', 'position title',
    'university name', 'degree name', 'field of study',
    'skill name', 'project name', 'certification name',
    'describe your', 'brief description', 'example', 'sample',
    'lorem ipsum', 'your.email@example', '+1 234 567'
  ];
  const lower = value.toLowerCase().trim();
  return !placeholders.some(p => lower.includes(p) || lower === p);
};

// Helper to get real skills only
const getRealSkills = (section: Section): string[] => {
  const skillsItem = section.items?.[0];
  const allSkills = skillsItem?.skills || [];
  return allSkills.filter(s => isRealContent(s));
};

const ResumePDF: React.FC<ResumePDFProps> = ({ data, template }) => {
  const color = data.theme.color;

  // Compute font sizes based on theme (matches PreviewCanvas)
  const fontSize = getFontSizes(data);

  // Get all visible sections - we'll render headers for core sections even if empty
  const visibleSections = data.sections.filter((s) => s.isVisible);

  // Check if personal info has real content
  const hasRealName = isRealContent(data.personalInfo?.fullName);
  const hasRealSummary = isRealContent(data.personalInfo?.summary);
  const hasRealEmail = isRealContent(data.personalInfo?.email);
  const hasRealPhone = isRealContent(data.personalInfo?.phone);
  const hasRealLocation = isRealContent(data.personalInfo?.location);

  // Render header based on template
  const renderHeader = () => {
    switch (template) {
      case "harvard": return renderHarvardHeader(data, fontSize);
      case "tech": return renderTechHeader(data, fontSize);
      case "minimal": return renderMinimalHeader(data, fontSize);
      case "bold": return renderBoldHeader(data, fontSize);
      case "neo": return renderNeoHeader(data, fontSize);
      case "portfolio": return renderPortfolioHeader(data, fontSize);
      case "corporate": return renderCorporateHeader(data, fontSize);
      case "creative": return renderCreativeHeader(data, fontSize);
      case "elegant": return renderElegantHeader(data, fontSize);
      case "modern": return renderModernHeader(data, fontSize);
      default: return renderMinimalHeader(data, fontSize);
    }
  };

  // Get page style based on template
  const getPageStyle = () => {
    const pageStyles = getPageStyles(template);
    const base = { ...pageStyles.page };
    if (template === "elegant") {
      return { ...base, backgroundColor: "#fdfbf7" };
    }
    return base;
  };

  // Local section renderer that uses fontSize
  const renderSectionLocal = (section: Section) => {
    if (!section.isVisible) return null;

    // Filter items to only include those with real content (not placeholders)
    const realItems = (section.items || []).filter(item => {
      const hasTitle = isRealContent(item.title) || isRealContent(item.position) || isRealContent(item.degree);
      const hasSubtitle = isRealContent(item.subtitle) || isRealContent(item.company) || isRealContent(item.institution);
      const hasDescription = isRealContent(item.description);
      const hasSkills = item.skills && item.skills.length > 0 && item.skills.some(s => isRealContent(s));
      return hasTitle || hasSubtitle || hasDescription || hasSkills;
    });

    // Core sections (experience, education, skills) always show header even if empty
    const isCoreSection = ['experience', 'education', 'skills'].includes(section.type);

    // For non-core sections (projects, certifications, custom), hide entirely if no real content
    if (!isCoreSection && realItems.length === 0) {
      return null;
    }

    const colors = getTemplateColors(template, color);

    switch (section.type) {
      case "experience":
        return (
          <View style={baseStyles.section} key={section.id}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {realItems.length > 0 ? (
              realItems.map((item) => (
                <View key={item.id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.position || item.title || ""}</Text>
                      <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.company || item.subtitle || ""}</Text>
                    </View>
                    <Text style={{ fontSize: fontSize.itemDate, color: colors.date, fontStyle: "italic" }}>
                      {formatDate(item.startDate, item.endDate, item.current)}
                    </Text>
                  </View>
                  {item.description && (
                    <PDFRichText
                      text={item.description}
                      fontSize={fontSize.itemBody}
                      color="#4b5563"
                      themeColor={color}
                      style={{ marginTop: 4 }}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={{ height: 20 }} />
            )}
          </View>
        );

      case "education":
        return (
          <View style={baseStyles.section} key={section.id}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {realItems.length > 0 ? (
              realItems.map((item) => (
                <View key={item.id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.degree || item.title || ""}</Text>
                      <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.institution || item.subtitle || ""}</Text>
                    </View>
                    <Text style={{ fontSize: fontSize.itemDate, color: colors.date, fontStyle: "italic" }}>
                      {formatDate(item.startDate, item.endDate)}
                    </Text>
                  </View>
                  {item.description && (
                    <PDFRichText
                      text={item.description}
                      fontSize={fontSize.itemBody}
                      color="#4b5563"
                      themeColor={color}
                      style={{ marginTop: 4 }}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={{ height: 20 }} />
            )}
          </View>
        );

      case "skills":
        const skillsItem = section.items?.[0];
        const allSkills = skillsItem?.skills || [];
        const realSkills = allSkills.filter(s => isRealContent(s));
        return (
          <View style={baseStyles.section} key={section.id}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {realSkills.length > 0 ? (
              renderSkills(realSkills, template, color)
            ) : (
              <View style={{ height: 20 }} />
            )}
          </View>
        );

      case "projects":
      case "certifications":
      case "custom":
      default:
        return (
          <View style={baseStyles.section} key={section.id}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {realItems.map((item) => (
              <View key={item.id} style={{ marginBottom: 8 }}>
                {item.title && <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.title}</Text>}
                {item.subtitle && <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.subtitle}</Text>}
                {item.description && (
                  <PDFRichText
                    text={item.description}
                    fontSize={fontSize.itemBody}
                    color="#4b5563"
                    themeColor={color}
                    style={{ marginTop: 2 }}
                  />
                )}
              </View>
            ))}
          </View>
        );
    }
  };

  // =====================================================
  // PORTFOLIO LAYOUT - Two column with skills sidebar
  // =====================================================
  const renderPortfolioLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const mainSections = visibleSections.filter((s) => s.type !== 'skills');
    const realSkills = skillsSection ? getRealSkills(skillsSection) : [];

    return (
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Left sidebar */}
        <View style={{ width: "33%", backgroundColor: "#f9fafb", borderRight: "1 solid #e5e7eb", padding: 20 }}>
          {hasRealName && (
            <Text style={{ fontSize: fontSize.name, fontWeight: "bold", marginBottom: 4 }}>
              {data.personalInfo.fullName}
            </Text>
          )}
          {hasRealSummary && (
            <Text style={{ fontSize: fontSize.summary, color: color, marginBottom: 12 }}>
              {data.personalInfo.summary}
            </Text>
          )}
          {/* Contact info */}
          <View style={{ marginBottom: 16 }}>
            {hasRealEmail && <Text style={{ fontSize: fontSize.contact, color: "#4b5563", marginBottom: 2 }}>{data.personalInfo.email}</Text>}
            {hasRealPhone && <Text style={{ fontSize: fontSize.contact, color: "#4b5563", marginBottom: 2 }}>{data.personalInfo.phone}</Text>}
            {hasRealLocation && <Text style={{ fontSize: fontSize.contact, color: "#4b5563", marginBottom: 2 }}>{data.personalInfo.location}</Text>}
            {data.personalInfo?.linkedin && <Link src={data.personalInfo.linkedin} style={{ fontSize: fontSize.contact, color: color }}>LinkedIn</Link>}
            {data.personalInfo?.github && <Link src={data.personalInfo.github} style={{ fontSize: fontSize.contact, color: color, marginTop: 2 }}>GitHub</Link>}
          </View>
          {/* Skills in sidebar - always show header if section is visible */}
          {skillsSection && (
            <View>
              {renderSectionTitle("Skills", template, color, fontSize.sectionHeading)}
              {realSkills.length > 0 ? renderSkills(realSkills, template, color) : <View style={{ height: 16 }} />}
            </View>
          )}
        </View>
        {/* Main content */}
        <View style={{ width: "67%", padding: 20 }}>
          {mainSections.map((section) => renderSectionLocal(section))}
        </View>
      </View>
    );
  };

  // =====================================================
  // CORPORATE LAYOUT - Sections in bordered cards
  // =====================================================
  const renderCorporateLayout = () => (
    <View style={{ padding: 30 }}>
      {renderHeader()}
      <View style={{ marginTop: 16 }}>
        {visibleSections.map((section) => (
          <View key={section.id} style={{ backgroundColor: "#fafafa", border: "1 solid #f0f0f0", borderRadius: 4, padding: 12, marginBottom: 12 }}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {renderSectionContent(section, template, color)}
          </View>
        ))}
      </View>
    </View>
  );

  // =====================================================
  // CREATIVE LAYOUT - Asymmetric grid
  // =====================================================
  const renderCreativeLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const experienceSection = visibleSections.find((s) => s.type === 'experience');
    const otherSections = visibleSections.filter((s) => s.type !== 'skills' && s.type !== 'experience');
    const realSkills = skillsSection ? getRealSkills(skillsSection) : [];

    return (
      <View style={{ padding: 24 }}>
        {renderHeader()}
        <View style={{ flexDirection: "row", marginTop: 16 }}>
          {/* Left column - 60% */}
          <View style={{ width: "60%", paddingRight: 16 }}>
            {experienceSection && (
              <View style={{ marginBottom: 16 }}>
                {renderSectionTitle(experienceSection.title, template, color, fontSize.sectionHeading)}
                {renderSectionContent(experienceSection, template, color)}
              </View>
            )}
            {otherSections.map((section) => (
              <View key={section.id} style={{ marginBottom: 12 }}>
                {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
                {renderSectionContent(section, template, color)}
              </View>
            ))}
          </View>
          {/* Right column - 40% with accent background */}
          <View style={{ width: "40%", backgroundColor: color + "10", borderRadius: 6, padding: 12 }}>
            {skillsSection && (
              <View>
                {renderSectionTitle("Skills", template, color, fontSize.sectionHeading)}
                {realSkills.length > 0 ? renderSkills(realSkills, template, color) : <View style={{ height: 16 }} />}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // =====================================================
  // ELEGANT LAYOUT - Centered with generous spacing
  // =====================================================
  const renderElegantLayout = () => (
    <View style={{ paddingHorizontal: 50, paddingVertical: 40 }}>
      {renderHeader()}
      <View style={{ marginTop: 24 }}>
        {visibleSections.map((section) => (
          <View key={section.id} style={{ marginBottom: 20, textAlign: "center" }}>
            {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
            {renderSectionContent(section, template, color)}
          </View>
        ))}
      </View>
    </View>
  );

  // =====================================================
  // MODERN LAYOUT - Accent bar + sidebar
  // =====================================================
  const renderModernLayout = () => {
    const skillsSection = visibleSections.find((s) => s.type === 'skills');
    const mainSections = visibleSections.filter((s) => s.type !== 'skills');
    const realSkills = skillsSection ? getRealSkills(skillsSection) : [];

    return (
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Thin accent bar */}
        <View style={{ width: 4, backgroundColor: color }} />
        {/* Main content area */}
        <View style={{ flex: 1, padding: 30 }}>
          {renderHeader()}
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            {/* Main content - 66% */}
            <View style={{ width: "66%", paddingRight: 16 }}>
              {mainSections.map((section) => (
                <View key={section.id} style={{ borderLeft: "2 solid #f0f0f0", paddingLeft: 12, marginBottom: 14 }}>
                  {renderSectionTitle(section.title, template, color, fontSize.sectionHeading)}
                  {renderSectionContent(section, template, color)}
                </View>
              ))}
            </View>
            {/* Skills sidebar - 34% */}
            <View style={{ width: "34%" }}>
              {skillsSection && (
                <View style={{ backgroundColor: "#f9fafb", padding: 12, borderRadius: 6 }}>
                  {renderSectionTitle("Skills", template, color, fontSize.sectionHeading)}
                  {realSkills.length > 0 ? renderSkills(realSkills, template, color) : <View style={{ height: 16 }} />}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // =====================================================
  // STANDARD LAYOUT (Harvard, Tech, Minimal, Bold, Neo)
  // =====================================================
  const renderStandardLayout = () => (
    <View style={{ padding: 40 }}>
      {renderHeader()}
      {visibleSections.map((section) => renderSectionLocal(section))}
    </View>
  );

  // Helper to filter items with real content
  const filterRealItems = (items: SectionItem[]) => {
    return items.filter(item => {
      const hasTitle = isRealContent(item.title) || isRealContent(item.position) || isRealContent(item.degree);
      const hasSubtitle = isRealContent(item.subtitle) || isRealContent(item.company) || isRealContent(item.institution);
      const hasDescription = isRealContent(item.description);
      return hasTitle || hasSubtitle || hasDescription;
    });
  };

  // Helper to render section content without wrapper
  const renderSectionContent = (section: Section, tmpl: TemplateType, clr: string) => {
    const realItems = filterRealItems(section.items || []);
    const isCoreSection = ['experience', 'education', 'skills'].includes(section.type);
    const colors = getTemplateColors(tmpl, clr);

    switch (section.type) {
      case "experience":
        if (realItems.length === 0) return isCoreSection ? <View style={{ height: 16 }} /> : null;
        return realItems.map((item) => (
          <View key={item.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.position || item.title || ""}</Text>
                <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.company || item.subtitle || ""}</Text>
              </View>
              <Text style={{ fontSize: fontSize.itemDate, color: colors.date, fontStyle: "italic" }}>
                {formatDate(item.startDate, item.endDate, item.current)}
              </Text>
            </View>
            {item.description && (
              <PDFRichText
                text={item.description}
                fontSize={fontSize.itemBody}
                color="#4b5563"
                themeColor={clr}
                style={{ marginTop: 4 }}
              />
            )}
          </View>
        ));
      case "education":
        if (realItems.length === 0) return isCoreSection ? <View style={{ height: 16 }} /> : null;
        return realItems.map((item) => (
          <View key={item.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.degree || item.title || ""}</Text>
                <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.institution || item.subtitle || ""}</Text>
              </View>
              <Text style={{ fontSize: fontSize.itemDate, color: colors.date, fontStyle: "italic" }}>
                {formatDate(item.startDate, item.endDate)}
              </Text>
            </View>
            {item.description && (
              <PDFRichText
                text={item.description}
                fontSize={fontSize.itemBody}
                color="#4b5563"
                themeColor={clr}
                style={{ marginTop: 4 }}
              />
            )}
          </View>
        ));
      case "skills":
        const skills = section.items[0]?.skills || [];
        const realSkills = skills.filter(s => isRealContent(s));
        if (realSkills.length === 0) return isCoreSection ? <View style={{ height: 16 }} /> : null;
        return renderSkills(realSkills, tmpl, clr);
      default:
        if (realItems.length === 0) return null;
        return realItems.map((item) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            {item.title && <Text style={{ fontSize: fontSize.itemTitle, fontWeight: "bold", color: colors.title }}>{item.title}</Text>}
            {item.subtitle && <Text style={{ fontSize: fontSize.itemSubtitle, color: colors.subtitle }}>{item.subtitle}</Text>}
            {item.description && (
              <PDFRichText
                text={item.description}
                fontSize={fontSize.itemBody}
                color="#4b5563"
                themeColor={clr}
                style={{ marginTop: 2 }}
              />
            )}
          </View>
        ));
    }
  };

  // Select layout based on template
  const renderLayout = () => {
    switch (template) {
      case "portfolio": return renderPortfolioLayout();
      case "corporate": return renderCorporateLayout();
      case "creative": return renderCreativeLayout();
      case "elegant": return renderElegantLayout();
      case "modern": return renderModernLayout();
      default: return renderStandardLayout();
    }
  };

  // Get template-specific page styles with proper font family
  const pageStyles = getPageStyles(template);
  const templateFont = getTemplateFont(template);

  // Base page style with font family
  const pageStyle: Style = {
    ...pageStyles.page,
    ...(template === "elegant" ? { backgroundColor: "#fdfbf7" } : {}),
  };

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        <View style={{ fontFamily: templateFont }}>
          {renderLayout()}
        </View>
      </Page>
    </Document>
  );
};

// Named export for compatibility with PDFViewer
export const ResumePDFDocument: React.FC<{ data: ResumeData }> = ({ data }) => {
  return <ResumePDF data={data} template={data.theme.template} />;
};

// Export PDF to blob for download
export const exportToPDF = async (data: ResumeData): Promise<Blob> => {
  const doc = <ResumePDFDocument data={data} />;
  const blob = await pdf(doc).toBlob();
  return blob;
};

// Download PDF from blob
export const downloadPDF = (blob: Blob, filename = 'resume.pdf'): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default ResumePDF;
