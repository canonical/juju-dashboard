import type { YAMLErrors } from "./YAMLErrorsModal/types";
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
        // Quote empty string values to ensure they are represented correctly in YAML
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
        config[field.label] = value;
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

export function validateAndParseYAML(
  yaml: string,
  categories: CategoryDefinition[],
  currentValues: Record<string, string> = {},
): {
  validValues: Record<string, string>;
  errors: YAMLErrors;
} {
  const fieldsByLabel = new Map(
    categories.flatMap((category) =>
      category.fields.map((field) => [field.label, field] as const),
    ),
  );

  const validValues: Record<string, string> = {};
  const errors: YAMLErrors = {
    invalidKeys: [],
    invalidValues: [],
    otherErrors: [],
  };

  yaml.split("\n").forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Ignore empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      errors.otherErrors.push({
        line: lineNumber,
        message: "Invalid format. Expected <key>: <value>",
      });
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const yamlValue = trimmedLine.slice(separatorIndex + 1).trim();
    // Handle quoted empty string values correctly. This is done for double quotes only as buildYAML always emits "".
    const normalizedValue = yamlValue === '""' ? "" : yamlValue;

    if (!key) {
      errors.invalidKeys.push({
        line: lineNumber,
        message: "Invalid key. Key cannot be empty",
      });
      return;
    }

    // Validate the value against the field definitions
    const field = fieldsByLabel.get(key);
    if (!field) {
      errors.invalidKeys.push({
        line: lineNumber,
        message: `Unknown key: ${key}`,
      });
      return;
    }

    // If the field has a predefined set of allowed values, check if the value is valid
    if (field.input?.type === "select") {
      const allowedValues = (field.input.options ?? []).map(
        ({ value }) => value,
      );
      if (!allowedValues.includes(normalizedValue)) {
        errors.invalidValues.push({
          line: lineNumber,
          message: `Invalid value for ${key}. Expected one of: ${allowedValues.join(", ")}`,
        });
        return;
      }
    }

    // If the field is numeric, validate the value
    if (
      field.isNumeric &&
      normalizedValue &&
      !/^-?\d+(\.\d+)?$/.test(normalizedValue)
    ) {
      errors.invalidValues.push({
        line: lineNumber,
        message: `Invalid type for ${key}. Expected a number`,
      });
      return;
    }

    validValues[key] = normalizedValue;
  });

  // For fields that were previously changed but absent from YAML, include
  // their catalog default so callers can reset them in a single pass.
  fieldsByLabel.forEach((field) => {
    if (
      !(field.label in validValues) &&
      isConfigChanged(field.label, currentValues, field.defaultValue)
    ) {
      validValues[field.label] = field.defaultValue?.toString() ?? "";
    }
  });

  return { validValues, errors };
}
