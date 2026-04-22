import type { CategoryDefinition } from "./configCatalog";

export const isConfigChanged = (
  label: string,
  values: Record<string, string>,
  defaultValue: string | undefined,
): boolean => {
  const currentValue = values[label];
  if (!currentValue) {
    return false;
  }
  if (defaultValue !== undefined) {
    return currentValue !== defaultValue;
  }
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

export const buildConfigYAML = (
  categories: CategoryDefinition[],
  values: Record<string, string>,
): string => {
  const yamlSections = categories
    .map((category) => {
      const changedFields = getChangedFields(category, true, values).map(
        (field) => `${field.label}: ${values[field.label]}`,
      );

      if (changedFields.length === 0) {
        return null;
      }

      return [`# ${category.category}`, ...changedFields].join("\n");
    })
    .filter(Boolean);

  return yamlSections.join("\n\n");
};
