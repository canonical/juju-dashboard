/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */
import { validateYupSchema, yupToFormErrors, type FormikErrors } from "formik";

import type { CloudState } from "store/juju/types";

import { FieldName, type FormFields } from "./Fields/types";
import { getAuthFieldsValidationSchema, getValidationSchema } from "./utils";

describe("getAuthFieldsValidationSchema", () => {
  it.each([
    { cloudType: "", authType: "" },
    { cloudType: "unknown", authType: "some-auth" },
    { cloudType: "ec2", authType: "unknown-auth" },
  ])(
    "returns an empty schema for cloud type '$cloudType' and auth type '$authType'",
    ({ cloudType, authType }) => {
      expect(getAuthFieldsValidationSchema(cloudType, authType)).toStrictEqual(
        {},
      );
    },
  );

  it("builds a schema with a required validator for each field", () => {
    const schema = getAuthFieldsValidationSchema("ec2", "access-key");
    expect(Object.keys(schema)).toStrictEqual(["access-key", "secret-key"]);
    expect(() => schema["access-key"].validateSync("")).toThrow();
    expect(() => schema["access-key"].validateSync(null)).toThrow();
    expect(() => schema["access-key"].validateSync("valid-key")).not.toThrow();
  });

  it("validates the format of email fields", () => {
    const schema = getAuthFieldsValidationSchema("gce", "oauth2");
    expect(() => schema["client-email"].validateSync("not-an-email")).toThrow();
    expect(() =>
      schema["client-email"].validateSync("valid@example.com"),
    ).not.toThrow();
  });

  it("validates the format of UUID fields", () => {
    const schema = getAuthFieldsValidationSchema(
      "azure",
      "service-principal-secret",
    );
    expect(() =>
      schema["subscription-id"].validateSync("not-a-uuid"),
    ).toThrow();
    expect(() =>
      schema["subscription-id"].validateSync(
        "550e8400-e29b-41d4-a716-446655440000",
      ),
    ).not.toThrow();
  });

  it("validates the format of JSON fields", () => {
    const schema = getAuthFieldsValidationSchema("gce", "jsonfile");
    expect(() => schema.file.validateSync("not json")).toThrow();
    expect(() => schema.file.validateSync('{"key": "value"}')).not.toThrow();
  });

  it("accepts PEM fields as plain text without validation", () => {
    const schema = getAuthFieldsValidationSchema("lxd", "certificate");
    expect(() =>
      schema["client-cert"].validateSync("not a real certificate"),
    ).not.toThrow();
  });
});

describe("getValidationSchema", () => {
  const clouds: CloudState["clouds"] = {
    "cloud-aws": { type: "ec2" },
    "cloud-mycloud": { type: "openstack" },
  };
  const validValues: FormFields = {
    [FieldName.NAME]: "my-credential",
    [FieldName.CLOUD]: "cloud-aws",
    [FieldName.REGION]: "",
    [FieldName.AUTH_TYPE]: "access-key",
    [FieldName.AUTH_ATTRS]: { "access-key": "key", "secret-key": "secret" },
  };

  // Validate the same way Formik does and return the errors it would display.
  const validate = async (
    values: FormFields,
  ): Promise<FormikErrors<FormFields>> =>
    validateYupSchema(values, getValidationSchema(clouds)).then(
      () => ({}),
      (error: unknown) => yupToFormErrors(error),
    );

  it("returns no errors for valid values", async () => {
    expect(await validate(validValues)).toStrictEqual({});
  });

  it("requires the name, cloud and auth type", async () => {
    expect(
      await validate({
        ...validValues,
        [FieldName.NAME]: "",
        [FieldName.CLOUD]: "",
        [FieldName.AUTH_TYPE]: "",
      }),
    ).toStrictEqual({
      [FieldName.NAME]: "Required",
      [FieldName.CLOUD]: "Required",
      [FieldName.AUTH_TYPE]: "Required",
    });
  });

  it("returns errors for only the invalid auth fields", async () => {
    expect(
      await validate({
        ...validValues,
        [FieldName.AUTH_ATTRS]: { "access-key": "", "secret-key": "secret" },
      }),
    ).toStrictEqual({
      [FieldName.AUTH_ATTRS]: { "access-key": "Required" },
    });
  });

  it("finds the auth fields using the type of the cloud", async () => {
    expect(
      await validate({
        ...validValues,
        [FieldName.CLOUD]: "cloud-mycloud",
        [FieldName.AUTH_TYPE]: "userpass",
        [FieldName.AUTH_ATTRS]: {},
      }),
    ).toStrictEqual({
      [FieldName.AUTH_ATTRS]: { username: "Required", password: "Required" },
    });
  });
});
