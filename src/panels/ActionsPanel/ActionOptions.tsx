import { useMemo } from "react";
import { Formik } from "formik";

import OptionInputs from "components/RadioInputBox/OptionInputs";

import type {
  ActionData,
  ActionOptionsType,
  OnValuesChange,
} from "panels/ActionsPanel/ActionsPanel";

type Props = {
  name: string;
  data: ActionData;
  onValuesChange: OnValuesChange;
};

export default function ActionOptions({ name, data, onValuesChange }: Props) {
  const action = data[name];

  const collectedOptions = useMemo(() => {
    const collectOptions: ActionOptionsType = [];
    Object.keys(action.params.properties).forEach((name) => {
      const property = action.params.properties[name];
      collectOptions.push({
        name: name,
        description: property.description,
        type: property.type,
        required: action.params.required.includes(name),
      });
    });
    return collectOptions;
  }, [action.params.properties, action.params.required]);

  const initialValues = useMemo(() => {
    const initialValues: { [key: string]: string } = {};
    collectedOptions.forEach((option) => {
      initialValues[`${name}-${option.name}`] = "";
    });
    return initialValues;
  }, [name, collectedOptions]);

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} key={name}>
      <OptionInputs
        name={name}
        options={collectedOptions}
        onValuesChange={onValuesChange}
      />
    </Formik>
  );
}
