export enum Label {
  CANCEL = "Cancel",
  REQUIRES_MIGRATION = "This upgrade requires a controller migration.",
  SUBMIT = "Upgrade model",
  HEADER_MODEL_NAME = "Model name",
  HEADER_CURRENT_VERSION = "Current version",
  HEADER_UPGRADE_VERSION = "Upgrade version",
}

export enum FieldName {
  TARGET_CONTROLLER = "targetController",
  CONFIRM = "confirm",
}

export type FormFields = {
  [FieldName.TARGET_CONTROLLER]: string;
  [FieldName.CONFIRM]: boolean;
};
