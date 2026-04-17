"use client";

import React from "react";
import {
  Document as PdfDocument,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData, Section, SectionItem, TemplateType } from "@/lib/schema";
import { formatDateRange as formatDate } from "@/lib/formatting";
import { getTemplateBackground } from "@/lib/templates";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

const normalizeKeyPart = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return normalized || "item";
};

const toKeyedItems = <T,>(
  items: T[],
  getSeed: (item: T) => string,
  prefix: string
): KeyedItem<T>[] => {
  const counters = new Map<string, number>();

  return items.map((item) => {
    const seed = normalizeKeyPart(getSeed(item));
    const occurrence = (counters.get(seed) ?? 0) + 1;
    counters.set(seed, occurrence);
    return {
      key: `${prefix}-${seed}-${occurrence}`,
      item,
    };
  });
};

const isNonEmpty = (value?: string | null): value is string => {
  return Boolean(value?.trim());
};

const hasCustomFieldValue = (value: string | string[]): boolean => {
  if (Array.isArray(value)) {
    return value.some((entry) => isNonEmpty(entry));
  }
  return isNonEmpty(value);
};

const sectionItemHasContent = (item: SectionItem): boolean => {
  const hasTitle =
    isNonEmpty(item.title) ||
    isNonEmpty(item.position) ||
    isNonEmpty(item.degree);
  const hasSubtitle =
    isNonEmpty(item.subtitle) ||
    isNonEmpty(item.company) ||
    isNonEmpty(item.institution);
  const hasDescription = isNonEmpty(item.description);
  const hasSkills = item.skills?.some((skill) => isNonEmpty(skill)) ?? false;
  const hasSkillsWithLevels =
    item.skillsWithLevels?.some((skill) => isNonEmpty(skill.name)) ?? false;
  const hasCustomFields =
    item.customFields?.some((field) => hasCustomFieldValue(field.value)) ?? false;

  return (
    hasTitle ||
    hasSubtitle ||
    hasDescription ||
    hasSkills ||
    hasSkillsWithLevels ||
    hasCustomFields
  );
};

const getRenderableItems = (section: Section): SectionItem[] => {
  return (section.items || []).filter((item) => sectionItemHasContent(item));
};

const getPrimaryText = (sectionType: Section["type"], item: SectionItem): string => {
  if (sectionType === "experience") {
    return item.position || item.title || "";
  }
  if (sectionType === "education") {
    return item.degree || item.title || "";
  }
  return item.title || "";
};

const getSecondaryText = (sectionType: Section["type"], item: SectionItem): string => {
  if (sectionType === "experience") {
    return item.company || item.subtitle || "";
  }
  if (sectionType === "education") {
    return item.institution || item.subtitle || "";
  }
  return item.subtitle || "";
};

const getDateText = (item: SectionItem): string => {
  return formatDate(item.startDate, item.endDate, item.current);
};

const getSkillLabels = (section: Section): string[] => {
  const firstItem = section.items[0];
  if (!firstItem) {
    return [];
  }

  const levelSkills = (firstItem.skillsWithLevels || [])
    .filter((skill) => isNonEmpty(skill.name))
    .map((skill) => `${skill.name} (${skill.level})`);

  const plainSkills = (firstItem.skills || []).filter((skill) => isNonEmpty(skill));

  return [...levelSkills, ...plainSkills];
};

const shouldRenderSection = (section: Section): boolean => {
  if (!section.isVisible) {
    return false;
  }

  if (section.type === "skills") {
    return true;
  }

  const renderableItems = getRenderableItems(section);
  const isCoreSection =
    section.type === "experience" || section.type === "education";

  if (isCoreSection) {
    return true;
  }

  return renderableItems.length > 0;
};

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
          <Text style={styles.itemDescription}>{description}</Text>
        )}
      </View>
    );
  });
};

const ResumePDF: React.FC<ResumePDFProps> = ({ data, template }) => {
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

const waitForFonts = async (): Promise<void> => {
  const fontSet = (globalThis.document as { fonts?: FontFaceSet }).fonts;
  if (fontSet?.ready) {
    await fontSet.ready;
  }
};

const waitForPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

export const exportToPDF = async (
  _data: ResumeData,
  sourceNode?: HTMLElement | null
): Promise<Blob> => {
  if (globalThis.window === undefined) {
    throw new TypeError("PDF export is only available in the browser");
  }

  const sourceElement = sourceNode ?? document.getElementById("resume-pdf-export-container");

  if (!(sourceElement instanceof HTMLElement)) {
    throw new TypeError("Could not find resume container for export");
  }

  const computedStyle = globalThis.getComputedStyle(sourceElement);
  if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
    throw new TypeError("Resume container is not visible for export");
  }

  console.info("[PDF Export] Capture node", sourceElement);
  const rect = sourceElement.getBoundingClientRect();
  console.info("[PDF Export] Capture bounds", {
    width: rect.width,
    height: rect.height,
    childCount: sourceElement.childElementCount,
  });

  await waitForPaint();
  await waitForFonts();
  await waitForPaint();

  const canvas = await html2canvas(sourceElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  if (!canvas.width || !canvas.height) {
    throw new Error("Export canvas has invalid dimensions");
  }

  const imageData = canvas.toDataURL("image/png");
  const pdfDocument = new jsPDF("p", "px", [canvas.width, canvas.height]);
  pdfDocument.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
  return pdfDocument.output("blob");
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
