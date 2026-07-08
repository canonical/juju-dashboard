import { FormikField, Icon, Select } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { Fragment, type JSX } from "react";

import type {
  CategoryDefinitionField,
  ConfigFieldValue,
  FormFields,
} from "../types";
import { InputType, ValueType } from "../types";
import { isConfigChanged } from "../utils";

type Props = {
  visibleFields: CategoryDefinitionField[];
};

const StackList = ({ visibleFields }: Props): JSX.Element => {
  const { values } = useFormikContext<
    FormFields & Record<string, ConfigFieldValue>
  >();

  return (
    <>
      {visibleFields.map((field, index) => {
        const changed = isConfigChanged(
          field.label,
          values,
          field.defaultValue,
        );
        return (
          <Fragment key={field.label}>
            <FormikField
              {...(field.input?.type === InputType.SELECT
                ? { component: Select }
                : {
                    type:
                      field.valueType === ValueType.NUMBER ? "number" : "text",
                    placeholder: field.defaultValue,
                  })}
              label={
                <>
                  {changed ? (
                    <Icon name="status-in-progress-small u-sh-3 u-sh1--right" />
                  ) : null}
                  {field.label}
                </>
              }
              name={field.label}
              help={field.description}
              helpAfterLabel
              stacked
              stackedFieldColumns={4}
              stackedLabelColumns={5}
              labelClassName="u-no-padding--top u-no-margin--bottom u-sv1"
              helpClassName="u-no-margin--bottom"
              wrapperClassName="stack__list-row"
              className="u-no-margin--bottom stack__list-field"
              {...field.input}
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
