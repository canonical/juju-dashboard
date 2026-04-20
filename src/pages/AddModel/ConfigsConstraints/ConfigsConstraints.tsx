import { FormikField, MainTable, Select } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useFormikContext } from "formik";
import { useEffect, useMemo, type JSX, type OptionHTMLAttributes } from "react";

import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCloudInfoState,
  getUserCredentialsState,
} from "store/juju/selectors";
import type { CloudState } from "store/juju/types";
import { extractCloudName } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { testId } from "testing/utils";

import type { AddModelFormState } from "../types";

import { CONFIG_CATEGORIES, type ModelConfigDefinition } from "./configCatalog";
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

const renderConfigLabel = (config: ModelConfigDefinition): JSX.Element => (
  <div>
    {config.label}
    <span className="p-form-help-text u-no-margin--bottom">
      {config.description}
    </span>
  </div>
);

const renderConfigInput = (config: ModelConfigDefinition): JSX.Element => {
  const fieldName = `configurations.${config.label}`;

  if (config.input.type === "boolean") {
    return (
      <FormikField
        name={fieldName}
        component={Select}
        options={[
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ]}
      />
    );
  }

  if (config.input.type === "select") {
    const options: OptionHTMLAttributes<HTMLOptionElement>[] =
      config.input.options;

    return (
      <FormikField component={Select} name={fieldName} options={options} />
    );
  }

  const placeholder: string | undefined = config.input.placeholder;

  return <FormikField name={fieldName} type="text" placeholder={placeholder} />;
};

const buildRows = (): MainTableRow[] =>
  CONFIG_CATEGORIES.flatMap((category) =>
    category.configs.map((config, configIndex) => ({
      columns: [
        ...(configIndex === 0
          ? [
              {
                content: category.category,
                rowSpan: category.configs.length,
                className: "configs-constraints__category",
              },
            ]
          : []),
        {
          content: renderConfigLabel(config),
          className: "configs-constraints__config",
        },
        {
          content: renderConfigInput(config),
          className: "configs-constraints__input",
        },
      ],
    })),
  );

const ConfigsConstraints = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const userCredentials = useAppSelector(getUserCredentialsState);
  const cloudOptions = useMemo(() => toCloudOptions(cloudInfo), [cloudInfo]);
  const defaultCloud =
    typeof cloudOptions[0]?.value === "string" ? cloudOptions[0]?.value : null;

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
      initialCloud &&
      !userCredentials.credentials[initialCloud]
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

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      Configuration (optional)
      <MainTable
        className="p-main-table configs-constraints__table"
        rows={buildRows()}
      />
    </div>
  );
};

export default ConfigsConstraints;
