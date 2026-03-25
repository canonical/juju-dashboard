import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import type { FC, JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import CheckPermissions from "components/CheckPermissions";
import { useCanAddModel } from "hooks/useCanAddModel";
import { testId } from "testing/utils";
import urls from "urls";

import { TestId, StepType, Label } from "./types";

const stepDefinitions: {
  key: StepType;
  title: string;
  ctaLabel?: string;
  content: JSX.Element;
}[] = [
  {
    key: StepType.MANDATORY_DETAILS,
    title: "Mandatory details",
    ctaLabel: Label.NEXT_BUTTON,
    content: <div>Mandatory details form goes here.</div>,
  },
  {
    key: StepType.CONFIGURATION_CONSTRAINTS,
    title: "Configuration & Constraints (optional)",
    ctaLabel: Label.NEXT_BUTTON,
    content: <div>Configuration and constraints form goes here.</div>,
  },
  {
    key: StepType.ACCESS_MANAGEMENT,
    title: "Access management (optional)",
    ctaLabel: Label.CREATE_BUTTON,
    content: <div>Access management form goes here.</div>,
  },
];

const AddModel: FC = () => {
  const navigate = useNavigate();
  const canCreateModel = useCanAddModel();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return (
    <CheckPermissions allowed={canCreateModel} {...testId(TestId.COMPONENT)}>
      <VanillaPanel
        className="add-model"
        contentClassName="add-model__content"
        title={Label.TITLE}
        {...testId(TestId.COMPONENT)}
        stickyHeader
      >
        <Stepper
          variant="horizontal"
          steps={stepDefinitions.map(({ key, title }, index) => {
            const isPrevious = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <Step
                key={key}
                title={title}
                index={index + 1}
                enabled
                hasProgressLine={isPrevious || isCurrent}
                iconName={isPrevious ? "success" : "number"}
                handleClick={() => {
                  setCurrentStepIndex(index);
                }}
              />
            );
          })}
        />
        <div className="add-model__step" {...testId(TestId.ADD_MODEL_CONTENT)}>
          {stepDefinitions[currentStepIndex].content}
        </div>
        <div className="add-model__footer">
          <Button
            onClick={() => void navigate(urls.models.index)}
            appearance="base"
          >
            {Label.CANCEL_BUTTON}
          </Button>
          {currentStepIndex > 0 ? (
            <Button
              onClick={() => {
                setCurrentStepIndex(currentStepIndex - 1);
              }}
              appearance="secondary"
            >
              {Label.BACK_BUTTON}
            </Button>
          ) : null}
          <ActionButton
            appearance="positive"
            disabled={currentStepIndex === stepDefinitions.length - 1}
            onClick={() => {
              if (currentStepIndex < stepDefinitions.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
              }
            }}
          >
            {stepDefinitions[currentStepIndex].ctaLabel}
          </ActionButton>
        </div>
      </VanillaPanel>
    </CheckPermissions>
  );
};

export default AddModel;
