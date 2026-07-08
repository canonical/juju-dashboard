import type { ModelConfigSchemaResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV8";
import type {
  ModelDefaults,
  ModelDefaultsResult,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";

import { BOOLEAN_OPTIONS } from "consts";
import type {
  CategoryDefinition,
  CategoryDefinitionField,
  ConfigFieldValue,
} from "pages/AddModel/ConfigsConstraints/types";
import { InputType, ValueType } from "pages/AddModel/ConfigsConstraints/types";

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

  if (controller) {
    return Object.values(controller)[0];
  }

  if (selectedRegion && regions) {
    const regionDefaults = regions.find(
      (region) => region["region-name"] === selectedRegion,
    )?.value;
    if (regionDefaults) {
      return Object.values(regionDefaults)[0];
    }
  }

  return Object.values(jujuDefaults ?? {})[0];
};

/**
  Converts modelConfigSchema and modelDefaultsForClouds API responses into a
  CategoryDefinition array.
*/
export const generateCategoryDefinitions = (
  schema: ModelConfigSchemaResult["schema"],
  defaultsConfig: ModelDefaultsResult["config"],
  selectedRegion?: string,
): CategoryDefinition[] => {
  const fields: CategoryDefinitionField[] = Object.entries(schema ?? {}).map(
    ([label, field]) => {
      const isNumeric = field.type === "int" || field.type === "float";

      // The response schema types `values` as `object[]`, but the underlying
      //  Go type is `[]any` which serializes enum values as primitives on
      //  the wire. We validate each entry matches the declared field type
      //  to guard against unexpected API responses.
      const fieldValues = (field.values ?? []).filter(
        (fieldValue) => typeof fieldValue === field.type,
      );

      const entry: CategoryDefinitionField = {
        label,
        description: field.description,
        defaultValue: resolveFieldDefault(
          defaultsConfig[label],
          selectedRegion,
        ),
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

      return entry;
    },
  );

  return [{ category: null, fields }];
};
