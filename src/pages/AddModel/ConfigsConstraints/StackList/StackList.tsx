import { FormikField, Icon, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import type { CategoryDefinition } from "../configCatalog";
import type { FormFields } from "../types";
import { isConfigChanged } from "../utils";

type Props = {
  visibleConfigs: CategoryDefinition["fields"];
  category: CategoryDefinition["category"];
};

const StackList = ({ visibleConfigs, category }: Props): JSX.Element => {
  const { values } = useFormikContext<FormFields & Record<string, string>>();
  return (
    <section
      className="p-form__group row u-no-padding stack__list u-no-margin--top"
      key={category}
    >
      <h5 className="col-3">{category}</h5>
      <div className="col-9">
        {visibleConfigs.map((config) => {
          const changed = isConfigChanged(
            config.label,
            values,
            config.defaultValue,
          );
          return (
            <div className="stack__row u-no-padding" key={config.label}>
              <div className="stack__config  p-table__cell--icon-placeholder">
                <span>
                  {changed ? <Icon name="status-in-progress-small" /> : null}
                  {config.label}
                </span>
                <span className="p-form-help-text u-no-margin--bottom">
                  {config.description}
                </span>
              </div>
              <div className="stack__input">
                <FormikField
                  {...(config.input?.type === "select"
                    ? { component: Select }
                    : { type: "text", placeholder: config.placeholder })}
                  name={config.label}
                  defaultValue={config.defaultValue}
                  {...config.input}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StackList;
