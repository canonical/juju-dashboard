import { CONFIG_CATEGORIES } from "./configCatalog";
import { CONSTRAINT_CATEGORIES } from "./constraintsCatalog";
import type { CategoryDefinition } from "./types";

export const isConfigChanged = (
  label: string,
  values: Record<string, number | string>,
  defaultValue: number | string | undefined,
): boolean => {
  // Casting numeric fields for standardized comparison, as form values are strings.
  const currentValue = values[label]?.toString();

  // If value is undefined, it hasn't been set - not changed
  if (currentValue === undefined) {
    return false;
  }

  // If there's a default value, check if current differs from it
  // This includes catching empty string ("") vs default
  if (defaultValue !== undefined) {
    return currentValue !== defaultValue.toString();
  }

  // No default value: only changed if non-empty
  return currentValue.length > 0;
};

export const getChangedFields = (
  category: CategoryDefinition,
  values: Record<string, string>,
): CategoryDefinition["fields"] =>
  category.fields.filter((field) =>
    isConfigChanged(field.label, values, field.defaultValue),
  );

export const getCategoriesWithVisibleFields = (
  categories: CategoryDefinition[],
  values: Record<string, string>,
): Array<{ category: string; fields: CategoryDefinition["fields"] }> =>
  categories
    .map((cat) => ({
      category: cat.category,
      fields: getChangedFields(cat, values),
    }))
    .filter(({ fields }) => fields.length > 0);

export const buildYAML = (
  categories: CategoryDefinition[],
  values: Record<string, string>,
): string => {
  const yamlSections = categories
    .map((category) => {
      const changedFields = getChangedFields(category, values).map((field) => {
        const value = values[field.label];
        const quotedValue = value === "" ? '""' : value;
        return `${field.label}: ${quotedValue}`;
      });

      if (changedFields.length === 0) {
        return null;
      }

      return [`# ${category.category}`, ...changedFields].join("\n");
    })
    .filter(Boolean);

  return yamlSections.join("\n\n");
};

export const buildConfigsConstraintsPayload = (
  values: Record<string, string>,
): Record<string, string> =>
  [...CONFIG_CATEGORIES, ...CONSTRAINT_CATEGORIES].reduce<
    Record<string, string>
  >((config, category) => {
    getChangedFields(category, values).forEach((field) => {
      config[field.label] = values[field.label];
    });
    return config;
  }, {});

export const getConfigInitialValues = (
  categories: CategoryDefinition[],
): Record<string, string> =>
  categories.reduce<Record<string, string>>((values, category) => {
    category.fields.forEach((field) => {
      values[field.label] = field.defaultValue?.toString() ?? "";
    });
    return values;
  }, {});

export const filterCategoriesBySearch = (
  query: string,
  categoryList: CategoryDefinition[],
): CategoryDefinition[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return categoryList;
  }
  return categoryList
    .map((category) => ({
      ...category,
      fields: category.fields.filter(
        (field) =>
          field.label.toLowerCase().includes(lowerQuery) ||
          field.description.toLowerCase().includes(lowerQuery),
      ),
    }))
    .filter((category) => category.fields.length > 0);
};
