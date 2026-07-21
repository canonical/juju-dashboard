import {
  type ColSize,
  FormikField,
  Icon,
  Select,
} from "@canonical/react-components";
import type { JSX } from "react";

import SkeletonPlaceholder from "../SkeletonPlaceholder";
import type { ConfigFieldEntry, FieldName } from "../types";
import { InputType, ValueType } from "../types";
import { isConfigChanged } from "../utils";

type Props = {
  visibleFields: ConfigFieldEntry[];
  arrayName: FieldName.CONFIG_FIELDS | FieldName.CONSTRAINT_FIELDS;
  stackedLabelColumns?: ColSize;
  isLoading?: boolean;
};

const StackList = ({
  visibleFields,
  arrayName,
  stackedLabelColumns,
  isLoading = false,
}: Props): JSX.Element => {
  return (
    <>
      {visibleFields.map((entry, index) => {
        const fieldName = `${arrayName}[${entry.arrayIndex}].value`;
        const changed = isConfigChanged(entry);
        return (
          <SkeletonPlaceholder loading={isLoading} key={entry.label}>
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
              disabled={isLoading}
              aria-label={entry.label}
              name={fieldName}
              help={entry.description}
              helpAfterLabel
              stacked
              stackedFieldColumns={4}
              stackedLabelColumns={stackedLabelColumns}
              labelClassName="u-no-padding--top u-no-margin--bottom u-sv1"
              helpClassName="u-no-margin--bottom"
              wrapperClassName="stack__list-row"
              className="u-no-margin--bottom stack__list-field"
              {...entry.input}
            />
            {index < visibleFields.length - 1 ? (
              <hr className="p-rule--muted u-no-margin--bottom" />
            ) : null}
          </SkeletonPlaceholder>
        );
      })}
    </>
  );
};

export default StackList;
