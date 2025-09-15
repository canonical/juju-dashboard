import { Formik } from "formik";
import type { JSX } from "react";
import { useMemo } from "react";

import OptionInputs from "components/RadioInputBox/OptionInputs";
import type {
  ActionData,
  ActionOptionsType,
  ActionParams,
  OnValuesChange,
} from "panels/ActionsPanel/types";

type Props = {
  name: string;
  data: ActionData;
  onValuesChange: OnValuesChange;
};

export default function ActionOptions({
  name,
  data,
  onValuesChange,
}: Props): JSX.Element {
  const action = data[name];
  const { properties, required } = action.params as ActionParams;

  const collectedOptions = useMemo(() => {
    const collectOptions: ActionOptionsType = [];
    Object.keys(properties).forEach((propertyName) => {
      const property = properties[propertyName];
      collectOptions.push({
        name: propertyName,
        description: property.description,
        type: property.type,
        required: required ? required.includes(propertyName) : false,
      });
    });
    return collectOptions;
  }, [properties, required]);

  const initialValues = useMemo(() => {
    const intial: { [key: string]: string } = {};
    collectedOptions.forEach((option) => {
      intial[`${name}-${option.name}`] = "";
    });
    return intial;
  }, [name, collectedOptions]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {
        // Submit event is not used.
      }}
      key={name}
    >
      <OptionInputs
        name={name}
        options={collectedOptions}
        onValuesChange={onValuesChange}
      />
    </Formik>
  );
}
