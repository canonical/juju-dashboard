import { FormikField, Select } from "@canonical/react-components";
import { Formik, Form, type FormikProps } from "formik";
import { useEffect, useMemo, type JSX, type Ref } from "react";

import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCloudInfoState,
  getUserCredentialsState,
  getAddModelFormState,
} from "store/juju/selectors";
import type { AddModelFormState } from "store/juju/types";
import { useAppDispatch, useAppSelector } from "store/store";

type Props = {
  formRef?: Ref<FormikProps<AddModelFormState>>;
  onSubmit?: () => void;
};

type SelectOption = { label: string; value: string };

const EMPTY_OPTION: SelectOption = { label: "", value: "" };

const stripPrefix = (value: string, prefix: string): string =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const toCloudOptions = (
  cloudInfo: Record<string, { regions?: { name: string }[] }>,
): SelectOption[] =>
  Object.keys(cloudInfo).map((cloud) => ({
    label: stripPrefix(cloud, "cloud-"),
    value: cloud,
  }));

const toRegionOptions = (
  cloudInfo: Record<string, { regions?: { name: string }[] }>,
  cloudValue: string,
): SelectOption[] => [
  EMPTY_OPTION,
  ...(cloudInfo[cloudValue]?.regions ?? []).map((region) => ({
    label: region.name,
    value: region.name,
  })),
];

const toCredentialOptions = (credentials: string[]): SelectOption[] =>
  credentials.map((credential) => {
    const credentialName = stripPrefix(credential, "cloudcred-");
    return {
      label: credentialName,
      value: credentialName,
    };
  });

const MandatoryDetails = ({ formRef, onSubmit }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const { clouds } = useAppSelector(getCloudInfoState);
  const cloudInfo = useMemo(() => clouds ?? {}, [clouds]);
  const userCredentials = useAppSelector(getUserCredentialsState);
  const savedFormState = useAppSelector(getAddModelFormState);

  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);

  const defaultCloud = cloudOptions[0]?.value ?? "";

  const initialFormValues: AddModelFormState = useMemo(
    () => ({
      modelName: savedFormState?.modelName ?? "",
      cloud: savedFormState?.cloud ?? defaultCloud,
      region: savedFormState?.region ?? "",
      credential: savedFormState?.credential ?? "",
    }),
    [savedFormState, defaultCloud],
  );

  useEffect(() => {
    if (wsControllerURL && activeUser && defaultCloud && !savedFormState) {
      dispatch(
        jujuActions.fetchUserCredentials({
          wsControllerURL,
          userTag: activeUser,
          cloudTag: defaultCloud,
        }),
      );
    }
  }, [dispatch, wsControllerURL, activeUser, defaultCloud, savedFormState]);

  const credentialsOptions = useMemo(
    () => toCredentialOptions(userCredentials.credentials),
    [userCredentials.credentials],
  );

  return (
    <Formik
      innerRef={formRef}
      enableReinitialize
      initialValues={initialFormValues}
      onSubmit={(_values, { setSubmitting }) => {
        onSubmit?.();
        setSubmitting(false);
      }}
    >
      {({ values, setFieldValue }) => {
        const selectedCloud = values.cloud || defaultCloud;
        const regionOptions = toRegionOptions(cloudInfo, selectedCloud);
        return (
          <Form className="mandatory-details-form">
            <FormikField
              label="Model name"
              name="modelName"
              type="text"
              required
            />
            <FormikField
              component={Select}
              label="Cloud"
              name="cloud"
              required
              options={cloudOptions}
              onChange={(ev) => {
                const nextCloud = ev.target.value;
                void setFieldValue("cloud", nextCloud);
                void setFieldValue("region", "");
                if (wsControllerURL && activeUser) {
                  dispatch(
                    jujuActions.fetchUserCredentials({
                      wsControllerURL,
                      userTag: activeUser,
                      cloudTag: nextCloud,
                    }),
                  );
                }
              }}
            />
            <FormikField
              component={Select}
              label="Region (optional)"
              name="region"
              disabled={!values.cloud}
              options={regionOptions}
            />
            <FormikField
              component={Select}
              label="Credential"
              name="credential"
              disabled={!values.cloud}
              required
              options={credentialsOptions}
            />
          </Form>
        );
      }}
    </Formik>
  );
};

export default MandatoryDetails;
