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

export type AuthTypeField = {
  name: string;
  label: string;
  inputType: "file" | "password" | "text" | "textarea";
  optional: boolean;
  sensitive?: boolean;
  format?: "email" | "json" | "pem" | "uuid";
};

export type AuthTypeSchema = {
  displayName: string;
  authTypes: Record<string, AuthTypeField[]>;
};
