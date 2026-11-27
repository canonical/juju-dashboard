import type { CloudState } from "store/juju/types";
import { extractCloudName } from "store/juju/utils/models";

import { AUTH_TYPE_SCHEMAS } from "./authTypeSchemas";
import type { AuthTypeField, SelectOption } from "./types";

const EMPTY_OPTION: SelectOption = {
  label: "",
  value: "",
};

export const toCloudOptions = (
  clouds: CloudState["clouds"],
): SelectOption[] => [
  EMPTY_OPTION,
  ...Object.keys(clouds ?? {}).map((cloudTag) => ({
    value: cloudTag,
    label: extractCloudName(cloudTag),
  })),
];

export const toRegionOptions = (
  clouds: CloudState["clouds"],
  cloudTag: string,
): SelectOption[] => [
  EMPTY_OPTION,
  ...(clouds?.[cloudTag]?.regions ?? []).map(({ name }) => ({
    value: name,
    label: name,
  })),
];

/**
 * The auth types the cloud supports, limited to those there is a field schema for.
 */
export const toAuthTypeOptions = (
  clouds: CloudState["clouds"],
  cloudTag: string,
): SelectOption[] => {
  const cloud = clouds?.[cloudTag];
  // The cloud type (e.g. "ec2" for an AWS cloud) is what the auth type schemas are keyed on.
  const schema = cloud && AUTH_TYPE_SCHEMAS[cloud.type];
  return (cloud?.["auth-types"] ?? [])
    .filter((authType) => schema && authType in schema.authTypes)
    .map((authType) => ({
      label: authType,
      value: authType,
    }));
};

export const getAuthTypeFields = (
  cloudType: string,
  authType: string,
): AuthTypeField[] => {
  if (!cloudType || !authType) {
    return [];
  }
  return AUTH_TYPE_SCHEMAS[cloudType]?.authTypes[authType] ?? [];
};
