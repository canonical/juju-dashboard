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
  INVALID_SECRET_ERROR = "This is an invalid secret URI.",
  SECRET_PREFIX_ERROR = "A secret URI must begin with the 'secret:' prefix.",
  NONE = "This application doesn't have any configuration parameters",
  RESET_BUTTON = "Reset all values",
  SAVE_BUTTON = "Save and apply",
  GET_CONFIG_ERROR = "Unable to get application config.",
}

export enum TestId {
  PANEL = "config-panel",
}

export enum InlineErrors {
  GET_CONFIG = "get-config",
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
