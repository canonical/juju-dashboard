import { Stepper, Step } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import { type AddModelFormState, Label, type StepType } from "../types";

type Props = {
  stepDefinitions: Array<{
    key: StepType;
    title: string;
    content: JSX.Element;
  }>;
  currentStepIndex: number;
  handleStepClick: (index: number) => void;
};

const AddModelStepper = ({
  stepDefinitions,
  currentStepIndex,
  handleStepClick,
}: Props): JSX.Element => {
  const { errors, values } = useFormikContext<AddModelFormState>();
  return (
    <Stepper
      variant="horizontal"
      steps={stepDefinitions.map(({ key, title }, index) => {
        const isPrevious = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const hasModelNameError = (index === 0 && errors.modelName) ?? false;
        let label = undefined;
        if (hasModelNameError && isPrevious) {
          if (values.modelName !== "") {
            label = Label.INCORRECT_MODEL_NAME_ERROR;
          } else {
            label = Label.REQUIRED_MODEL_NAME_ERROR;
          }
        }
        const previousIcon = hasModelNameError ? "error" : "success";
        return (
          <Step
            key={key}
            title={title}
            label={label}
            index={index + 1}
            enabled
            hasProgressLine={isPrevious || isCurrent}
            iconName={isPrevious ? previousIcon : "number"}
            handleClick={() => {
              handleStepClick(index);
            }}
          />
        );
      })}
    />
  );
};

export default AddModelStepper;
