import { parseDocument, isMap, isPair, isScalar } from "yaml";

import type { YAMLErrors, YAMLValidationError } from "./YAMLErrorsModal/types";
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
  yamlString: string,
  categories: CategoryDefinition[],
  currentValues: Record<string, string> = {},
): {
  validValues: Record<string, string>;
  errors: YAMLErrors;
} {
  const fieldsByLabel = categories.reduce(
    (acc, { fields }) => {
      fields.forEach((field) => {
        acc[field.label] = field;
      });
      return acc;
    },
    {} as Record<string, CategoryDefinition["fields"][number]>,
  );

  const validValues: Record<string, string> = {};
  const invalidKeys: YAMLValidationError[] = [];
  const invalidValues: YAMLValidationError[] = [];

  const { errors: docErrors, contents } = parseDocument(yamlString);

  // Walk the top-level key-value pairs and validate each against the catalog.
  if (isMap(contents)) {
    for (const pair of contents.items) {
      if (!isPair(pair) || !isScalar(pair.key)) {
        continue;
      }

      const key = String(pair.key.value);
      const line = pair.key.range
        ? yamlString.slice(0, pair.key.range[0]).split("\n").length
        : 0;

      const field = fieldsByLabel[key];
      if (!field) {
        invalidKeys.push({ line, message: `Unknown key: ${key}` });
        continue;
      }

      // Coerce parsed value to string as the library already handled booleans,
      // nulls, numbers, quoted strings etc. correctly.
      const rawValue = isScalar(pair.value) ? pair.value.value : null;
      const value =
        rawValue === null || rawValue === undefined ? "" : rawValue.toString();

      // If the field has a predefined set of allowed values, check if valid.
      if (field.input?.type === "select") {
        const allowedValues = (field.input.options ?? []).map(
          ({ value: optionValue }) => optionValue,
        );
        if (!allowedValues.includes(value)) {
          invalidValues.push({
            line,
            message: `Invalid value for ${key}. Expected one of: ${allowedValues.join(", ")}`,
          });
          continue;
        }
      }

      // If the field is numeric, validate the value.
      if (field.isNumeric && value && isNaN(Number(value))) {
        invalidValues.push({
          line,
          message: `Invalid type for ${key}. Expected a number`,
        });
        continue;
      }

      validValues[key] = value;
    }
  }

  // For fields that were previously changed but absent from YAML, include
  // their catalog default so callers can reset them in a single pass.
  for (const label in fieldsByLabel) {
    const { defaultValue } = fieldsByLabel[label];
    if (
      !(label in validValues) &&
      isConfigChanged(label, currentValues, defaultValue)
    ) {
      validValues[label] = defaultValue?.toString() ?? "";
    }
  }

  return {
    validValues,
    errors: {
      invalidKeys,
      invalidValues,
      otherErrors: docErrors.map((error) => ({
        line: error.linePos?.[0]?.line,
        message: error.message,
      })),
    },
  };
}
