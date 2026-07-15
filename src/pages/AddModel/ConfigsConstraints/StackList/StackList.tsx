import { FormikField, Icon, Select } from "@canonical/react-components";
import { Fragment, type JSX } from "react";

import type { ConfigFieldEntry, FieldName } from "../types";
import { InputType, ValueType } from "../types";
import { isConfigChanged } from "../utils";

type Props = {
  visibleFields: ConfigFieldEntry[];
  arrayName: FieldName.CONFIG_FIELDS | FieldName.CONSTRAINT_FIELDS;
};

const StackList = ({ visibleFields, arrayName }: Props): JSX.Element => {
  return (
    <>
      {visibleFields.map((entry, index) => {
        const fieldName = `${arrayName}[${entry.arrayIndex}].value`;
        const changed = isConfigChanged(entry);
        return (
          <Fragment key={entry.label}>
            <FormikField
              {...(entry.input?.type === InputType.SELECT
                ? { component: Select }
                : {
                    type:
                      entry.valueType === ValueType.NUMBER ? "number" : "text",
                    placeholder: entry.defaultValue,
                  })}
              label={
                <>
                  {changed ? (
                    <Icon name="status-in-progress-small u-sh-3 u-sh1--right" />
                  ) : null}
                  {entry.label}
                </>
              }
              name={fieldName}
              help={entry.description}
              helpAfterLabel
              stacked
              stackedFieldColumns={4}
              stackedLabelColumns={5}
              labelClassName="u-no-padding--top u-no-margin--bottom u-sv1"
              helpClassName="u-no-margin--bottom"
              wrapperClassName="stack__list-row"
              className="u-no-margin--bottom stack__list-field"
              {...entry.input}
            />
            {index < visibleFields.length - 1 ? (
              <hr className="p-rule--muted u-no-margin--bottom" />
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
};

export default StackList;
