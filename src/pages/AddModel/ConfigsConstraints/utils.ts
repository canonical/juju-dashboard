import { stringify, parseDocument, isMap, isPair, isScalar } from "yaml";

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
  const sections: string[] = [];

  for (const category of categories) {
    const changedFields = getChangedFields(category, values);
    if (changedFields.length === 0) {
      continue;
    }

    const fieldObject: Record<string, ConfigFieldValue> = {};
    for (const field of changedFields) {
      const value = values[field.label];
      // Coerce boolean string values to actual booleans so stringify
      // outputs them as unquoted true/false rather than quoted strings.
      fieldObject[field.label] =
        field.valueType === "boolean"
          ? value === "true" || value === true
          : value;
    }

    // Prepend the category name as a YAML comment, then the stringified fields.
    sections.push(`# ${category.category}\n${stringify(fieldObject)}`);
  }

  return sections.join("\n");
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
  currentValues: Record<string, ConfigFieldValue> = {},
): {
  validValues: Record<string, ConfigFieldValue>;
  errors: YAMLErrors;
} {
  const fieldsByLabel = categories.reduce(
    (acc, { fields }) => {
      for (const field of fields) {
        acc[field.label] = field;
      }
      return acc;
    },
    {} as Record<string, CategoryDefinition["fields"][number]>,
  );

  const validValues: Record<string, ConfigFieldValue> = {};
  const invalidKeys: YAMLValidationError[] = [];
  const invalidValues: YAMLValidationError[] = [];
  const otherErrors: YAMLValidationError[] = [];

  const { errors: docErrors, contents } = parseDocument(yamlString);

  otherErrors.push(
    ...docErrors.map((error) => ({
      line: error.linePos?.[0]?.line,
      message: error.message,
    })),
  );

  if (!isMap(contents)) {
    // An empty document is fine; anything else that isn't a map is malformed.
    if (contents !== null) {
      otherErrors.push({
        line: 1,
        message: "Invalid format. Expected a top-level key-value map",
      });
    }
  } else {
    for (const pair of contents.items) {
      if (!isPair(pair)) {
        otherErrors.push({
          message: "Invalid format. Unexpected non-key-value item in map",
        });
        continue;
      }
      if (!isScalar(pair.key)) {
        otherErrors.push({
          message: "Invalid format. Unexpected non-scalar key",
        });
        continue;
      }

      const key = pair.key.toString();
      const line = pair.key.range
        ? yamlString.slice(0, pair.key.range[0]).split("\n").length
        : 0;

      const field = fieldsByLabel[key];
      if (!field) {
        invalidKeys.push({ line, message: `Unknown key: ${key}` });
        continue;
      }

      if (!isScalar(pair.value)) {
        invalidValues.push({ line, message: `Invalid value for ${key}` });
        continue;
      }

      const { value } = pair.value;

      if (field.valueType === "number") {
        if (typeof value !== "number") {
          invalidValues.push({
            line,
            message: `Invalid type for ${key}. Expected a number`,
          });
          continue;
        }
        validValues[key] = value;
      } else if (field.valueType === "boolean") {
        if (typeof value !== "boolean") {
          invalidValues.push({
            line,
            message: `Invalid type for ${key}. Expected one of: true, false`,
          });
          continue;
        }
        validValues[key] = value;
      } else {
        // Plain string field. For select fields, validate against allowed values.
        const stringValue = value?.toString();
        if (field.input?.type === "select") {
          const allowedValues = (field.input.options ?? []).map(
            ({ value: optionValue }) => optionValue,
          );
          if (!allowedValues.includes(stringValue)) {
            invalidValues.push({
              line,
              message: `Invalid value for ${key}. Expected one of: ${allowedValues.join(", ")}`,
            });
            continue;
          }
        }
        validValues[key] = stringValue;
      }
    }
  }

  // For fields that were previously changed but absent from the YAML, reset
  // them to their catalog default so the caller can apply in a single pass.
  for (const label in fieldsByLabel) {
    const { defaultValue } = fieldsByLabel[label];
    if (
      !(label in validValues) &&
      isConfigChanged(label, currentValues, defaultValue)
    ) {
      validValues[label] = defaultValue;
    }
  }

  return { validValues, errors: { invalidKeys, invalidValues, otherErrors } };
}
