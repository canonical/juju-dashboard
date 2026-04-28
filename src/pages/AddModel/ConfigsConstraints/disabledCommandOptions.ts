import { DisableType, Label } from "./types";

type DisabledCommandOptionDefinition = {
  description?: string;
  disabledCommands?: string[];
  label: string;
  value: DisableType;
};

export const DISABLED_COMMAND_OPTIONS: DisabledCommandOptionDefinition[] = [
  {
    value: DisableType.NONE,
    label: "None",
  },
  {
    value: DisableType.DESTROY_MODEL,
    label: Label.DISABLE_DESTROY_MODEL,
    description: Label.DISABLE_DESTROY_MODEL_DESC,
    disabledCommands: ["destroy-controller", "destroy-model"],
  },
  {
    value: DisableType.REMOVE_OBJECT,
    label: Label.DISABLE_REMOVE_OBJECT,
    description: Label.DISABLE_REMOVE_OBJECT_DESC,
    disabledCommands: [
      "destroy-controller",
      "destroy-model",
      "detach-storage",
      "remove-application",
      "remove-machine",
      "remove-relation",
      "remove-saas",
      "remove-storage",
      "remove-unit",
    ],
  },
  {
    value: DisableType.ALL,
    label: Label.DISABLE_ALL_COMMANDS,
    description: Label.DISABLE_ALL_COMMANDS_DESC,
    disabledCommands: [
      "add-machine",
      "integrate",
      "add-unit",
      "add-ssh-key",
      "add-user",
      "attach-resource",
      "attach-storage",
      "change-user-password",
      "config",
      "consume",
      "deploy",
      "destroy-controller",
      "destroy-model",
      "disable-user",
      "enable-ha",
      "enable-user",
      "expose",
      "import-filesystem",
      "import-ssh-key",
      "model-defaults",
      "model-config",
      "reload-spaces",
      "remove-application",
      "remove-machine",
      "remove-relation",
      "remove-ssh-key",
      "remove-unit",
      "remove-user",
      "resolved",
      "retry-provisioning",
      "run",
      "scale-application",
      "set-application-base",
      "set-credential",
      "set-constraints",
      "sync-agents",
      "unexpose",
      "refresh",
      "upgrade-model",
    ],
  },
];
