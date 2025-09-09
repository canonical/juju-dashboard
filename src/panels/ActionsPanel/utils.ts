import type { MutableRefObject } from "react";

import type {
  ActionData,
  ActionOptionValues,
  ActionOptionValue,
  ActionParams,
} from "./types";

type ValidationFnProps = (
  selectedAction: string,
  optionValues: ActionOptionValues,
) => boolean;

type RequiredPopulated = (
  selectedAction: string,
  actionData: ActionData,
  optionValues: ActionOptionValues,
) => boolean;

export function onValuesChange(
  actionName: string,
  values: ActionOptionValue,
  optionValues: MutableRefObject<ActionOptionValues>,
) {
  const updatedValues: ActionOptionValue = {};
  Object.keys(values).forEach((key) => {
    // Use toString to convert booleans to strings as this is what the API requires.
    updatedValues[key.replace(`${actionName}-`, "")] = values[key].toString();
  });

  optionValues.current = {
    ...optionValues.current,
    [actionName]: updatedValues,
  };
}

export function enableSubmit(
  selectedAction: string | null,
  selectedUnits: string[],
  actionData: ActionData,
  optionsValues: MutableRefObject<ActionOptionValues>,
  setDisableSubmit: (disable: boolean) => void,
) {
  if (selectedAction !== null && selectedAction && selectedUnits.length > 0) {
    if (hasNoOptions(selectedAction, optionsValues.current)) {
      setDisableSubmit(false);
      return;
    }
    if (
      requiredPopulated(selectedAction, actionData, optionsValues.current) &&
      optionsValidate(selectedAction, optionsValues.current)
    ) {
      setDisableSubmit(false);
      return;
    }
  }
  setDisableSubmit(true);
}

const hasNoOptions: ValidationFnProps = (selected, optionValues) => {
  // If there are no options stored then it doesn't have any.
  const values = selected in optionValues ? optionValues[selected] : null;
  if (!values) {
    return true;
  }
  return Object.keys(optionValues[selected]).length === 0;
};

const requiredPopulated: RequiredPopulated = (
  selected,
  actionData,
  optionsValues,
) => {
  const required: ActionParams["required"] =
    actionData[selected].params.required;
  if (!required) {
    return true;
  }
  if (required.length === 0) {
    return true;
  }
  return !required.some((option) => {
    const optionType = actionData[selected].params.properties[option].type;
    const value = optionsValues[selected][option];
    return optionType === "boolean" ? value !== "true" : value === "";
  });
};

const optionsValidate: ValidationFnProps = (_selected, _optionsValues) => {
  // XXX TODO
  return true;
};
