import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { InputMode } from "pages/AddModel/types";
import { renderComponent } from "testing/utils";

import { FieldName } from "../types";

import ConfirmSwitchModal from "./ConfirmSwitchModal";

describe("ConfirmSwitchModal", () => {
  let initialValues: {
    [FieldName.CONFIG_YAML]: string;
    [FieldName.CONFIG_INPUT_MODE]: InputMode;
  };

  beforeEach(() => {
    initialValues = {
      [FieldName.CONFIG_YAML]: "",
      [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML,
    };
  });

  it("renders the modal with correct labels", () => {
    renderComponent(
      <Formik initialValues={initialValues} onSubmit={vi.fn()}>
        <ConfirmSwitchModal onClose={vi.fn()} />
      </Formik>,
    );
    expect(
      screen.getByText("YAML configuration will be lost"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keep editing in YAML" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discard and switch" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    let formValues = null;
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          [FieldName.CONFIG_YAML]: "default-space: my-space",
        }}
        onSubmit={vi.fn()}
      >
        {({ values }) => {
          formValues = values;
          return <ConfirmSwitchModal onClose={onClose} />;
        }}
      </Formik>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Keep editing in YAML" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(formValues?.[FieldName.CONFIG_YAML]).toBe("default-space: my-space");
    expect(formValues?.[FieldName.CONFIG_INPUT_MODE]).toBe(InputMode.YAML);
  });

  it("clears YAML and switches to list mode when confirm button is clicked", async () => {
    const onClose = vi.fn();
    let formValues = null;
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          [FieldName.CONFIG_YAML]: "default-space: my-space",
        }}
        onSubmit={vi.fn()}
      >
        {({ values }) => {
          formValues = values;
          return <ConfirmSwitchModal onClose={onClose} />;
        }}
      </Formik>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Discard and switch" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(formValues?.[FieldName.CONFIG_YAML]).toBe("");
    expect(formValues?.[FieldName.CONFIG_INPUT_MODE]).toBe(InputMode.LIST);
  });
});
