export enum Label {
  CANCEL = "Cancel",
  SUBMIT = "Upgrade model",
}

export enum FieldName {
  TARGET_CONTROLLER = "targetController",
  CONFIRM = "confirm",
}

export type FormFields = {
  [FieldName.TARGET_CONTROLLER]: string;
  [FieldName.CONFIRM]: boolean;
};
