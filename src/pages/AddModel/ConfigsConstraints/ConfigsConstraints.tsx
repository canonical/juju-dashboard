import {
  Col,
  FormikField,
  Row,
  SearchBox,
  Switch,
  Textarea,
  List,
  Tooltip,
} from "@canonical/react-components";
import classNames from "classnames";
import { useFormikContext } from "formik";
import { useState, type ChangeEvent, type JSX } from "react";

import useDebounce from "hooks/useDebounce";
import { testId } from "testing/utils";
import { externalURLs } from "urls";

import ContentSwitcher from "./ContentSwitcher";
import { InputMode } from "./ContentSwitcher/types";
import StackList from "./StackList";
import { CONFIG_CATEGORIES } from "./configCatalog";
import { DISABLED_COMMAND_OPTIONS } from "./disabledCommandOptions";
import { type FormFields, FieldName, Label, TestId } from "./types";
import {
  buildConfigYAML,
  filterConfigsBySearch,
  getCategoriesWithVisibleConfigs,
} from "./utils";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<
    FormFields & Record<string, string>
  >();

  const [changedOnly, setChangedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useDebounce("", 250);
  const isConfigListMode =
    values[FieldName.CONFIG_INPUT_MODE] !== InputMode.YAML;

  const handleConfigModeChange = (isListMode: boolean): void => {
    if (!isListMode) {
      void setFieldValue(
        FieldName.CONFIG_YAML,
        buildConfigYAML(CONFIG_CATEGORIES, values),
      );
    }

    void setFieldValue(
      FieldName.CONFIG_INPUT_MODE,
      isListMode ? InputMode.LIST : InputMode.YAML,
    );
  };

  const filteredCategories = filterConfigsBySearch(searchQuery);
  const categoriesWithChangedConfigs = getCategoriesWithVisibleConfigs(
    filteredCategories,
    values,
  );
  const hasChangedConfigs = categoriesWithChangedConfigs.length > 0;
  const visibleCategories = changedOnly
    ? categoriesWithChangedConfigs
    : filteredCategories;

  const changedOnlySwitch = (
    <Switch
      label={Label.CHANGED_CONFIGS_ONLY}
      checked={changedOnly}
      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
        if (!hasChangedConfigs && event.target.checked) {
          return;
        }

        setChangedOnly(event.target.checked);
      }}
    />
  );

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <ContentSwitcher
        showPrimary={isConfigListMode}
        docsLabel={Label.MODEL_CONFIG_DOCS}
        docsLink={externalURLs.configureModel}
        primaryContent={
          <>
            <div className="row u-no-padding">
              <div className="col-4">
                <SearchBox
                  name="configSearch"
                  id="configSearch"
                  placeholder="Search configurations"
                  onChange={setSearchQuery}
                  onClear={() => {
                    setSearchQuery("", { immediate: true });
                  }}
                  className="u-no-margin--bottom"
                  aria-label="Search configurations"
                />
              </div>
            </div>
            {hasChangedConfigs ? (
              changedOnlySwitch
            ) : (
              <Tooltip message={Label.NO_CHANGED_CONFIGS} position="btm-left">
                {changedOnlySwitch}
              </Tooltip>
            )}
            <div className="configs__form-scroll u-sv-1--top">
              {visibleCategories.length > 0 ? (
                visibleCategories.map(({ category, fields }, index) => (
                  <Row
                    key={category}
                    className={classNames("u-no-padding", {
                      "u-sv1--top": index !== 0,
                    })}
                  >
                    <Col size={3}>
                      <h5>{category}</h5>
                    </Col>
                    <Col size={9}>
                      <StackList visibleConfigs={fields} />
                    </Col>
                    {index < visibleCategories.length - 1 ? (
                      <hr className="p-rule--muted" />
                    ) : null}
                  </Row>
                ))
              ) : (
                <h5>No results found for {`"${searchQuery}"`}</h5>
              )}
            </div>
          </>
        }
        secondaryContent={
          <div className="row u-no-padding">
            <div className="col-6">
              <FormikField
                className="configs__yaml-input"
                component={Textarea}
                name={FieldName.CONFIG_YAML}
                placeholder={Label.MODEL_CONFIG_PLACEHOLDER}
              />
            </div>
          </div>
        }
        onModeChange={handleConfigModeChange}
        title="Configuration (optional)"
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
                  <div>
                    <b>Disables commands:</b> {disabledCommands.join(", ")}
                  </div>
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
