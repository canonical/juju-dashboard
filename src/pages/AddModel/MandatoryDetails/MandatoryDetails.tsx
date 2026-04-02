import { Formik } from "formik";
import { useEffect, useMemo, type OptionHTMLAttributes, type JSX } from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";
import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCloudInfoState,
  getUserCredentialsState,
} from "store/juju/selectors";
import type { CloudState } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { testId } from "testing/utils";

import type { AddModelFormState } from "../types";

import Fields from "./Fields";
import { type Props, TestId } from "./types";

const toCloudOptions = (
  cloudInfo: CloudState["clouds"],
): OptionHTMLAttributes<HTMLOptionElement>[] =>
  cloudInfo
    ? Object.keys(cloudInfo).map((cloud) => ({
        label: extractCloudName(cloud),
        value: cloud,
      }))
    : [];

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

const MODEL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const MandatoryDetails = ({
  initialValues,
  onFormChange,
}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const userCredentials = useAppSelector(getUserCredentialsState);
  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);
  const defaultCloud = cloudOptions[0]?.value as string;
  const draftValues = initialValues;

  const initialFormValues: AddModelFormState = useMemo(
    () => ({
      modelName: draftValues?.modelName ?? "",
      cloud: draftValues?.cloud ?? defaultCloud,
      region: draftValues?.region ?? "",
      credential: draftValues?.credential ?? "",
    }),
    [draftValues, defaultCloud],
  );

  useEffect(() => {
    if (wsControllerURL && activeUser && defaultCloud && !initialValues) {
      dispatch(
        jujuActions.fetchUserCredentials({
          wsControllerURL,
          userTag: activeUser,
          cloudTag: defaultCloud,
        }),
      );
    }
  }, [dispatch, wsControllerURL, activeUser, defaultCloud, initialValues]);

  const credentialsOptions = useMemo(
    () => toCredentialOptions(userCredentials.credentials),
    [userCredentials.credentials],
  );

  const schema = Yup.object().shape({
    modelName: Yup.string()
      .matches(MODEL_NAME_PATTERN, "Incorrect model name format.")
      .required("Required"),
  });

  return (
    <Formik
      enableReinitialize
      validationSchema={schema}
      initialValues={initialFormValues}
      onSubmit={() => {}}
    >
      <FormikFormData
        id={TestId.MANDATORY_DETAILS_FORM}
        className="mandatory-details-form"
        {...testId(TestId.MANDATORY_DETAILS_FORM)}
        onFormChange={onFormChange}
      >
        <Fields
          cloudOptions={cloudOptions}
          credentialsOptions={credentialsOptions}
          defaultCloud={defaultCloud}
          onCloudChange={(nextCloud: string) => {
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
      </FormikFormData>
    </Formik>
  );
};

export default MandatoryDetails;
