import type { CredentialContentResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";

export enum Status {
  IN_USE = "In use",
  NOT_IN_USE = "Not in use",
}

export type CredentialWithContents = {
  credential: string;
  cloud: string;
  name: string;
  contents: CredentialContentResult;
};
