import type { InputMode } from "./ContentSwitcher/types";

export enum TestId {
  CONFIGS_CONSTRAINTS_FORM = "configs-constraints-form",
}

export enum Label {
  MODEL_CONFIG_DOCS = "Learn about model configuration",
  CHANGED_CONFIGS_ONLY = "Changed configs only",
  MODEL_CONFIG_PLACEHOLDER = "Set model configurations",
}

export enum FieldName {
  CONFIG_INPUT_MODE = "configInputMode",
  CONFIG_YAML = "configYAML",
}

export type FormFields = {
  [FieldName.CONFIG_INPUT_MODE]: InputMode;
  [FieldName.CONFIG_YAML]: string;
};
