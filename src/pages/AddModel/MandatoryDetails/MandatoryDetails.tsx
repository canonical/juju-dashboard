import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useEffect, useMemo, type JSX, type OptionHTMLAttributes } from "react";

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

import { TestId, Label } from "./types";

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

const MandatoryDetails = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { values, setFieldValue, setValues } =
    useFormikContext<AddModelFormState>();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const userCredentials = useAppSelector(getUserCredentialsState);
  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);
  const defaultCloud = cloudOptions[0]?.value as string;

  useEffect(() => {
    if (!values.cloud && defaultCloud) {
      void setFieldValue("cloud", defaultCloud);
    }
  }, [values.cloud, defaultCloud, setFieldValue]);

  useEffect(() => {
    const initialCloud = values.cloud || defaultCloud;
    if (
      wsControllerURL &&
      activeUser &&
      !userCredentials.credentials[initialCloud] &&
      typeof initialCloud === "string" &&
      initialCloud.length > 0
    ) {
      dispatch(
        jujuActions.fetchUserCredentials({
          wsControllerURL,
          userTag: activeUser,
          cloudTag: initialCloud,
        }),
      );
    }
  }, [
    dispatch,
    wsControllerURL,
    activeUser,
    defaultCloud,
    userCredentials.credentials,
    values.cloud,
  ]);

  const credentialsOptions = useMemo(
    () => toCredentialOptions(userCredentials.credentials[values.cloud] || []),
    [userCredentials, values.cloud],
  );

  const handleCloudChange = (nextCloud: string): void => {
    if (
      wsControllerURL &&
      activeUser &&
      !userCredentials.credentials[nextCloud] &&
      typeof nextCloud === "string" &&
      nextCloud.length > 0
    ) {
      dispatch(
        jujuActions.fetchUserCredentials({
          wsControllerURL,
          userTag: activeUser,
          cloudTag: nextCloud,
        }),
      );
    }
  };

  return (
    <div {...testId(TestId.MANDATORY_DETAILS_FORM)}>
      <FormikField
        autoFocus
        label={
          <>
            <span className="u-sv1">{Label.MODEL_NAME}</span>
            <span className="p-form-help-text">
              Model names may only contain lowercase letters, digits and
              hyphens, and may not start with a hyphen.
            </span>
          </>
        }
        name="modelName"
        type="text"
        required
      />
      <FormikField
        component={Select}
        label={Label.CLOUD}
        name="cloud"
        required
        options={cloudOptions}
        onChange={(ev) => {
          const nextCloud = String(ev.target.value);
          void setValues((prevValues) => ({
            ...prevValues,
            cloud: nextCloud,
            region: "",
            credential: "",
          }));
          handleCloudChange(nextCloud);
        }}
      />
      <FormikField
        component={Select}
        label={Label.REGION}
        name="region"
        disabled={!values.cloud}
        options={toRegionOptions(cloudInfo, values.cloud || defaultCloud)}
      />
      <FormikField
        component={Select}
        label={Label.CREDENTIAL}
        name="credential"
        disabled={userCredentials.loading || !values.cloud}
        required
        options={credentialsOptions}
      />
    </div>
  );
};

export default MandatoryDetails;
