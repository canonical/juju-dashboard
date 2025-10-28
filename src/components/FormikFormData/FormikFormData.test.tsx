import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Field } from "formik";
import type { Mock } from "vitest";
import { vi } from "vitest";

import FormikFormData from "./FormikFormData";

const TEST_ID = "field";

describe("FormikFormData", () => {
  function generateComponent(): {
    changeHandler: Mock;
    setupHandler: Mock;
  } {
    const children = (
      <Field type="checkbox" name="test" data-testid={TEST_ID} />
    );
    const changeHandler = vi.fn();
    const setupHandler = vi.fn();
    render(
      <Formik
        initialValues={{
          test: false,
        }}
        onSubmit={vi.fn()}
      >
        <FormikFormData onFormChange={changeHandler} onSetup={setupHandler}>
          {children}
        </FormikFormData>
      </Formik>,
    );
    return { changeHandler, setupHandler };
  }

  it("renders the supplied children", () => {
    generateComponent();
    expect(screen.getByTestId(TEST_ID)).toBeInTheDocument();
  });

  it("emits change events for the form", async () => {
    const { changeHandler } = generateComponent();
    // Gets called once on initial render.
    expect(changeHandler).toHaveBeenCalledTimes(1);
    await userEvent.type(screen.getByRole("checkbox"), "test");
    expect(changeHandler).toHaveBeenCalledTimes(2);
  });

  it("emits a setup event for the form", async () => {
    const { setupHandler } = generateComponent();
    expect(setupHandler).toHaveBeenCalledTimes(1);
  });
});
