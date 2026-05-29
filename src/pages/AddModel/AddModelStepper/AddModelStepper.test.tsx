import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { InputMode } from "../ConfigsConstraints/ContentSwitcher/types";
import { DisableType, FieldName } from "../ConfigsConstraints/types";
import { type AddModelFormState, StepType } from "../types";

import AddModelStepper from "./AddModelStepper";

const stepDefinitions = [
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

const initialValues: AddModelFormState = {
  modelName: "",
  cloud: "",
  region: "",
  credential: "",
  [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
  [FieldName.CONFIG_YAML]: "",
  [FieldName.DISABLED_COMMANDS]: DisableType.NONE,
};

describe("AddModelStepper", () => {
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
    expect(handleStepClick).toHaveBeenCalledWith(1);
    expect(handleStepClick).toHaveBeenCalledTimes(1);
  });
});
