import { Section, SectionItem } from "@/lib/schema";
import { formatDateRange as formatDate } from "@/lib/formatting";

export type KeyedItem<T> = {
  key: string;
  item: T;
};

export const normalizeKeyPart = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return normalized || "item";
};

export const toKeyedItems = <T,>(
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

export const isNonEmpty = (value?: string | null): value is string => {
  return Boolean(value?.trim());
};

export const hasCustomFieldValue = (value: string | string[]): boolean => {
  if (Array.isArray(value)) {
    return value.some((entry) => isNonEmpty(entry));
  }
  return isNonEmpty(value);
};

export const sectionItemHasContent = (item: SectionItem): boolean => {
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

export const getRenderableItems = (section: Section): SectionItem[] => {
  return (section.items || []).filter((item) => sectionItemHasContent(item));
};

export const getPrimaryText = (sectionType: Section["type"], item: SectionItem): string => {
  if (sectionType === "experience") {
    return item.position || item.title || "";
  }
  if (sectionType === "education") {
    return item.degree || item.title || "";
  }
  return item.title || "";
};

export const getSecondaryText = (sectionType: Section["type"], item: SectionItem): string => {
  if (sectionType === "experience") {
    return item.company || item.subtitle || "";
  }
  if (sectionType === "education") {
    return item.institution || item.subtitle || "";
  }
  return item.subtitle || "";
};

export const getDateText = (item: SectionItem): string => {
  return formatDate(item.startDate, item.endDate, item.current);
};

export const getSkillLabels = (section: Section): string[] => {
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

export const shouldRenderSection = (section: Section): boolean => {
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
