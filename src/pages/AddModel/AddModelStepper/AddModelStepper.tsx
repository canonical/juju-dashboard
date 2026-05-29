import { Stepper, Step } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import { type AddModelFormState, Label, type StepDefinition } from "../types";

type Props = {
  stepDefinitions: StepDefinition[];
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
        let hasModelNameError = false;
        let hasCredentialError = false;
        let label = undefined;
        if (index === 0) {
          if (errors.modelName) {
            hasModelNameError = true;
            label =
              values.modelName !== ""
                ? Label.INCORRECT_MODEL_NAME_ERROR
                : Label.REQUIRED_MODEL_NAME_ERROR;
          }
          if (errors.credential) {
            hasCredentialError = true;
            label = hasModelNameError
              ? `${label} + 1 issue`
              : Label.REQUIRED_CREDENTIAL_ERROR;
          }
        }
        const previousIcon =
          hasModelNameError || hasCredentialError ? "error" : "success";
        return (
          <Step
            key={key}
            title={title}
            label={isPrevious ? label : undefined}
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
