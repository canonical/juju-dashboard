import {
  FormikField,
  MainTable,
  RadioInput,
  Select,
  Switch,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useFormikContext } from "formik";
import { useState } from "react";
import type { JSX } from "react";
import type React from "react";

import { testId } from "testing/utils";

import { type CategoryDefinition, CONFIG_CATEGORIES } from "./configCatalog";
import { CONSTRAINTS_CATEGORIES } from "./constraintsCatalog";
import { TestId } from "./types";

const ConfigsConstraints = (): JSX.Element => {
  const [changedOnly, setChangedOnly] = useState(false);
  const { values } = useFormikContext<Record<string, unknown>>();

  const isConfigChanged = (label: string, defaultValue: unknown): boolean => {
    const currentValue = values[label];
    if (currentValue === undefined || currentValue === null) {
      return false;
    }
    if (defaultValue !== undefined) {
      return String(currentValue) !== String(defaultValue);
    }
    return String(currentValue).length > 0;
  };

  const buildRows = (categories: CategoryDefinition[]): MainTableRow[] =>
    categories.flatMap((category) => {
      const visibleConfigs = changedOnly
        ? category.fields.filter((config) =>
            isConfigChanged(config.label, config.input.defaultValue),
          )
        : category.fields;

      return visibleConfigs.map((config, visibleIndex) => {
        const changed = isConfigChanged(
          config.label,
          config.input.defaultValue,
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

  return (
    <div {...testId(TestId.CONFIGS_CONSTRAINTS_FORM)}>
      <h5 className="configs__section-heading u-no-margin--bottom">
        Configuration (optional)
      </h5>
      <a href="#" className="configs__link">
        Learn about model configuration
      </a>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput label="List" value="list" checked />
        </div>
        <div>
          <RadioInput label="YAML" value="yaml" />
        </div>
      </div>
      <Switch
        label="Changed configs only"
        checked={changedOnly}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setChangedOnly(event.target.checked);
        }}
      />
      <div className="configs__table-scroll">
        <MainTable
          className="p-main-table configs__table"
          rows={buildRows(CONFIG_CATEGORIES)}
        />
      </div>
      <h5 className="configs__section-heading u-no-margin--bottom">
        Constraints (optional)
      </h5>
      <a href="#" className="configs__link">
        Learn about model constraints
      </a>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput label="List" value="list" checked />
        </div>
        <div>
          <RadioInput label="YAML" value="yaml" />
        </div>
      </div>
      <Switch label="Changed constraints only" />
      <MainTable
        className="p-main-table configs__table"
        rows={buildRows(CONSTRAINTS_CATEGORIES)}
      />
    </div>
  );
};

export default ConfigsConstraints;
