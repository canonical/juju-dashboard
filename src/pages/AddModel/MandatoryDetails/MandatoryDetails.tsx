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

import { TestId } from "./types";

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
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();
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
    if (wsControllerURL && activeUser && defaultCloud) {
      dispatch(
        jujuActions.fetchUserCredentials({
          wsControllerURL,
          userTag: activeUser,
          cloudTag: defaultCloud,
        }),
      );
    }
  }, [dispatch, wsControllerURL, activeUser, defaultCloud]);

  const credentialsOptions = useMemo(
    () => toCredentialOptions(userCredentials.credentials),
    [userCredentials.credentials],
  );

  const handleCloudChange = (nextCloud: string): void => {
    if (wsControllerURL && activeUser) {
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
    <>
      <FormikField
        autoFocus
        label={
          <>
            Model name
            <div className="model-name-description p-text--small u-no-margin--bottom">
              Model names may only contain lowercase letters, digits and
              hyphens, and may not start with a hyphen.
            </div>
          </>
        }
        name="modelName"
        type="text"
        {...testId(TestId.MODEL_NAME)}
        required
      />
      <FormikField
        component={Select}
        label="Cloud"
        name="cloud"
        {...testId(TestId.CLOUD)}
        required
        options={cloudOptions}
        onChange={(ev) => {
          const nextCloud = String(ev.target.value);
          void setFieldValue("cloud", nextCloud);
          void setFieldValue("region", "");
          void setFieldValue("credential", "");
          handleCloudChange(nextCloud);
        }}
      />
      <FormikField
        component={Select}
        label="Region (optional)"
        name="region"
        disabled={!values.cloud}
        options={toRegionOptions(cloudInfo, values.cloud || defaultCloud)}
        {...testId(TestId.REGION)}
      />
      <FormikField
        component={Select}
        label="Credential"
        name="credential"
        {...testId(TestId.CREDENTIAL)}
        disabled={userCredentials.loading || !values.cloud}
        required
        options={credentialsOptions}
      />
    </>
  );
};

export default MandatoryDetails;
