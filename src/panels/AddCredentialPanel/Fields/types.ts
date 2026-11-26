export enum Label {
  CLOUD = "Cloud",
  NAME = "Credential name",
  REGION = "Region (optional)",
  AUTH_TYPE = "Auth type",
  CREDENTIAL_DETAILS = "Credential Details",
  CLOUD_DETAILS = "Cloud Details",
  AUTH_DETAILS = "Authentication Details",
}

export const EMPTY_AUTH_TYPE = "empty";

export enum FieldName {
  NAME = "name",
  CLOUD = "cloud",
  REGION = "region",
  AUTH_TYPE = "authType",
  AUTH_ATTRS = "authAttrs",
}

export type FormFields = {
  [FieldName.NAME]: string;
  [FieldName.CLOUD]: string;
  [FieldName.REGION]: string;
  [FieldName.AUTH_TYPE]: string;
  [FieldName.AUTH_ATTRS]: Record<string, string>;
};

export type SelectOption = {
  label: string;
  value: string;
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
