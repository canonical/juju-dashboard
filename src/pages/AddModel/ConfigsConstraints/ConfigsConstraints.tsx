import {
  Col,
  FormikField,
  Row,
  Switch,
  Textarea,
  List,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useState, type ChangeEvent, type JSX } from "react";

import { testId } from "testing/utils";
import { externalURLs } from "urls";

import ContentSwitcher from "./ContentSwitcher";
import { InputMode } from "./ContentSwitcher/types";
import StackList from "./StackList";
import { CONFIG_CATEGORIES } from "./configCatalog";
import { DISABLED_COMMAND_OPTIONS } from "./disabledCommandOptions";
import { type FormFields, FieldName, Label, TestId } from "./types";
import { buildConfigYAML, getCategoriesWithVisibleConfigs } from "./utils";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<
    FormFields & Record<string, string>
  >();

  const [changedOnly, setChangedOnly] = useState(false);
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

  const categoriesWithConfigs = getCategoriesWithVisibleConfigs(
    CONFIG_CATEGORIES,
    changedOnly,
    values,
  );

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <ContentSwitcher
        showPrimary={isConfigListMode}
        docsLabel={Label.MODEL_CONFIG_DOCS}
        docsLink={externalURLs.configureModel}
        primaryContent={
          <>
            <Switch
              label={Label.CHANGED_CONFIGS_ONLY}
              checked={changedOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setChangedOnly(event.target.checked);
              }}
            />
            <div className="configs__form-scroll">
              {categoriesWithConfigs.map(({ category, fields }, index) => (
                <Row key={category} className="u-no-padding u-sv1--top">
                  <Col size={3}>
                    <h5>{category}</h5>
                  </Col>
                  <Col size={9}>
                    <StackList visibleConfigs={fields} />
                  </Col>
                  {index < categoriesWithConfigs.length - 1 ? (
                    <hr className="p-rule--muted" />
                  ) : null}
                </Row>
              ))}
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
