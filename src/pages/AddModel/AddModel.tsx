import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import { Formik } from "formik";
import type { FC, JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";

import CheckPermissions from "components/CheckPermissions";
import FormikFormData from "components/FormikFormData";
import { useCanAddModel } from "hooks/useCanAddModel";
import { testId } from "testing/utils";
import urls from "urls";

import MandatoryDetails from "./MandatoryDetails/MandatoryDetails";
import { TestId, StepType, Label, type AddModelFormState } from "./types";

const MODEL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const validationSchema = Yup.object().shape({
  modelName: Yup.string()
    .matches(MODEL_NAME_PATTERN, Label.INCORRECT_MODEL_NAME_ERROR)
    .required("Required"),
});

const stepDefinitions: Array<{
  key: StepType;
  title: string;
  content: JSX.Element;
  formId: string;
}> = [
  {
    key: StepType.MANDATORY_DETAILS,
    formId: StepType.MANDATORY_DETAILS,
    title: "Mandatory Details",
    content: <MandatoryDetails />,
  },
  {
    key: StepType.CONFIGURATION_CONSTRAINTS,
    formId: StepType.CONFIGURATION_CONSTRAINTS,
    title: "Configuration & Constraints (optional)",
    content: <div>Configuration and constraints form goes here.</div>,
  },
  {
    key: StepType.ACCESS_MANAGEMENT,
    formId: StepType.ACCESS_MANAGEMENT,
    title: "Access Management (optional)",
    content: <div>Access management form goes here.</div>,
  },
];

const AddModel: FC = () => {
  const navigate = useNavigate();
  const canCreateModel = useCanAddModel();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleCancel = (): void => {
    void navigate(urls.models.index);
  };

  const handleNextClick = (): void => {
    setCurrentStepIndex((index) => index + 1);
  };

  const handleCreateClick = (): void => {
    // TODO: https://warthogs.atlassian.net/browse/JUJU-9333
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepDefinitions.length - 1;
  const currentStep = stepDefinitions[currentStepIndex];

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
          <Formik<AddModelFormState>
            initialValues={{
              modelName: "",
              cloud: "",
              region: "",
              credential: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleCreateClick}
          >
            <FormikFormData
              onValidate={setIsValid}
              id={currentStep.formId}
              className={currentStep.key}
            >
              {currentStep.content}
            </FormikFormData>
          </Formik>
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
            type="submit"
            form={currentStep.formId}
            disabled={!isValid || true}
          >
            {Label.CREATE_BUTTON}
          </ActionButton>
        </div>
      </VanillaPanel>
    </CheckPermissions>
  );
};

export default AddModel;
