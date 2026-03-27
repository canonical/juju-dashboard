import { FormikField, Select } from "@canonical/react-components";
import { Formik, Form } from "formik";
import { useState, type JSX } from "react";

import {
  getCloudInfoState,
  // getUserCredentialsState,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

const MandatoryDetails = (): JSX.Element => {
  const cloudInfo = useAppSelector(getCloudInfoState).clouds ?? {};
  // const userCredentials = useAppSelector(getUserCredentialsState);
  // console.log(userCredentials);

  const getRegionOptions = (
    cloudValue: string,
  ): { label: string; value: string }[] => [
    { label: "", value: "" },
    ...(cloudInfo[cloudValue]?.regions ?? []).map((region) => ({
      label: region.name,
      value: region.name,
    })),
  ];

  const cloudOptions = Object.keys(cloudInfo).map((cloud) => ({
    label: cloud.split("-")[1], // Display only the cloud name, not the region
    value: cloud.split("-")[1], // Display only the cloud name, not the region
  }));

  const defaultCloud = cloudOptions[0]?.value ?? "";
  const [regionOptions, setRegionOptions] = useState<
    { label: string; value: string }[]
  >(getRegionOptions(defaultCloud));

  return (
    <Formik
      initialValues={{
        modelName: "",
        cloud: defaultCloud,
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
            setRegionOptions(getRegionOptions(ev.target.value));
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
