import {
  FormikField,
  Icon,
  MainTable,
  Select,
  Switch,
  Textarea,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useFormikContext } from "formik";
import { useState, type ChangeEvent, type JSX } from "react";

import { testId } from "testing/utils";
import { externalURLs } from "urls";

import ContentSwitcher from "./ContentSwitcher/ContentSwitcher";
import { InputMode } from "./ContentSwitcher/types";
import { type CategoryDefinition, CONFIG_CATEGORIES } from "./configCatalog";
import {
  FieldName,
  Label,
  TestId,
  type ConfigsConstraintsFormValues,
} from "./types";
import { buildConfigYAML, getChangedFields, isConfigChanged } from "./utils";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } =
    useFormikContext<ConfigsConstraintsFormValues>();
  const [changedOnly, setChangedOnly] = useState(false);
  const isConfigListMode =
    values[FieldName.CONFIG_INPUT_MODE] !== InputMode.YAML;

  const buildRows = (categories: CategoryDefinition[]): MainTableRow[] =>
    categories.flatMap((category) => {
      const visibleConfigs = getChangedFields(category, changedOnly, values);

      return visibleConfigs.map((config, visibleIndex) => {
        const changed = isConfigChanged(
          config.label,
          values,
          config.defaultValue,
        );

        return {
          columns: [
            ...(visibleIndex === 0 && visibleConfigs.length > 0
              ? [
                  {
                    content: <h5>{category.category}</h5>,
                    rowSpan: visibleConfigs.length,
                    className: "configs__category",
                  },
                ]
              : []),
            {
              content: (
                <div>
                  <span>
                    {changed ? <Icon name="status-in-progress-small" /> : null}
                    {config.label}
                  </span>
                  <span className="p-form-help-text u-no-margin--bottom">
                    {config.description}
                  </span>
                </div>
              ),
              className: "configs__config p-table__cell--icon-placeholder",
            },
            {
              content: (
                <FormikField
                  {...(config.input?.type === "select"
                    ? { component: Select }
                    : { type: "text", placeholder: config.placeholder })}
                  name={config.label}
                  defaultValue={config.defaultValue}
                  {...config.input}
                />
              ),
              className: "configs__input",
            },
          ],
        };
      });
    });

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
            <div className="configs__table-scroll">
              <MainTable
                className="p-main-table configs__table"
                rows={buildRows(CONFIG_CATEGORIES)}
              />
            </div>
          </>
        }
        secondaryContent={
          <FormikField
            className="configs__yaml-input"
            component={Textarea}
            name={FieldName.CONFIG_YAML}
            placeholder={Label.MODEL_CONFIG_PLACEHOLDER}
          />
        }
        onModeChange={handleConfigModeChange}
        title="Configuration (optional)"
      />
    </div>
  );
};

export default ConfigsConstraints;
