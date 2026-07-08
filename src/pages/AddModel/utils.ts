import * as Yup from "yup";

import { extractCloudName } from "store/juju/utils/models";

import { CONFIG_CATEGORIES } from "./ConfigsConstraints/configCatalog";
import { CONSTRAINT_CATEGORIES } from "./ConfigsConstraints/constraintsCatalog";
import { ValueType } from "./ConfigsConstraints/types";
import { Label } from "./types";

export const getCredentialError = (cloud: unknown): string => {
  if (typeof cloud === "string") {
    return `No credentials available for ${extractCloudName(cloud)}. Contact admin or choose a different cloud.`;
  }
  return Label.REQUIRED_CREDENTIAL_ERROR;
};

export const getBooleanSchema = (): Record<string, Yup.BooleanSchema> =>
  [...CONFIG_CATEGORIES, ...CONSTRAINT_CATEGORIES].reduce<
    Record<string, Yup.BooleanSchema>
  >((schemas, category) => {
    for (const field of category.fields) {
      if (field.valueType === ValueType.BOOLEAN) {
        schemas[field.label] = Yup.boolean();
      }
    }
    return schemas;
  }, {});
