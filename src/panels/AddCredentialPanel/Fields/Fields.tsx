import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";
import { useMemo } from "react";

import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import { Label, FieldName, type FormFields } from "./types";
import { toCloudOptions, toRegionOptions } from "./utils";

const Fields = (): JSX.Element => {
  const { values, setValues } = useFormikContext<FormFields>();
  const { clouds } = useAppSelector(getCloudInfoState);

  const cloudOptions = useMemo(() => toCloudOptions(clouds), [clouds]);
  const regionOptions = useMemo(
    () => toRegionOptions(clouds, values.cloud),
    [clouds, values.cloud],
  );

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
            // The regions and auth types depend on the cloud, so the previous
            // values are no longer valid. Everything is set in one update so that validation runs
            // against the complete new values.
            void setValues({
              ...values,
              [FieldName.CLOUD]: event.target.value,
              [FieldName.REGION]: "",
            });
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
    </>
  );
};

export default Fields;
