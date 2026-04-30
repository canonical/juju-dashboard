import { FormikField, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import {
  useEffect,
  useMemo,
  useState,
  type JSX,
  type OptionHTMLAttributes,
} from "react";

import { getWSControllerURL } from "store/general/selectors";
import {
  getCloudInfoState,
  getUserCredentialsState,
} from "store/juju/selectors";
import type { CloudState } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
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
  cloudValue: null | string,
): OptionHTMLAttributes<HTMLOptionElement>[] => [
  EMPTY_OPTION,
  ...(cloudValue ? (cloudInfo?.[cloudValue]?.regions ?? []) : []).map(
    (region) => ({
      label: region.name,
      value: region.name,
    }),
  ),
];

const MandatoryDetails = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { values, setFieldValue, setValues } =
    useFormikContext<AddModelFormState>();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const userCredentials = useAppSelector(getUserCredentialsState);
  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);
  const defaultCloud =
    typeof cloudOptions[0]?.value === "string" ? cloudOptions[0]?.value : null;
  const [selectedCloud, setSelectedCloud] = useState(
    values.cloud || defaultCloud,
  );

  useEffect(() => {
    if (!values.cloud && defaultCloud) {
      void setFieldValue("cloud", defaultCloud);
    }
  }, [values.cloud, defaultCloud, setFieldValue]);

  useEffect(() => {
    if (
      wsControllerURL &&
      selectedCloud &&
      !userCredentials.credentials[selectedCloud]
    ) {
      dispatch(
        userCredentialsMiddleware.actions.start({
          wsControllerURL,
          cloudTag: selectedCloud,
        }),
      );
    }
    return (): void => {
      if (wsControllerURL && selectedCloud) {
        dispatch(
          userCredentialsMiddleware.actions.stop({
            wsControllerURL,
            cloudTag: selectedCloud,
          }),
        );
      }
    };
  }, [dispatch, wsControllerURL, selectedCloud, userCredentials.credentials]);

  const credentialsOptions = useMemo(
    () => toCredentialOptions(userCredentials.credentials[values.cloud] || []),
    [userCredentials, values.cloud],
  );

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
          void setValues(
            (prevValues) =>
              ({
                ...prevValues,
                cloud: nextCloud,
                region: "",
                credential: "",
              }) as AddModelFormState,
          );
          setSelectedCloud(nextCloud);
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
