import type { CategoryDefinition } from "./configCatalog";

export const isConfigChanged = (
  label: string,
  defaultValue: unknown,
  values: Record<string, unknown>,
): boolean => {
  const currentValue = values[label];
  if (currentValue === undefined || currentValue === null) {
    return false;
  }
  if (defaultValue !== undefined) {
    return String(currentValue) !== String(defaultValue);
  }
  return String(currentValue).length > 0;
};

export const getChangedFields = (
  category: CategoryDefinition,
  onlyChanged: boolean,
  values: Record<string, unknown>,
): CategoryDefinition["fields"] =>
  onlyChanged
    ? category.fields.filter((field) =>
        isConfigChanged(field.label, field.input.defaultValue, values),
      )
    : category.fields;

export const buildConfigYAML = (
  categories: CategoryDefinition[],
  values: Record<string, unknown>,
): string => {
  const yamlSections = categories
    .map((category) => {
      const changedFields = getChangedFields(category, true, values).map(
        (field) => `${field.label}: ${String(values[field.label])}`,
      );

      if (changedFields.length === 0) {
        return null;
      }

      return [`# ${category.category}`, ...changedFields].join("\n");
    })
    .filter((section): section is string => Boolean(section));

  return yamlSections.join("\n\n");
};
