import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { ChangeEvent, JSX, OptionHTMLAttributes } from "react";
import { useMemo } from "react";

import { getCloudInfoState } from "store/juju/selectors";
import type { CloudState } from "store/juju/types";
import { extractCloudName } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import { Label, type FormFields } from "./types";

const EMPTY_OPTION: OptionHTMLAttributes<HTMLOptionElement> = {
  label: "",
  value: "",
};

const toCloudOptions = (
  clouds: CloudState["clouds"],
): OptionHTMLAttributes<HTMLOptionElement>[] => [
  EMPTY_OPTION,
  ...Object.keys(clouds ?? {}).map((cloudTag) => ({
    label: extractCloudName(cloudTag),
    value: cloudTag,
  })),
];

const toRegionOptions = (
  clouds: CloudState["clouds"],
  cloudTag: string,
): OptionHTMLAttributes<HTMLOptionElement>[] => [
  EMPTY_OPTION,
  ...(clouds?.[cloudTag]?.regions ?? []).map(({ name }) => ({
    label: name,
    value: name,
  })),
];

const Fields = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<FormFields>();
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
        <FormikField label={Label.NAME} name="name" required type="text" />
      </fieldset>
      <fieldset className="u-no-padding u-no-margin--bottom add-credential-panel__fieldset--bordered">
        <p className="p-text--small-caps">{Label.CLOUD_DETAILS}</p>
        <FormikField
          component={Select}
          label={Label.CLOUD}
          name="cloud"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            void setFieldValue("cloud", event.target.value);
            // The regions and auth types depend on the cloud, so the previous
            // values are no longer valid.
            void setFieldValue("region", "");
          }}
          options={cloudOptions}
          required
        />
        <FormikField
          component={Select}
          disabled={!values.cloud}
          label={Label.REGION}
          name="region"
          options={regionOptions}
        />
      </fieldset>
    </>
  );
};

export default Fields;
