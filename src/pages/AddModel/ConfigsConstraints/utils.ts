import { CONFIG_CATEGORIES } from "./configCatalog";
import { CONSTRAINT_CATEGORIES } from "./constraintsCatalog";
import type { CategoryDefinition, ConfigFieldValue } from "./types";

export const isConfigChanged = (
  label: string,
  values: Record<string, ConfigFieldValue>,
  defaultValue?: ConfigFieldValue,
): boolean => {
  const currentValue = values[label];

  // If value is undefined, it hasn't been set - not changed
  if (currentValue === undefined) {
    return false;
  }

  // If there's a default value, check if current differs from it.
  if (defaultValue !== undefined) {
    return currentValue.toString() !== defaultValue.toString();
  }

  // No default value: only changed if non-empty
  return currentValue !== "";
};

export const getChangedFields = (
  category: CategoryDefinition,
  values: Record<string, ConfigFieldValue>,
): CategoryDefinition["fields"] =>
  category.fields.filter((field) =>
    isConfigChanged(field.label, values, field.defaultValue),
  );

export const getCategoriesWithVisibleFields = (
  categories: CategoryDefinition[],
  values: Record<string, ConfigFieldValue>,
): Array<{ category: string; fields: CategoryDefinition["fields"] }> =>
  categories
    .map((cat) => ({
      category: cat.category,
      fields: getChangedFields(cat, values),
    }))
    .filter(({ fields }) => fields.length > 0);

export const buildYAML = (
  categories: CategoryDefinition[],
  values: Record<string, ConfigFieldValue>,
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
  values: Record<string, ConfigFieldValue>,
): Record<string, boolean | number | string> =>
  [...CONFIG_CATEGORIES, ...CONSTRAINT_CATEGORIES].reduce<
    Record<string, boolean | number | string>
  >((config, category) => {
    getChangedFields(category, values).forEach((field) => {
      const value = values[field.label];
      if (value !== undefined) {
        // Cast boolean string values to actual booleans for the API payload.
        if (field.valueType === "boolean") {
          config[field.label] = value === "true" || value === true;
        } else {
          config[field.label] = value;
        }
      }
    });
    return config;
  }, {});

export const getConfigInitialValues = (
  categories: CategoryDefinition[],
): Record<string, ConfigFieldValue> =>
  categories.reduce<Record<string, ConfigFieldValue>>((values, category) => {
    category.fields.forEach((field) => {
      // Coerce undefined to '' so the <input> is always controlled.
      values[field.label] = field.defaultValue ?? "";
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
