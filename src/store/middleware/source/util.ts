import type { ModelConfigSchemaResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV8";
import type { ModelDefaultsResult } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";

import { BOOLEAN_OPTIONS, FALLBACK_CATEGORY } from "consts";
import type {
  CategoryDefinition,
  ConfigFieldValue,
} from "pages/AddModel/ConfigsConstraints/types";

/**
  AdditionalProperties is a single-key object where the key name is
  arbitrary — the actual value is always the first (and only) entry.
  Applies the priority hierarchy: controller > region (if known) > juju default.
*/
const resolveFieldDefault = (
  defaults: ModelDefaultsResult["config"][string] = {},
  selectedRegion?: string,
): ConfigFieldValue => {
  const { controller, regions, default: jujuDefaults } = defaults;

  if (controller) {
    return Object.values(controller)[0] as ConfigFieldValue;
  }

  if (selectedRegion && regions) {
    const regionDefaults = regions.find(
      (region) => region["region-name"] === selectedRegion,
    )?.value;
    if (regionDefaults) {
      return Object.values(regionDefaults)[0] as ConfigFieldValue;
    }
  }

  return Object.values(jujuDefaults ?? {})[0] as ConfigFieldValue;
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
  const fields: CategoryDefinition["fields"] = Object.entries(schema ?? {}).map(
    ([label, field]) => {
      const isNumeric = field.type === "int" || field.type === "float";
      const fieldValues = field.values ?? [];

      const entry: CategoryDefinition["fields"][number] = {
        label,
        description: field.description ?? "",
        defaultValue: resolveFieldDefault(
          defaultsConfig[label],
          selectedRegion,
        ),
      };

      if (field.type === "bool") {
        entry.valueType = "boolean";
        entry.input = { type: "select", options: BOOLEAN_OPTIONS };
      } else if (isNumeric) {
        entry.valueType = "number";
      } else if (fieldValues.length > 0) {
        entry.input = {
          type: "select",
          options: fieldValues.map((fieldValue) => ({
            label: `${fieldValue}`,
            value: `${fieldValue}`,
          })),
        };
      }

      return entry;
    },
  );

  return [{ category: FALLBACK_CATEGORY, fields }];
};
