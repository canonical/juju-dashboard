import type { CloudState } from "store/juju/types";

import {
  toCloudOptions,
  toRegionOptions,
  toAuthTypeOptions,
  getAuthTypeFields,
} from "./utils";

const EMPTY_OPTION = { label: "", value: "" };

const clouds: CloudState["clouds"] = {
  "cloud-aws": {
    type: "ec2",
    "auth-types": ["access-key"],
    regions: [{ name: "us-east-1" }, { name: "us-west-2" }],
  },
  "cloud-gce": {
    type: "gce",
    "auth-types": ["oauth2", "jsonfile"],
    regions: [{ name: "us-central1" }],
  },
  // "interactive" is supported by Juju but there are no fields for it.
  "cloud-azure": {
    type: "azure",
    "auth-types": ["interactive", "managed-identity"],
  },
  "cloud-unknown": { type: "unknown", "auth-types": ["some-auth"] },
  "cloud-none": { type: "ec2" },
};

describe("toCloudOptions", () => {
  it("returns an empty option followed by an option for each cloud", () => {
    expect(toCloudOptions(clouds)).toStrictEqual([
      EMPTY_OPTION,
      { value: "cloud-aws", label: "aws" },
      { value: "cloud-gce", label: "gce" },
      { value: "cloud-azure", label: "azure" },
      { value: "cloud-unknown", label: "unknown" },
      { value: "cloud-none", label: "none" },
    ]);
  });

  it.each([{ value: {} }, { value: null }])(
    "returns only the empty option for $value",
    ({ value }) => {
      expect(toCloudOptions(value)).toStrictEqual([EMPTY_OPTION]);
    },
  );
});

describe("toRegionOptions", () => {
  it("returns an empty option followed by an option for each region", () => {
    expect(toRegionOptions(clouds, "cloud-aws")).toStrictEqual([
      EMPTY_OPTION,
      { value: "us-east-1", label: "us-east-1" },
      { value: "us-west-2", label: "us-west-2" },
    ]);
  });

  it.each([
    {
      description: "an unknown cloud",
      cloudTag: "cloud-missing",
      value: clouds,
    },
    { description: "no clouds", cloudTag: "cloud-aws", value: null },
  ])("returns only the empty option for $description", (testCase) => {
    expect(toRegionOptions(testCase.value, testCase.cloudTag)).toStrictEqual([
      EMPTY_OPTION,
    ]);
  });
});

describe("toAuthTypeOptions", () => {
  it("returns the auth types the cloud supports that there is a schema for", () => {
    expect(toAuthTypeOptions(clouds, "cloud-gce")).toStrictEqual([
      { label: "oauth2", value: "oauth2" },
      { label: "jsonfile", value: "jsonfile" },
    ]);
    expect(toAuthTypeOptions(clouds, "cloud-azure")).toStrictEqual([
      { label: "managed-identity", value: "managed-identity" },
    ]);
  });

  it.each([
    {
      description: "a cloud type without a schema",
      value: clouds,
      cloudTag: "cloud-unknown",
    },
    {
      description: "a cloud without auth types",
      value: clouds,
      cloudTag: "cloud-none",
    },
    {
      description: "an unknown cloud",
      value: clouds,
      cloudTag: "cloud-missing",
    },
    { description: "no clouds", value: null, cloudTag: "cloud-aws" },
  ])("returns no options for $description", (testCase) => {
    expect(toAuthTypeOptions(testCase.value, testCase.cloudTag)).toStrictEqual(
      [],
    );
  });
});

describe("getAuthTypeFields", () => {
  it.each([
    {
      description: "an empty cloud type",
      cloudType: "",
      authType: "access-key",
    },
    {
      description: "an undefined cloud type",
      cloudType: undefined,
      authType: "access-key",
    },
    { description: "an empty auth type", cloudType: "ec2", authType: "" },
    {
      description: "an unknown cloud type",
      cloudType: "unknown",
      authType: "some-auth",
    },
    {
      description: "an unknown auth type",
      cloudType: "ec2",
      authType: "unknown-auth",
    },
  ])("returns no fields for $description", ({ cloudType, authType }) => {
    expect(getAuthTypeFields(cloudType, authType)).toStrictEqual([]);
  });

  it("returns the fields for the cloud type and auth type", () => {
    expect(
      getAuthTypeFields("ec2", "access-key").map(({ name }) => name),
    ).toStrictEqual(["access-key", "secret-key"]);
  });
});
