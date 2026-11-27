import * as Yup from "yup";

import type { CloudState } from "store/juju/types";

import { AUTH_TYPE_SCHEMAS } from "./Fields/authTypeSchemas";
import { FieldName, type FormFields } from "./Fields/types";
import { getAuthTypeFields } from "./Fields/utils";

/**
 * Build an auth attrs object with every field from every cloud/auth type in the schema
 * initialised to an empty string, so that inputs are always controlled.
 */
export const getEmptyAuthAttrs = (): Record<string, string> =>
  Object.fromEntries(
    Object.values(AUTH_TYPE_SCHEMAS).flatMap(({ authTypes }) =>
      Object.values(authTypes).flatMap((fields) =>
        fields.map(({ name }) => [name, ""]),
      ),
    ),
  );

export const EMPTY_FORM_FIELDS: FormFields = {
  [FieldName.NAME]: "",
  [FieldName.CLOUD]: "",
  [FieldName.REGION]: "",
  [FieldName.AUTH_TYPE]: "",
  [FieldName.AUTH_ATTRS]: getEmptyAuthAttrs(),
};

/**
 * Build validation schema for auth fields based on cloud and auth type.
 * Returns a Yup schema shape that can be spread into a larger schema.
 */
export const getAuthFieldsValidationSchema = (
  cloudType: string,
  authType: string,
): Record<string, Yup.StringSchema> => {
  const fields = getAuthTypeFields(cloudType, authType);

  return fields.reduce<Record<string, Yup.StringSchema>>((acc, field) => {
    let validator: Yup.StringSchema = Yup.string();

    // Add required validation
    if (!field.optional) {
      validator = validator.required("Required");
    }

    // Add format-specific validators
    if (field.format === "email") {
      validator = validator.email("Invalid email format");
    } else if (field.format === "uuid") {
      validator = validator.uuid("Invalid UUID format");
    } else if (field.format === "json") {
      validator = validator.test(
        "valid-json",
        "Must be valid JSON",
        (value) => {
          if (!value) {
            return true;
          }
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        },
      );
    }
    // Note: 'pem' format is not validated here, it's accepted as plain text

    acc[field.name] = validator;
    return acc;
  }, {});
};

/**
 * Build the validation schema for the form. The auth fields depend on the
 * selected cloud and auth type, so the schema is built from the form values.
 */
export const getValidationSchema = (
  clouds: CloudState["clouds"],
): Yup.Lazy<Yup.AnyObject> =>
  Yup.lazy((values: FormFields) => {
    const cloudType = clouds?.[values[FieldName.CLOUD]]?.type;
    return Yup.object({
      [FieldName.NAME]: Yup.string().required("Required"),
      [FieldName.CLOUD]: Yup.string().required("Required"),
      [FieldName.AUTH_TYPE]: Yup.string().required("Required"),
      [FieldName.AUTH_ATTRS]: Yup.object(
        cloudType
          ? getAuthFieldsValidationSchema(
              cloudType,
              values[FieldName.AUTH_TYPE],
            )
          : {},
      ),
    });
  });
