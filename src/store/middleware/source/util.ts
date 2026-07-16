import type { ModelConfigSchemaResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV8";
import type {
  ModelDefaults,
  ModelDefaultsResult,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";

import { BOOLEAN_OPTIONS } from "consts";

import {
  type ConfigFieldEntry,
  type ConfigFieldValue,
  InputType,
  ValueType,
} from "./types";

/**
  AdditionalProperties is a single-key object where the key name is
  arbitrary — the actual value is always the first (and only) entry.
  Applies the priority hierarchy: controller > region (if known) > juju default.
*/
const resolveFieldDefault = (
  // `ModelDefaultsResult["config"]` is a `Record<string, ModelDefaults>`, so
  // a lookup by key is typed as `ModelDefaults` but may be `undefined` at runtime.
  defaults?: ModelDefaults,
  selectedRegion?: string,
): ConfigFieldValue => {
  if (!defaults) {
    return undefined;
  }

  const { controller, regions, default: jujuDefaults } = defaults;
  let fieldDefault = jujuDefaults;

  if (controller !== undefined) {
    fieldDefault = controller;
  }

  if (selectedRegion && regions) {
    const regionDefault = regions.find(
      (region) => region["region-name"] === selectedRegion,
    )?.value;
    if (regionDefault !== undefined) {
      fieldDefault = regionDefault;
    }
  }

  return fieldDefault as ConfigFieldValue;
};

/**
  Converts modelConfigSchema and modelDefaultsForClouds API responses into a
  ConfigFieldEntry array.
*/
export const generateFieldEntries = (
  schema: ModelConfigSchemaResult["schema"],
  defaultsConfig: ModelDefaultsResult["config"],
  selectedRegion?: string,
): ConfigFieldEntry[] => {
  return Object.entries(schema ?? {}).reduce<ConfigFieldEntry[]>(
    (acc, [label, field]) => {
      // Skip fields that are not user-editable or are handled elsewhere in the UI.
      if (["name", "type", "uuid"].includes(label)) {
        return acc;
      }

      const isNumeric = field.type === "int" || field.type === "float";

      // The response schema types `values` as `object[]`, but the underlying
      // Go type is `[]any` which serializes enum values as primitives on
      // the wire. We validate each entry matches the declared field type
      // to guard against unexpected API responses.
      const fieldValues = (field.values ?? []).filter(
        (fieldValue) => typeof fieldValue === field.type,
      );

      const defaultValue = resolveFieldDefault(
        defaultsConfig[label],
        selectedRegion,
      );

      const entry: ConfigFieldEntry = {
        label,
        description: field.description,
        defaultValue,
        category: null,
        value: defaultValue ?? "",
        arrayIndex: acc.length,
      };

      if (field.type === "bool") {
        entry.valueType = ValueType.BOOLEAN;
        entry.input = { type: InputType.SELECT, options: BOOLEAN_OPTIONS };
      } else if (isNumeric) {
        entry.valueType = ValueType.NUMBER;
      } else if (fieldValues.length > 0) {
        entry.input = {
          type: InputType.SELECT,
          options: fieldValues.map((fieldValue) => ({
            label: `${fieldValue}`,
            value: `${fieldValue}`,
          })),
        };
      }

      acc.push(entry);
      return acc;
    },
    [],
  );
};
