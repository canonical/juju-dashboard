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
        let label = undefined;
        const labels = [];
        if (index === 0) {
          if (errors.modelName) {
            labels.push(
              values.modelName !== ""
                ? Label.INCORRECT_MODEL_NAME_ERROR
                : Label.REQUIRED_MODEL_NAME_ERROR,
            );
          }
          if (errors.credential) {
            labels.push(Label.REQUIRED_CREDENTIAL_ERROR);
          }
          if (labels.length > 0) {
            [label] = labels;
            if (labels.length > 1) {
              label = `${label} + ${labels.length - 1} issue`;
            }
          }
        }
        const previousIcon = label ? "error" : "success";
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
