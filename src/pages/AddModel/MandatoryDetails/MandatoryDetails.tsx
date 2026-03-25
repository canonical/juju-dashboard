import { FormikField, Select } from "@canonical/react-components";
import { Formik, Form } from "formik";
import { useState, type JSX } from "react";

import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const MandatoryDetails = (): JSX.Element => {
  const cloudInfo = useAppSelector(getCloudInfoState).clouds ?? {};
  const cloudOptions = Object.keys(cloudInfo).map((cloud) => ({
    label: cloud,
    value: cloud,
  }));
  const initialRegions = [
    { label: "", value: "" },
    ...(cloudInfo[cloudOptions[0]?.value ?? ""]?.regions ?? []).map(
      (region) => ({
        label: region.name,
        value: region.name,
      }),
    ),
  ];
  const [regionOptions, setRegionOptions] =
    useState<{ label: string; value: string }[]>(initialRegions);

  return (
    <Formik
      initialValues={{
        modelName: "",
        cloud: cloudOptions[0].value,
        region: "",
        credential: "",
      }}
      onSubmit={() => {}}
    >
      <Form className="mandatory-details-form">
        <FormikField label="Model name" name="modelName" type="text" required />
        <FormikField
          component={Select}
          label="Cloud"
          name="cloud"
          required
          options={cloudOptions}
          onChange={(ev) => {
            const regions = [
              { label: "", value: "" },
              ...(cloudInfo[ev.target.value]?.regions ?? []).map((region) => ({
                label: region.name,
                value: region.name,
              })),
            ];
            setRegionOptions(regions);
          }}
        />
        <FormikField
          component={Select}
          label="Region (optional)"
          name="region"
          options={regionOptions}
        />
        <FormikField
          label="Credential"
          name="credential"
          type="text"
          required
        />
      </Form>
    </Formik>
  );
};

export default MandatoryDetails;
