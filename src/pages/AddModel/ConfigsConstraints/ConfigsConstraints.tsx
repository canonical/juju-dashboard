import { FormikField, List } from "@canonical/react-components";
import type { JSX } from "react";

import { testId } from "testing/utils";
import { externalURLs } from "urls";

import CategoriesListing from "./CategoriesListing";
import TruncatedDetails from "./TruncatedDetails";
import { CONFIG_CATEGORIES } from "./configCatalog";
import { CONSTRAINT_CATEGORIES } from "./constraintsCatalog";
import { DISABLED_COMMAND_OPTIONS } from "./disabledCommandOptions";
import { FieldName, Label, TestId } from "./types";

const ConfigsConstraints = (): JSX.Element => {
  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <CategoriesListing
        title={Label.CONFIGS_TITLE}
        categoriesList={CONFIG_CATEGORIES}
        inputMode={FieldName.CONFIG_INPUT_MODE}
        yamlKey={FieldName.CONFIG_YAML}
        changedOnlyLabel={Label.CHANGED_CONFIGS_ONLY}
        docsLabel={Label.MODEL_CONFIG_DOCS}
        docsLink={externalURLs.configureModel}
        tooltipMessage={Label.NO_CHANGED_CONFIGS}
        searchPlaceholder="Search configurations"
        yamlPlaceholder={Label.MODEL_CONFIG_PLACEHOLDER}
        searchName="configSearch"
      />
      <CategoriesListing
        title={Label.CONSTRAINTS_TITLE}
        categoriesList={CONSTRAINT_CATEGORIES}
        inputMode={FieldName.CONSTRAINT_INPUT_MODE}
        yamlKey={FieldName.CONSTRAINT_YAML}
        changedOnlyLabel={Label.CHANGED_CONSTRAINTS_ONLY}
        docsLabel={Label.MODEL_CONSTRAINT_DOCS}
        docsLink={externalURLs.constraintModel}
        tooltipMessage={Label.NO_CHANGED_CONSTRAINTS}
        searchPlaceholder="Search constraints"
        yamlPlaceholder={Label.MODEL_CONSTRAINT_PLACEHOLDER}
        searchName="constraintSearch"
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
                  <TruncatedDetails items={disabledCommands} />
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
