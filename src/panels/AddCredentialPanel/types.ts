export enum TestId {
  PANEL = "add-credential-panel",
}

export enum Label {
  CANCEL = "Cancel",
  CLOUD = "Cloud",
  NAME = "Credential name",
  REGION = "Region (optional)",
  SUBMIT = "Add credential",
  TITLE = "Add credential",
}

export type FormFields = {
  name: string;
  cloud: string;
  region: string;
};
