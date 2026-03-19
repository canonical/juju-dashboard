import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import type { FC, JSX } from "react";
import { useNavigate } from "react-router";

import CheckPermissions from "components/CheckPermissions";
import { useQueryParams } from "hooks/useQueryParams";
import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import urls from "urls";

import { TestId, StepType } from "./types";

const stepDefinitions: { key: StepType; title: string; ctaLabel?: string }[] = [
  {
    key: StepType.MANDATORY_DETAILS,
    title: "Mandatory details",
    ctaLabel: "Next",
  },
  {
    key: StepType.CONFIGURATION_CONSTRAINTS,
    title: "Configuration & Constraints (optional)",
    ctaLabel: "Next",
  },
  {
    key: StepType.ACCESS_MANAGEMENT,
    title: "Access management (optional)",
    ctaLabel: "Create model",
  },
];

const steps: StepType[] = [
  StepType.MANDATORY_DETAILS,
  StepType.CONFIGURATION_CONSTRAINTS,
  StepType.ACCESS_MANAGEMENT,
];

const getStepType = (step: null | string): StepType => {
  if (step && steps.includes(step as StepType)) {
    return step as StepType;
  }
  return StepType.MANDATORY_DETAILS;
};

const AddModel: FC = () => {
  const navigate = useNavigate();
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const [queryParams, setQueryParams] = useQueryParams<{
    step: null | string;
  }>({
    step: StepType.MANDATORY_DETAILS,
  });
  const stepType = getStepType(queryParams.step);

  const canCreateModel = !!cloudInfo && Object.keys(cloudInfo).length > 0;
  const currentStepIndex = steps.findIndex((step) => step === stepType);

  const stepContent: Record<StepType, JSX.Element> = {
    [StepType.MANDATORY_DETAILS]: <div>Mandatory details form goes here.</div>,
    [StepType.CONFIGURATION_CONSTRAINTS]: (
      <div>Configuration and constraints form goes here.</div>
    ),
    [StepType.ACCESS_MANAGEMENT]: <div>Access management form goes here.</div>,
  };

  return (
    <CheckPermissions allowed={canCreateModel} {...testId(TestId.COMPONENT)}>
      <VanillaPanel
        className="add-model"
        contentClassName="add-model__content"
        title="Add Model"
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
                  setQueryParams({ step: key });
                }}
              />
            );
          })}
        />
        <div className="add-model__step">{stepContent[stepType]}</div>
        <div className="add-model__footer">
          <Button
            onClick={() => void navigate(urls.models.index)}
            appearance="base"
          >
            Cancel
          </Button>
          {currentStepIndex > 0 ? (
            <Button
              onClick={() => {
                if (currentStepIndex > 0) {
                  setQueryParams({
                    step: steps[currentStepIndex - 1],
                  });
                }
              }}
              appearance="secondary"
            >
              Back
            </Button>
          ) : null}
          <ActionButton
            appearance="positive"
            disabled={currentStepIndex === steps.length - 1}
            onClick={() => {
              if (currentStepIndex < steps.length - 1) {
                setQueryParams({
                  step: steps[currentStepIndex + 1],
                });
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
