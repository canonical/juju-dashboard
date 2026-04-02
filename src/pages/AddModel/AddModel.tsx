import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import type { FC, JSX } from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import CheckPermissions from "components/CheckPermissions";
import { useCanAddModel } from "hooks/useCanAddModel";
import { testId } from "testing/utils";
import urls from "urls";

import MandatoryDetails from "./MandatoryDetails/MandatoryDetails";
import { TestId, StepType, Label, type AddModelFormState } from "./types";

const AddModel: FC = () => {
  const navigate = useNavigate();
  const canCreateModel = useCanAddModel();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formDraft, setFormDraft] = useState<AddModelFormState | null>(null);
  const pendingMandatoryDetailsRef = useRef<AddModelFormState | null>(null);

  const handleCancel = (): void => {
    setFormDraft(null);
    void navigate(urls.models.index);
  };

  const handleNextClick = (): void => {
    if (currentStepIndex === 0 && pendingMandatoryDetailsRef.current) {
      setFormDraft(pendingMandatoryDetailsRef.current);
    }

    setCurrentStepIndex((index) => index + 1);
  };

  const handleMandatoryDetailsChange = (values: AddModelFormState): void => {
    pendingMandatoryDetailsRef.current = values;
  };

  const handleCreateClick = (): void => {
    // TODO: Actually create the model here
  };

  const stepDefinitions: Array<{
    key: StepType;
    title: string;
    content: JSX.Element;
  }> = [
    {
      key: StepType.MANDATORY_DETAILS,
      title: "Mandatory Details",
      content: (
        <MandatoryDetails
          initialValues={formDraft}
          onFormChange={handleMandatoryDetailsChange}
        />
      ),
    },
    {
      key: StepType.CONFIGURATION_CONSTRAINTS,
      title: "Configuration & Constraints (optional)",
      content: <div>Configuration and constraints form goes here.</div>,
    },
    {
      key: StepType.ACCESS_MANAGEMENT,
      title: "Access Management (optional)",
      content: <div>Access management form goes here.</div>,
    },
  ];

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepDefinitions.length - 1;

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
          <Button onClick={handleCancel} appearance="base">
            {Label.CANCEL_BUTTON}
          </Button>
          {!isFirstStep ? (
            <Button
              onClick={() => {
                setCurrentStepIndex((index) => index - 1);
              }}
              appearance="secondary"
            >
              {Label.BACK_BUTTON}
            </Button>
          ) : null}
          {!isLastStep ? (
            <Button
              appearance="secondary"
              type="button"
              onClick={handleNextClick}
            >
              {Label.NEXT_BUTTON}
            </Button>
          ) : null}
          <ActionButton
            appearance="positive"
            disabled
            onClick={handleCreateClick}
          >
            {Label.CREATE_BUTTON}
          </ActionButton>
        </div>
      </VanillaPanel>
    </CheckPermissions>
  );
};

export default AddModel;
