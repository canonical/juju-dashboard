import { FormikField, List } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useEffect, useState, type JSX } from "react";

import {
  getCloudInfoState,
  getModelConfigDefaultsState,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { externalURLs } from "urls";

import type { AddModelFormState } from "../types";
import { InputMode } from "../types";

import CategoriesListing from "./CategoriesListing";
import TruncatedCommands from "./TruncatedCommands";
import YAMLErrorsModal from "./YAMLErrorsModal";
import type { YAMLErrorsModalState } from "./YAMLErrorsModal/types";
import { DISABLED_COMMAND_OPTIONS } from "./disabledCommandOptions";
import { FieldName, type FormFields, Label, TestId } from "./types";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<
    AddModelFormState & FormFields
  >();
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const modelConfigDefaults = useAppSelector(getModelConfigDefaultsState);
  const [yamlErrorsModalState, setYAMLErrors] =
    useState<null | YAMLErrorsModalState>(null);

  const providerType = values.cloud
    ? cloudInfo?.[values.cloud]?.type
    : undefined;

  // When live config fields arrive, atomically replace the configFields array.
  const liveEntries = providerType
    ? (modelConfigDefaults.defaults[providerType] ?? null)
    : null;

  useEffect(() => {
    if (!liveEntries || liveEntries.length === 0) {
      return;
    }
    void setFieldValue(FieldName.CONFIG_FIELDS, liveEntries, false);
  }, [liveEntries, setFieldValue]);

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      {yamlErrorsModalState ? (
        <YAMLErrorsModal
          errors={yamlErrorsModalState.errors}
          yamlKey={yamlErrorsModalState.yamlKey}
          onConfirm={() => {
            const { inputMode, yamlKey } = yamlErrorsModalState;
            void setFieldValue(yamlKey, "");
            void setFieldValue(inputMode, InputMode.LIST);
            setYAMLErrors(null);
          }}
          onClose={() => {
            setYAMLErrors(null);
          }}
        />
      ) : null}
      <CategoriesListing
        title={Label.CONFIGS_TITLE}
        arrayName={FieldName.CONFIG_FIELDS}
        inputMode={FieldName.CONFIG_INPUT_MODE}
        yamlKey={FieldName.CONFIG_YAML}
        changedOnlyLabel={Label.CHANGED_CONFIGS_ONLY}
        docsLabel={Label.MODEL_CONFIG_DOCS}
        docsLink={externalURLs.configureModel}
        tooltipMessage={Label.NO_CHANGED_CONFIGS}
        searchPlaceholder="Search configurations"
        yamlPlaceholder={Label.MODEL_CONFIG_PLACEHOLDER}
        searchName="configSearch"
        setYAMLErrors={setYAMLErrors}
        yamlErrorLabel={Label.INCORRECT_YAML_CONFIGURATION_ERROR}
      />
      <CategoriesListing
        title={Label.CONSTRAINTS_TITLE}
        arrayName={FieldName.CONSTRAINT_FIELDS}
        inputMode={FieldName.CONSTRAINT_INPUT_MODE}
        yamlKey={FieldName.CONSTRAINT_YAML}
        changedOnlyLabel={Label.CHANGED_CONSTRAINTS_ONLY}
        docsLabel={Label.MODEL_CONSTRAINT_DOCS}
        docsLink={externalURLs.constraintModel}
        tooltipMessage={Label.NO_CHANGED_CONSTRAINTS}
        searchPlaceholder="Search constraints"
        yamlPlaceholder={Label.MODEL_CONSTRAINT_PLACEHOLDER}
        searchName="constraintSearch"
        setYAMLErrors={setYAMLErrors}
        yamlErrorLabel={Label.INCORRECT_YAML_CONSTRAINT_ERROR}
      />
      <h5 className="u-no-padding--top u-no-margin--bottom">
        {Label.DISABLED_COMMANDS}
      </h5>
      <p className="u-no-margin--bottom p-text--small">
        <a href={externalURLs.disableCommand}>{Label.DISABLE_COMMANDS_DOCS}</a>
      </p>
      <List
        items={DISABLED_COMMAND_OPTIONS.map(
          ({ label, value, description, disabledCommands }) => (
            <div className="disabled-commands__option" key={value}>
              <FormikField
                type="radio"
                name={FieldName.DISABLED_COMMANDS}
                label={label}
                value={value}
              />
              <div className="p-text--small u-no-margin--bottom">
                {description}
                {disabledCommands ? (
                  <TruncatedCommands items={disabledCommands} />
                ) : null}
              </div>
            </div>
          ),
        )}
        divided
      />
    </div>
  );
};

export default ConfigsConstraints;
