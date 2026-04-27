import { FormikField, Icon, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { Fragment, type JSX } from "react";

import type { CategoryDefinition } from "../configCatalog";
import type { FormFields } from "../types";
import { isConfigChanged } from "../utils";

type Props = {
  visibleConfigs: CategoryDefinition["fields"];
};

const StackList = ({ visibleConfigs }: Props): JSX.Element => {
  const { values } = useFormikContext<FormFields & Record<string, string>>();

  return (
    <>
      {visibleConfigs.map((config, index) => {
        const changed = isConfigChanged(
          config.label,
          values,
          config.defaultValue,
        );
        return (
          <Fragment key={config.label}>
            <FormikField
              {...(config.input?.type === "select"
                ? { component: Select }
                : { type: "text", placeholder: config.defaultValue })}
              label={
                <>
                  {changed ? (
                    <Icon name="status-in-progress-small u-sh-3 u-sh1--right" />
                  ) : null}
                  {config.label}
                </>
              }
              name={config.label}
              help={config.description}
              helpAfterLabel
              stacked
              stackedFieldColumns={4}
              stackedLabelColumns={5}
              labelClassName="u-no-padding--top u-no-margin--bottom u-sv1"
              helpClassName="u-no-margin--bottom"
              wrapperClassName="stack__list-row"
              className="u-no-margin--bottom stack__list-field"
              {...config.input}
            />
            {index < visibleConfigs.length - 1 ? (
              <hr className="p-rule--muted u-no-margin--bottom" />
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
};

export default StackList;
