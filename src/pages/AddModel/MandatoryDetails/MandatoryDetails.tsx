import { FormikField, Select } from "@canonical/react-components";
import { Formik, Form } from "formik";
import { useEffect, useMemo, type OptionHTMLAttributes, type JSX } from "react";

import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCloudInfoState,
  getUserCredentialsState,
  getAddModelFormState,
} from "store/juju/selectors";
import type { AddModelFormState, CloudState } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { testId } from "testing/utils";

import { type Props, TestId } from "./types";

const EMPTY_OPTION: OptionHTMLAttributes<HTMLOptionElement> = {
  label: "",
  value: "",
};

const toCloudOptions = (
  cloudInfo: CloudState["clouds"],
): OptionHTMLAttributes<HTMLOptionElement>[] =>
  cloudInfo
    ? Object.keys(cloudInfo).map((cloud) => ({
        label: extractCloudName(cloud),
        value: cloud,
      }))
    : [];

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

const toCredentialOptions = (
  credentials: string[],
): OptionHTMLAttributes<HTMLOptionElement>[] =>
  credentials.map((credential) => {
    const credentialName = extractCredentialName(credential);
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
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const userCredentials = useAppSelector(getUserCredentialsState);
  const savedFormState = useAppSelector(getAddModelFormState);
  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);
  const defaultCloud = cloudOptions[0]?.value as string;

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
        onSubmit();
        setSubmitting(false);
      }}
    >
      {({ values, setFieldValue }) => {
        const selectedCloud = values.cloud || defaultCloud;
        const regionOptions = toRegionOptions(cloudInfo, selectedCloud);
        return (
          <Form
            className="mandatory-details-form"
            {...testId(TestId.MANDATORY_DETAILS_FORM)}
          >
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
                void setFieldValue("credential", "");
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
