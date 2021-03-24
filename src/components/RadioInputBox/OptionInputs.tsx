import { useEffect } from "react";
import { useFormikContext, Field } from "formik";
import classnames from "classnames";

import DescriptionSummary from "./DescriptionSummary";

type Options = OptionDetails[];

type OptionDetails = {
  name: string;
  description: string;
  type: string;
  required: boolean;
};

type OptionValue = {
  [key: string]: string;
};

type Props = {
  name: string;
  options: Options;
  onValuesChange: (name: string, values: OptionValue) => void;
};

export default function OptionInputs({ name, options, onValuesChange }: Props) {
  const { values } = useFormikContext<OptionValue>();

  useEffect(() => {
    onValuesChange(name, values);
  }, [onValuesChange, name, values]);

  return (
    <form>
      {options.map((option) => {
        const inputKey = `${name}-${option.name}`;
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
