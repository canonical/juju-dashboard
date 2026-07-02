import type { SelectProps } from "@canonical/react-components";

import type { InputMode } from "../types";

export enum TestId {
  CONFIGS_CONSTRAINTS_FORM = "configs-constraints-form",
}

export enum Label {
  CONFIGS_TITLE = "Configurations (optional)",
  CONSTRAINTS_TITLE = "Constraints (optional)",
  MODEL_CONFIG_DOCS = "Learn about model configuration",
  MODEL_CONSTRAINT_DOCS = "Learn about model constraints",
  CHANGED_CONFIGS_ONLY = "Changed configs only",
  CHANGED_CONSTRAINTS_ONLY = "Changed constraints only",
  MODEL_CONFIG_PLACEHOLDER = "Set model configurations",
  MODEL_CONSTRAINT_PLACEHOLDER = "Set model constraints",
  DISABLED_COMMANDS = "Disabled commands (optional)",
  DISABLE_COMMANDS_DOCS = "Learn about disabling commands",
  DISABLE_DESTROY_MODEL = "Disable destroy-model commands",
  DISABLE_DESTROY_MODEL_DESC = "Prevents destruction of the model or its controller.",
  DISABLE_REMOVE_OBJECT = "Disable remove-object commands",
  DISABLE_REMOVE_OBJECT_DESC = "Prevents destruction of the model and removal of applications, machines, units, relations, and storage.",
  DISABLE_ALL_COMMANDS = "Disable all commands",
  DISABLE_ALL_COMMANDS_DESC = "Disables every command that can modify a Juju controller, model, or workload.",
  INCORRECT_YAML_CONFIGURATION_ERROR = "One or more invalid configuration values",
  INCORRECT_YAML_CONSTRAINT_ERROR = "One or more invalid constraint values",
  NO_CHANGED_CONFIGS = "No configs were changed from default",
  NO_CHANGED_CONSTRAINTS = "No constraints were changed from default",
}

export enum FieldName {
  CONFIG_INPUT_MODE = "configInputMode",
  CONSTRAINT_INPUT_MODE = "constraintInputMode",
  CONFIG_YAML = "configYAML",
  CONSTRAINT_YAML = "constraintYAML",
  DISABLED_COMMANDS = "disabledCommands",
}

export type FormFields = {
  [FieldName.CONFIG_INPUT_MODE]: InputMode;
  [FieldName.CONSTRAINT_INPUT_MODE]: InputMode;
  [FieldName.CONFIG_YAML]: string;
  [FieldName.CONSTRAINT_YAML]: string;
  [FieldName.DISABLED_COMMANDS]: DisableType;
};

export enum DisableType {
  NONE = "none",
  DESTROY_MODEL = "BlockDestroy",
  REMOVE_OBJECT = "BlockRemove",
  ALL = "BlockChange",
}

export type ConfigFieldValue = boolean | number | string | undefined;

export type CategoryDefinition = {
  category: string;
  fields: {
    label: string;
    description: string;
    defaultValue?: ConfigFieldValue;
    input?: { type: "select" } & SelectProps;
    valueType?: "boolean" | "number";
  }[];
};
