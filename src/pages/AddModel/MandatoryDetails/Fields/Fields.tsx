import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX, OptionHTMLAttributes } from "react";

import type { AddModelFormState } from "pages/AddModel/types";
import { getCloudInfoState } from "store/juju/selectors";
import type { CloudState } from "store/juju/types";
import { useAppSelector } from "store/store";

import type { Props } from "./types";

const EMPTY_OPTION: OptionHTMLAttributes<HTMLOptionElement> = {
  label: "",
  value: "",
};

const toRegionOptions = (
  cloudInfo: CloudState["clouds"],
  cloudValue: string,
): OptionHTMLAttributes<HTMLOptionElement>[] => [
  EMPTY_OPTION,
  ...(cloudInfo?.[cloudValue]?.regions ?? []).map((region) => ({
    label: region.name,
    value: region.name,
  })),
];

const Fields = ({
  cloudOptions,
  credentialsOptions,
  defaultCloud,
  onCloudChange,
}: Props): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;

  return (
    <>
      <FormikField label="Model name" name="modelName" type="text" required />
      <FormikField
        component={Select}
        label="Cloud"
        name="cloud"
        required
        options={cloudOptions}
        onChange={(ev) => {
          const nextCloud = String(ev.target.value);
          void setFieldValue("cloud", nextCloud);
          void setFieldValue("region", "");
          void setFieldValue("credential", "");
          onCloudChange(nextCloud);
        }}
      />
      <FormikField
        component={Select}
        label="Region (optional)"
        name="region"
        disabled={!values.cloud}
        options={toRegionOptions(cloudInfo, values.cloud || defaultCloud)}
      />
      <FormikField
        component={Select}
        label="Credential"
        name="credential"
        disabled={!values.cloud}
        required
        options={credentialsOptions}
      />
    </>
  );
};

export default Fields;
