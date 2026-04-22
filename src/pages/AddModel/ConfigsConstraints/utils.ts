import type { CategoryDefinition } from "./configCatalog";

export type YAMLValidationError = {
  line: number;
  message: string;
};

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

export function validateAndParseConfigYAML(
  yaml: string,
  categories: CategoryDefinition[],
): {
  values: Record<string, string>;
  errors: {
    invalidKeys: YAMLValidationError[];
    invalidValues: YAMLValidationError[];
    otherErrors: YAMLValidationError[];
  };
} {
  const fieldsByLabel = new Map(
    categories.flatMap((category) =>
      category.fields.map((field) => [field.label, field] as const),
    ),
  );

  const values: Record<string, string> = {};
  const invalidKeys: YAMLValidationError[] = [];
  const invalidValues: YAMLValidationError[] = [];
  const otherErrors: YAMLValidationError[] = [];

  yaml.split("\n").forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      otherErrors.push({
        line: lineNumber,
        message: "Invalid format. Expected <key>: <value>",
      });
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key) {
      invalidKeys.push({
        line: lineNumber,
        message: "Invalid key. Key cannot be empty",
      });
      return;
    }

    const field = fieldsByLabel.get(key);
    if (!field) {
      invalidKeys.push({
        line: lineNumber,
        message: `Unknown key: ${key}`,
      });
      return;
    }

    if (field.input?.type === "select") {
      const allowedValues = (field.input.options ?? []).map(
        (option) => option.value,
      );
      if (!allowedValues.includes(value)) {
        invalidValues.push({
          line: lineNumber,
          message: `Invalid value for ${key}. Expected one of: ${allowedValues.join(
            ", ",
          )}`,
        });
        return;
      }
    }

    const expectsNumber =
      typeof field.defaultValue === "string" &&
      /^-?\d+(\.\d+)?$/.test(field.defaultValue);
    if (expectsNumber && value && !/^-?\d+(\.\d+)?$/.test(value)) {
      invalidValues.push({
        line: lineNumber,
        message: `Invalid type for ${key}. Expected a number`,
      });
      return;
    }

    values[key] = value;
  });

  return { values, errors: { invalidKeys, invalidValues, otherErrors } };
}

export const parseConfigYAML = (
  yaml: string,
  categories: CategoryDefinition[],
): Record<string, string> => {
  return validateAndParseConfigYAML(yaml, categories).values;
};
