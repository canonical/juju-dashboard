export enum Label {
  CLOUD = "Cloud",
  NAME = "Credential name",
  REGION = "Region (optional)",
  CREDENTIAL_DETAILS = "Credential Details",
  CLOUD_DETAILS = "Cloud Details",
}

export type FormFields = {
  name: string;
  cloud: string;
  region: string;
};
