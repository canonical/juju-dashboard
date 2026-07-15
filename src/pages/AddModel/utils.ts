import * as Yup from "yup";

import { extractCloudName } from "store/juju/utils/models";

import { CONFIG_DEFINITIONS } from "./ConfigsConstraints/configCatalog";
import { CONSTRAINT_DEFINITIONS } from "./ConfigsConstraints/constraintsCatalog";
import { ValueType } from "./ConfigsConstraints/types";
import { Label } from "./types";

export const getCredentialError = (cloud: unknown): string => {
  if (typeof cloud === "string") {
    return `No credentials available for ${extractCloudName(cloud)}. Contact admin or choose a different cloud.`;
  }
  return Label.REQUIRED_CREDENTIAL_ERROR;
};

export const getBooleanSchema = (): Record<string, Yup.BooleanSchema> =>
  [...CONFIG_DEFINITIONS, ...CONSTRAINT_DEFINITIONS].reduce<
    Record<string, Yup.BooleanSchema>
  >((schemas, entry) => {
    if (entry.valueType === ValueType.BOOLEAN) {
      schemas[entry.label] = Yup.boolean();
    }
    return schemas;
  }, {});
