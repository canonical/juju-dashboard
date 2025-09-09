import { Formik } from "formik";
import { useMemo } from "react";

import OptionInputs from "components/RadioInputBox/OptionInputs";
import type {
  ActionData,
  ActionOptionsType,
  OnValuesChange,
} from "panels/ActionsPanel/types";

type Props = {
  name: string;
  data: ActionData;
  onValuesChange: OnValuesChange;
};

export default function ActionOptions({ name, data, onValuesChange }: Props) {
  const action = data[name];

  const collectedOptions = useMemo(() => {
    const collectOptions: ActionOptionsType = [];
    Object.keys(action.params.properties).forEach((propertyName) => {
      const property = action.params.properties[propertyName];
      const required = action.params.required;
      collectOptions.push({
        name: propertyName,
        description: property.description,
        type: property.type,
        required: Array.isArray(required)
          ? required.includes(propertyName)
          : false,
      });
    });
    return collectOptions;
  }, [action.params.properties, action.params.required]);

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
