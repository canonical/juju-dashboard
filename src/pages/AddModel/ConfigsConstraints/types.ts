export enum TestId {
  CONFIGS_CONSTRAINTS_FORM = "configs-constraints-form",
}

export enum Label {
  DISABLED_COMMANDS = "Disabled commands (optional)",
  DISABLE_COMMANDS_DOCS = "Learn about disabling commands",
  DISABLE_DESTROY_MODEL = "Disable destroy-model commands",
  DISABLE_DESTROY_MODEL_DESC = "Prevents destruction of the model or its controller.",
  DISABLE_REMOVE_OBJECT = "Disable remove-object commands",
  DISABLE_REMOVE_OBJECT_DESC = "Prevents destruction of the model and removal of applications, machines, units, relations, and storage.",
  DISABLE_ALL_COMMANDS = "Disable all commands",
  DISABLE_ALL_COMMANDS_DESC = "Disables every command that can modify a Juju controller, model, or workload.",
}

export enum DisableType {
  NONE = "none",
  DESTROY_MODEL = "BlockDestroy",
  REMOVE_OBJECT = "BlockRemove",
  ALL = "BlockChange",
}

export type FormFields = {
  disabledCommands: DisableType;
};
