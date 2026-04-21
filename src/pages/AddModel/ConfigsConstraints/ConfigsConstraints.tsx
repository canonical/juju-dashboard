import {
  FormikField,
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
import { type CategoryDefinition, CONFIG_CATEGORIES } from "./configCatalog";
import { Label, TestId } from "./types";
import { buildConfigYAML, getChangedFields, isConfigChanged } from "./utils";

const ConfigsConstraints = (): JSX.Element => {
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
  const [isConfigListMode, setIsConfigListMode] = useState(
    values.configInputMode !== "yaml",
  );
  const [changedOnly, setChangedOnly] = useState(false);

  const buildRows = (categories: CategoryDefinition[]): MainTableRow[] =>
    categories.flatMap((category) => {
      const visibleConfigs = getChangedFields(category, changedOnly, values);

      return visibleConfigs.map((config, visibleIndex) => {
        const changed = isConfigChanged(
          config.label,
          config.input.defaultValue,
          values,
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
                    {changed ? (
                      <i className="p-icon--status-in-progress-small" />
                    ) : null}
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
                  {...(config.input.type === "select"
                    ? { component: Select }
                    : {})}
                  name={config.label}
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
    const existingConfigYAML =
      typeof values.configYAML === "string" ? values.configYAML.trim() : "";

    if (!isListMode && !existingConfigYAML) {
      void setFieldValue(
        "configYAML",
        buildConfigYAML(CONFIG_CATEGORIES, values),
      );
    }

    void setFieldValue("configInputMode", isListMode ? "list" : "yaml");
    setIsConfigListMode(isListMode);
  };

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <ContentSwitcher
        showPrimary={isConfigListMode}
        docsLabel={Label.MODEL_CONFIG_DOCS}
        docsLink={externalURLs.configureModel}
        name="config-input-mode"
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
            name="configYAML"
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
