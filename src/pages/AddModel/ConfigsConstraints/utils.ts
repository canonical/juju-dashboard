import cloneDeep from "clone-deep";
import {
  Document as YAMLDocument,
  YAMLMap,
  parseDocument,
  isMap,
  isPair,
  isScalar,
} from "yaml";

import {
  type YAMLErrors,
  YAMLErrorType,
  type YAMLValidationError,
} from "./YAMLErrorsModal/types";
import {
  type CategoryDefinition,
  type ConfigFieldEntry,
  type ConfigFieldValue,
  InputType,
  ValueType,
} from "./types";

export const isConfigChanged = (entry: ConfigFieldEntry): boolean => {
  const { value: currentValue, defaultValue } = entry;

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

export const groupEntriesByCategory = (
  entries: ConfigFieldEntry[],
  changedOnly?: boolean,
): CategoryDefinition[] => {
  const groups: CategoryDefinition[] = [];

  const entriesToGroup = changedOnly
    ? entries.filter(isConfigChanged)
    : entries;
  for (const entry of entriesToGroup) {
    const groupWithCategory = groups.find(
      (group) => group.category === entry.category,
    );
    if (groupWithCategory) {
      groupWithCategory.fields.push(entry);
    } else {
      groups.push({ category: entry.category, fields: [entry] });
    }
  }

  return groups;
};

export const buildYAML = (entries: ConfigFieldEntry[]): string => {
  const doc = new YAMLDocument(new YAMLMap());
  const map = doc.contents as YAMLMap;
  const changedCategories = groupEntriesByCategory(entries, true);

  for (const category of changedCategories) {
    for (const [index, field] of category.fields.entries()) {
      const { value } = field;
      // Coerce boolean string values to actual booleans so stringify
      // outputs them as unquoted true/false rather than quoted strings.
      const coerced =
        field.valueType === ValueType.BOOLEAN
          ? value === "true" || value === true
          : value;
      const pair = doc.createPair(field.label, coerced);
      if (index === 0) {
        // Attach the category name as a comment before the first key in each
        // category. spaceBefore inserts a blank line between categories.
        if (category.category) {
          pair.key.commentBefore = ` ${category.category}`;
        }
        pair.key.spaceBefore = map.items.length > 0;
      }
      map.add(pair);
    }
  }

  if (map.items.length === 0) {
    return "";
  }

  return doc.toString();
};

export const buildConfigsConstraintsPayload = (
  configEntries: ConfigFieldEntry[],
  constraintEntries: ConfigFieldEntry[],
): Record<string, boolean | number | string> => {
  const config: Record<string, boolean | number | string> = {};
  const changedEntries = [...configEntries, ...constraintEntries].filter(
    isConfigChanged,
  );
  for (const { value, label } of changedEntries) {
    if (value !== undefined) {
      config[label] = value;
    }
  }
  return config;
};

export const getConfigInitialValues = (
  definitions: Omit<ConfigFieldEntry, "arrayIndex" | "value">[],
): ConfigFieldEntry[] =>
  definitions.map((definition, index) => ({
    ...definition,
    // Coerce undefined to '' so the <input> is always controlled.
    value: definition.defaultValue ?? "",
    // Stamp an index at mount time so referencing the fields is easier.
    arrayIndex: index,
  }));

export const filterEntriesBySearch = (
  query: string,
  entries: ConfigFieldEntry[],
): ConfigFieldEntry[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return entries;
  }
  return entries.filter(
    (entry) =>
      entry.label.toLowerCase().includes(lowerQuery) ||
      entry.description?.toLowerCase().includes(lowerQuery),
  );
};

export const getYAMLErrorMessage = (
  type: YAMLErrorType,
  options?: {
    key?: string;
    expectedValue?: string;
    context?: string;
  },
): string => {
  switch (type) {
    case YAMLErrorType.OTHERS:
      return `Invalid format. ${options?.context ?? ""}`;
    case YAMLErrorType.UNKNOWN_KEYS:
      return `Unknown key: ${options?.key}`;
    case YAMLErrorType.INVALID_VALUES:
      const message = `Invalid value for ${options?.key}`;
      if (options?.expectedValue) {
        return `${message}. Expected ${options?.expectedValue}`;
      }
      return message;
  }
};

export function validateAndParseYAML(
  yamlString: string,
  entries: ConfigFieldEntry[],
): {
  validValues: ConfigFieldEntry[];
  errors: YAMLErrors;
} {
  // Deep clone so we can safely mutate values without affecting the original data inside Formik.
  const validValues = cloneDeep(entries);
  const touchedLabels = new Set<string>();
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
        message: getYAMLErrorMessage(YAMLErrorType.OTHERS, {
          context: "Expected a top-level key-value map",
        }),
      });
    }
  } else {
    for (const pair of contents.items) {
      if (!isPair(pair)) {
        otherErrors.push({
          message: getYAMLErrorMessage(YAMLErrorType.OTHERS, {
            context: "Unexpected non-key-value item in map",
          }),
        });
        continue;
      }
      if (!isScalar(pair.key)) {
        otherErrors.push({
          message: getYAMLErrorMessage(YAMLErrorType.OTHERS, {
            context: "Unexpected non-scalar key",
          }),
        });
        continue;
      }

      const key = pair.key.toString();
      const line = pair.key.range
        ? yamlString.slice(0, pair.key.range[0]).split("\n").length
        : 0;

      const field = validValues.find((entry) => entry.label === key);
      if (!field) {
        invalidKeys.push({
          line,
          message: getYAMLErrorMessage(YAMLErrorType.UNKNOWN_KEYS, { key }),
        });
        continue;
      }

      if (!isScalar(pair.value)) {
        invalidValues.push({
          line,
          message: getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, { key }),
        });
        continue;
      }

      const { value } = pair.value;

      if (field.valueType === ValueType.NUMBER) {
        if (typeof value !== "number") {
          invalidValues.push({
            line,
            message: getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, {
              key,
              expectedValue: "a number",
            }),
          });
          continue;
        }
      } else if (field.valueType === ValueType.BOOLEAN) {
        if (typeof value !== "boolean") {
          invalidValues.push({
            line,
            message: getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, {
              key,
              expectedValue: "one of: true, false",
            }),
          });
          continue;
        }
      } else {
        // Plain string field. For select fields, validate against allowed values.
        const stringValue = value?.toString();
        if (field.input?.type === InputType.SELECT) {
          const allowedValues = field.input.options.map(
            ({ value: optionValue }) => optionValue,
          );
          if (
            stringValue === undefined ||
            !allowedValues.includes(stringValue)
          ) {
            invalidValues.push({
              line,
              message: getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, {
                key,
                expectedValue: `one of: ${allowedValues.join(", ")}`,
              }),
            });
            continue;
          }
        }
      }

      // Treat null as an empty string so inputs stay controlled.
      field.value = (value ?? "") as ConfigFieldValue;
      touchedLabels.add(key);
    }
  }

  // For fields that were previously changed but absent from the YAML, reset
  // them to their catalog default so the caller can apply in a single pass.
  for (const entry of validValues) {
    if (!touchedLabels.has(entry.label) && isConfigChanged(entry)) {
      entry.value = entry.defaultValue ?? "";
    }
  }

  return { validValues, errors: { invalidKeys, invalidValues, otherErrors } };
}
