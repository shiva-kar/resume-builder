"use client";

import React from "react";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  Document as PdfDocument,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { ResumeData, Section, SectionItem, TemplateType } from "@/lib/schema";
import { formatDateRange as formatDate } from "@/lib/formatting";
import { getTemplateBackground } from "@/lib/templates";
import { registerPdfFonts } from "@/lib/pdfFonts";
import { PDFMarkdown } from "./PDFMarkdown";
import { ModernTemplate } from "./templates/ModernTemplate";
import {
  shouldRenderSection,
  toKeyedItems,
  isNonEmpty,
  getRenderableItems,
  getPrimaryText,
  getSecondaryText,
  getDateText,
  getSkillLabels
} from "./pdfUtils";

registerPdfFonts();

interface ResumePDFProps {
  data: ResumeData;
  template: TemplateType;
}

type KeyedItem<T> = {
  key: string;
  item: T;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: 32,
    fontSize: 10,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summary: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 9,
    color: "#6b7280",
    marginRight: 10,
    marginBottom: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  itemBlock: {
    marginBottom: 8,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  itemPrimary: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  itemSecondary: {
    fontSize: 10,
    color: "#4b5563",
  },
  itemDate: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
  },
  itemDescription: {
    fontSize: 9,
    color: "#374151",
    marginTop: 2,
    lineHeight: 1.4,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    fontSize: 9,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 3,
  },
  placeholder: {
    fontSize: 9,
    color: "#9ca3af",
    fontStyle: "italic",
  },
});



const renderSectionBody = (section: Section, accentColor: string): React.ReactNode => {
  if (section.type === "skills") {
    const skillLabels = getSkillLabels(section);
    if (skillLabels.length === 0) {
      return <Text style={styles.placeholder}>Add skills to this section</Text>;
    }

    const keyedSkills = toKeyedItems(skillLabels, (skill) => skill, `${section.id}-skill`);
    return (
      <View style={styles.skillWrap}>
        {keyedSkills.map(({ key, item }) => (
          <Text
            key={key}
            style={{
              ...styles.skillTag,
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {item}
          </Text>
        ))}
      </View>
    );
  }

  const items = getRenderableItems(section);
  if (items.length === 0) {
    return <Text style={styles.placeholder}>Add items to this section</Text>;
  }

  const keyedItems = toKeyedItems(
    items,
    (item) => `${item.id}-${item.title || item.position || item.degree || "item"}`,
    `${section.id}-item`
  );

  return keyedItems.map(({ key, item }) => {
    const primaryText = getPrimaryText(section.type, item);
    const secondaryText = getSecondaryText(section.type, item);
    const dateText = getDateText(item);
    const description = item.description || "";

    return (
      <View key={key} style={styles.itemBlock}>
        <View style={styles.itemHeaderRow}>
          <View style={{ flex: 1 }}>
            {isNonEmpty(primaryText) && <Text style={styles.itemPrimary}>{primaryText}</Text>}
            {isNonEmpty(secondaryText) && <Text style={styles.itemSecondary}>{secondaryText}</Text>}
          </View>
          {isNonEmpty(dateText) && <Text style={styles.itemDate}>{dateText}</Text>}
        </View>
        {isNonEmpty(description) && (
          <PDFMarkdown text={description} style={styles.itemDescription} />
        )}
      </View>
    );
  });
};

const ResumePDF: React.FC<ResumePDFProps> = ({ data, template }) => {
  if (template === 'modern') {
    return (
      <PdfDocument>
        <ModernTemplate data={data} />
      </PdfDocument>
    );
  }

  const accentColor = data.theme.color || "#2563eb";
  const visibleSections = data.sections.filter((section) => shouldRenderSection(section));
  const keyedSections = toKeyedItems(
    visibleSections,
    (section) => `${section.id}-${section.title}`,
    "section"
  );

  const contactItems = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.website,
  ].filter((value): value is string => isNonEmpty(value));

  const keyedContacts = toKeyedItems(contactItems, (contact) => contact, "contact");

  return (
    <PdfDocument>
      <Page
        size="A4"
        style={{
          ...styles.page,
          backgroundColor: getTemplateBackground(template),
        }}
      >
        <View style={styles.header}>
          <Text style={{ ...styles.name, color: accentColor }}>
            {data.personalInfo.fullName || "Your Name"}
          </Text>

          {isNonEmpty(data.personalInfo.summary) && (
            <Text style={styles.summary}>{data.personalInfo.summary}</Text>
          )}

          <View style={styles.contactRow}>
            {keyedContacts.map(({ key, item }) => (
              <Text key={key} style={styles.contactItem}>
                {item}
              </Text>
            ))}
          </View>
        </View>

        {keyedSections.map(({ key, item: section }) => (
          <View key={key} style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: accentColor }}>
              {section.title}
            </Text>
            {renderSectionBody(section, accentColor)}
          </View>
        ))}
      </Page>
    </PdfDocument>
  );
};

export const ResumePDFDocument: React.FC<{ data: ResumeData }> = ({ data }) => {
  return <ResumePDF data={data} template={data.theme.template} />;
};

export const exportToPDF = async (
  _data: ResumeData,
  sourceNode?: HTMLElement | null
): Promise<Blob> => {
  if (globalThis.window === undefined) {
    throw new TypeError("PDF export is only available in the browser");
  }

  if (!sourceNode) {
    throw new Error("Export DOM node not provided to html2canvas.");
  }

  // We use html-to-image because it natively wraps the DOM into an SVG <foreignObject>,
  // which guarantees 100% pixel-perfect text baseline metrics, line-heights, and custom font parsing.
  const imgData = await toJpeg(sourceNode, {
    quality: 0.98,
    pixelRatio: 3, // High scale for crisp text
    backgroundColor: '#ffffff',
    style: {
      transform: 'none',
      transformOrigin: 'top left',
      margin: '0'
    }
  });

  // Initialize an A4 portrait PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate the aspect ratio dynamically directly from the image data rather than canvas width/height
  const imgElement = new Image();
  imgElement.src = imgData;
  await new Promise((resolve) => {
    imgElement.onload = resolve;
  });

  const imgWidth = imgElement.width;
  const imgHeight = imgElement.height;
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = pdfWidth / imgWidth;
  const totalPdfHeight = imgHeight * ratio;

  let heightLeft = totalPdfHeight;
  let position = 0;

  // Render the first page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
  heightLeft -= pdfHeight;

  // If the resume is long, slice the remaining image into new pages
  // We use a small epsilon (1mm) to prevent generating a blank page for tiny rounding errors
  while (heightLeft > 1) {
    position = heightLeft - totalPdfHeight; // Move the image up
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;
  }

  return pdf.output('blob');
};

export const downloadPDF = (blob: Blob, filename = "resume.pdf"): void => {
  if (globalThis.window === undefined) {
    return;
  }

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("Generated PDF is empty or invalid");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default ResumePDF;
