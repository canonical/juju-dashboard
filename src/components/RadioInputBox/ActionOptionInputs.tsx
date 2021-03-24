import { useEffect } from "react";
import { useFormikContext, Field } from "formik";
import classnames from "classnames";

import type {
  ActionOptions,
  ActionOptionValue,
} from "panels/ActionsPanel/ActionsPanel";

import DescriptionSummary from "./DescriptionSummary";

type Props = {
  actionName: string;
  options: ActionOptions;
  onValuesChange: (actionName: string, values: ActionOptionValue) => void;
};

export default function ActionOptionInputs({
  actionName,
  options,
  onValuesChange,
}: Props) {
  const { values } = useFormikContext<ActionOptionValue>();

  useEffect(() => {
    onValuesChange(actionName, values);
  }, [onValuesChange, actionName, values]);

  return (
    <form>
      {options.map((option) => {
        const inputKey = `${actionName}-${option.name}`;
        return (
          <div
            className="radio-input-box__input-group"
            key={`${option.name}InputGroup`}
          >
            <label
              className={classnames("radio-input-box__label", {
                "is-required": option.required,
              })}
              htmlFor={inputKey}
            >
              {option.name}
            </label>
            <Field
              className="radio-input-box__input"
              type="text"
              id={inputKey}
              name={inputKey}
            />
            <DescriptionSummary description={option.description} />
          </div>
        );
      })}
    </form>
  );
}
