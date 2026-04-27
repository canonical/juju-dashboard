import type { InputMode } from "./ContentSwitcher/types";

export enum TestId {
  CONFIGS_CONSTRAINTS_FORM = "configs-constraints-form",
}

export enum Label {
  MODEL_CONFIG_DOCS = "Learn about model configuration",
  CHANGED_CONFIGS_ONLY = "Changed configs only",
  MODEL_CONFIG_PLACEHOLDER = "Set model configurations",
  DISABLED_COMMANDS = "Disabled commands (optional)",
  DISABLE_COMMANDS_DOCS = "Learn about disabling commands",
  DISABLE_DESTROY_MODEL = "Disable destroy-model commands",
  DISABLE_DESTROY_MODEL_DESC = "Prevents destruction of the model or its controller.",
  DISABLE_REMOVE_OBJECT = "Disable remove-object commands",
  DISABLE_REMOVE_OBJECT_DESC = "Prevents destruction of the model and removal of applications, machines, units, relations, and storage.",
  DISABLE_ALL_COMMANDS = "Disable all commands",
  DISABLE_ALL_COMMANDS_DESC = "Disables every command that can modify a Juju controller, model, or workload.",
  NO_CHANGED_CONFIGS = "No configs were changed from default",
}

export enum FieldName {
  CONFIG_INPUT_MODE = "configInputMode",
  CONFIG_YAML = "configYAML",
  DISABLED_COMMANDS = "disabledCommands",
}

export type FormFields = {
  [FieldName.CONFIG_INPUT_MODE]: InputMode;
  [FieldName.CONFIG_YAML]: string;
  [FieldName.DISABLED_COMMANDS]: DisableType;
};

export enum DisableType {
  NONE = "none",
  DESTROY_MODEL = "BlockDestroy",
  REMOVE_OBJECT = "BlockRemove",
  ALL = "BlockChange",
}
