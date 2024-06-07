import type { ConfirmTypes as DefaultConfirmTypes } from "panels/types";

export type ConfigValue = string | number | boolean | undefined;

export type ConfigOption<V, T> = {
  default?: V;
  description: string;
  error?: string | null;
  name: string;
  newValue?: V;
  source: "default" | "user";
  type: T;
  value?: V;
};

export type ConfigData =
  | ConfigOption<string, "string" | "secret">
  | ConfigOption<number, "int" | "float">
  | ConfigOption<boolean, "boolean">;

export type Config = {
  [key: string]: ConfigData;
};

export enum Label {
  CANCEL_BUTTON = "Cancel",
  CANCEL_CONFIRM = "Are you sure you wish to cancel?",
  CANCEL_CONFIRM_CANCEL_BUTTON = "Continue editing",
  CANCEL_CONFIRM_CONFIRM_BUTTON = "Yes, I'm sure",
  GRANT_CANCEL_BUTTON = "No",
  GRANT_CONFIRM = "Grant secrets?",
  GRANT_CONFIRM_BUTTON = "Yes",
  GRANT_ERROR = "Unable to grant application access to secrets.",
  INVALID_SECRET_ERROR = "This is an invalid secret URI.",
  SECRET_PREFIX_ERROR = "A secret URI must begin with the 'secret:' prefix.",
  NONE = "This application doesn't have any configuration parameters",
  RESET_BUTTON = "Reset all values",
  SAVE_BUTTON = "Save and apply",
  SAVE_CONFIRM = "Are you sure you wish to apply these changes?",
  SAVE_CONFIRM_CANCEL_BUTTON = "Cancel",
  SAVE_CONFIRM_CONFIRM_BUTTON = "Yes, apply changes",
  GET_CONFIG_ERROR = "Unable to get application config.",
  SUBMIT_TO_JUJU_ERROR = "Unable to submit config changes to Juju.",
}

export enum TestId {
  PANEL = "config-panel",
}

export enum InlineErrors {
  FORM = "form",
  GET_CONFIG = "get-config",
  SUBMIT_TO_JUJU = "submit-to-juju",
}

export enum ConfigConfirmType {
  GRANT = "grant",
}

export type ConfirmTypes = DefaultConfirmTypes | ConfigConfirmType;

export type ConfigQueryParams = {
  panel: string | null;
  charm: string | null;
  entity: string | null;
  modelUUID: string | null;
};
