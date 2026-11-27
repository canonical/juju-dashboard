import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";
import { useMemo } from "react";

import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import { EMPTY_FORM_FIELDS } from "../utils";

import AuthField from "./AuthField";
import { Label, FieldName, type FormFields, EMPTY_AUTH_TYPE } from "./types";
import {
  toCloudOptions,
  toRegionOptions,
  toAuthTypeOptions,
  getAuthTypeFields,
} from "./utils";

const Fields = (): JSX.Element => {
  const { values, touched, setValues, setTouched } =
    useFormikContext<FormFields>();
  const { clouds } = useAppSelector(getCloudInfoState);
  const cloudType = clouds?.[values.cloud]?.type;

  const cloudOptions = useMemo(() => toCloudOptions(clouds), [clouds]);
  const regionOptions = useMemo(
    () => toRegionOptions(clouds, values.cloud),
    [clouds, values.cloud],
  );

  const authFields = cloudType
    ? getAuthTypeFields(cloudType, values.authType)
    : [];

  return (
    <>
      <fieldset className="u-no-padding u-no-margin--bottom add-credential-panel__fieldset">
        <p className="p-text--small-caps">{Label.CREDENTIAL_DETAILS}</p>
        <FormikField
          label={Label.NAME}
          name={FieldName.NAME}
          required
          type="text"
        />
      </fieldset>
      <fieldset className="u-no-padding u-no-margin--bottom add-credential-panel__fieldset--bordered">
        <p className="p-text--small-caps">{Label.CLOUD_DETAILS}</p>
        <FormikField
          component={Select}
          label={Label.CLOUD}
          name={FieldName.CLOUD}
          onChange={(event) => {
            const selectedCloud = event.target.value;
            const [firstAuthTypeOption] = toAuthTypeOptions(
              clouds,
              selectedCloud,
            );
            // The regions and auth types depend on the cloud, so the previous
            // values are no longer valid. Everything is set in one update so that validation runs
            // against the complete new values.
            void setValues({
              ...values,
              [FieldName.CLOUD]: selectedCloud,
              [FieldName.REGION]: "",
              [FieldName.AUTH_TYPE]: firstAuthTypeOption?.value ?? "",
              [FieldName.AUTH_ATTRS]: EMPTY_FORM_FIELDS[FieldName.AUTH_ATTRS],
            });
            // The auth fields are new, so they shouldn't display errors until they're touched.
            // Validation is skipped as setValues has already validated the new values.
            void setTouched({ ...touched, [FieldName.AUTH_ATTRS]: {} }, false);
          }}
          options={cloudOptions}
          required
        />
        <FormikField
          component={Select}
          disabled={!values.cloud}
          label={Label.REGION}
          name={FieldName.REGION}
          options={regionOptions}
        />
      </fieldset>
      {/* Manual/unmanaged clouds only take a credential name, so there is nothing to choose. */}
      {values.authType !== EMPTY_AUTH_TYPE && (
        <fieldset className="u-no-padding u-no-margin--bottom add-credential-panel__fieldset--bordered">
          <p className="p-text--small-caps">{Label.AUTH_DETAILS}</p>
          <FormikField
            component={Select}
            disabled={!values.cloud}
            label={Label.AUTH_TYPE}
            name={FieldName.AUTH_TYPE}
            onChange={(event) => {
              // Clear all auth attrs when auth type changes. This relies on the auth attr keys being
              // fixed (they come from the static schema). If the schema ever becomes dynamic, e.g.
              // fetched from the controller, the cleared values will need to be computed instead.
              void setValues({
                ...values,
                [FieldName.AUTH_TYPE]: event.target.value,
                [FieldName.AUTH_ATTRS]: EMPTY_FORM_FIELDS[FieldName.AUTH_ATTRS],
              });
              // The auth fields are new, so they shouldn't display errors until they're touched.
              // Validation is skipped as setValues has already validated the new values.
              void setTouched(
                { ...touched, [FieldName.AUTH_ATTRS]: {} },
                false,
              );
            }}
            options={toAuthTypeOptions(clouds, values.cloud)}
            required
          />
          {authFields.map((field) => (
            <AuthField
              key={`${values.cloud}-${values.authType}-${field.name}`}
              field={field}
            />
          ))}
        </fieldset>
      )}
    </>
  );
};

export default Fields;
