import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { DisableType, FieldName } from "../ConfigsConstraints/types";
import {
  InputMode,
  type AddModelFormState,
  Label,
  type StepDefinition,
  StepType,
} from "../types";

import AddModelStepper from "./AddModelStepper";

describe("AddModelStepper", () => {
  let stepDefinitions: StepDefinition[];
  let initialValues: AddModelFormState;

  const getMandatoryDetailsStep = (): HTMLElement => {
    const step = screen.getByText("Mandatory Details").closest(".step");
    expect(step).not.toBeNull();
    return step as HTMLElement;
  };

  beforeEach(() => {
    stepDefinitions = [
      {
        key: StepType.MANDATORY_DETAILS,
        title: "Mandatory Details",
        content: <div />,
      },
      {
        key: StepType.CONFIGURATION_CONSTRAINTS,
        title: "Configuration & Constraints (optional)",
        content: <div />,
      },
    ];

    initialValues = {
      modelName: "",
      cloud: "",
      region: "",
      credential: "",
      [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
      [FieldName.CONSTRAINT_INPUT_MODE]: InputMode.LIST,
      [FieldName.CONFIG_YAML]: "",
      [FieldName.CONSTRAINT_YAML]: "",
      [FieldName.DISABLED_COMMANDS]: DisableType.NONE,
    };
  });

  it("renders properly", () => {
    render(
      <Formik<AddModelFormState>
        initialValues={initialValues}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={0}
          handleStepClick={vi.fn()}
        />
      </Formik>,
    );

    expect(screen.getByText("Mandatory Details")).toBeInTheDocument();
    expect(
      screen.getByText("Configuration & Constraints (optional)"),
    ).toBeInTheDocument();
  });

  it("calls handleStepClick with the step index", async () => {
    const handleStepClick = vi.fn();
    render(
      <Formik<AddModelFormState>
        initialValues={initialValues}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={0}
          handleStepClick={handleStepClick}
        />
      </Formik>,
    );

    await userEvent.click(
      screen.getByText("Configuration & Constraints (optional)"),
    );
    expect(handleStepClick).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("shows the required model name label and an error icon when model name is empty", () => {
    render(
      <Formik<AddModelFormState>
        initialValues={initialValues}
        initialErrors={{ modelName: Label.REQUIRED_MODEL_NAME_ERROR }}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={1}
          handleStepClick={vi.fn()}
        />
      </Formik>,
    );

    const mandatoryDetailsStep = getMandatoryDetailsStep();
    expect(
      mandatoryDetailsStep.querySelector(".p-icon--error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Label.REQUIRED_MODEL_NAME_ERROR),
    ).toBeInTheDocument();
  });

  it("shows the incorrect model name label and an error icon when model name is invalid", () => {
    render(
      <Formik<AddModelFormState>
        initialValues={
          { ...initialValues, modelName: "-model" } as AddModelFormState
        }
        initialErrors={{ modelName: Label.INCORRECT_MODEL_NAME_ERROR }}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={1}
          handleStepClick={vi.fn()}
        />
      </Formik>,
    );

    const mandatoryDetailsStep = getMandatoryDetailsStep();
    expect(
      mandatoryDetailsStep.querySelector(".p-icon--error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Label.INCORRECT_MODEL_NAME_ERROR),
    ).toBeInTheDocument();
  });

  it("shows the credential label and an error icon when only credential has an error", () => {
    render(
      <Formik<AddModelFormState>
        initialValues={initialValues}
        initialErrors={{ credential: Label.REQUIRED_CREDENTIAL_ERROR }}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={1}
          handleStepClick={vi.fn()}
        />
      </Formik>,
    );

    const mandatoryDetailsStep = getMandatoryDetailsStep();
    expect(
      mandatoryDetailsStep.querySelector(".p-icon--error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Label.REQUIRED_CREDENTIAL_ERROR),
    ).toBeInTheDocument();
  });

  it("shows a combined error label when model name and credential both have errors", () => {
    render(
      <Formik<AddModelFormState>
        initialValues={initialValues}
        initialErrors={{
          modelName: Label.REQUIRED_MODEL_NAME_ERROR,
          credential: Label.REQUIRED_CREDENTIAL_ERROR,
        }}
        onSubmit={vi.fn()}
      >
        <AddModelStepper
          stepDefinitions={stepDefinitions}
          currentStepIndex={1}
          handleStepClick={vi.fn()}
        />
      </Formik>,
    );

    const mandatoryDetailsStep = getMandatoryDetailsStep();

    expect(
      mandatoryDetailsStep.querySelector(".p-icon--error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${Label.REQUIRED_MODEL_NAME_ERROR} + 1 issue`),
    ).toBeInTheDocument();
  });
});
