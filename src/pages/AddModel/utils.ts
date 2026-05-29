import { extractCloudName } from "store/juju/utils/models";

import { Label } from "./types";

export const getCredentialError = (cloud: unknown): string => {
  if (typeof cloud === "string") {
    return `No credentials available for ${extractCloudName(cloud)}. Contact admin or choose a different cloud.`;
  }
  return Label.REQUIRED_CREDENTIAL_ERROR;
};
