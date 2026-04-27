import type { CategoryDefinition } from "./configCatalog";

export const isConfigChanged = (
  label: string,
  values: Record<string, string>,
  defaultValue: string | undefined,
): boolean => {
  const currentValue = values[label];

  // If value is undefined, it hasn't been set - not changed
  if (currentValue === undefined) {
    return false;
  }

  // If there's a default value, check if current differs from it
  // This includes catching empty string ("") vs default
  if (defaultValue !== undefined) {
    return currentValue !== defaultValue;
  }

  // No default value: only changed if non-empty
  return currentValue.length > 0;
};

export const getChangedFields = (
  category: CategoryDefinition,
  onlyChanged: boolean,
  values: Record<string, string>,
): CategoryDefinition["fields"] =>
  onlyChanged
    ? category.fields.filter((field) =>
        isConfigChanged(field.label, values, field.defaultValue),
      )
    : category.fields;

export const getCategoriesWithVisibleConfigs = (
  categories: CategoryDefinition[],
  onlyChanged: boolean,
  values: Record<string, string>,
): Array<{ category: string; fields: CategoryDefinition["fields"] }> =>
  categories
    .map((cat) => ({
      category: cat.category,
      fields: getChangedFields(cat, onlyChanged, values),
    }))
    .filter(({ fields }) => fields.length > 0);

export const buildConfigYAML = (
  categories: CategoryDefinition[],
  values: Record<string, string>,
): string => {
  const yamlSections = categories
    .map((category) => {
      const changedFields = getChangedFields(category, true, values).map(
        (field) => {
          const value = values[field.label];
          const quotedValue = value === "" ? '""' : value;
          return `${field.label}: ${quotedValue}`;
        },
      );

      if (changedFields.length === 0) {
        return null;
      }

      return [`# ${category.category}`, ...changedFields].join("\n");
    })
    .filter(Boolean);

  return yamlSections.join("\n\n");
};

export const getConfigInitialValues = (
  categories: CategoryDefinition[],
): Record<string, string> =>
  categories.reduce<Record<string, string>>((values, category) => {
    category.fields.forEach((field) => {
      values[field.label] = field.defaultValue ?? "";
    });
    return values;
  }, {});
