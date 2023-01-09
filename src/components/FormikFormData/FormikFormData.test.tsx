import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Field } from "formik";

import FormikFormData from "./FormikFormData";

describe("FormikFormData", () => {
  function generateComponent() {
    const children = <Field type="checkbox" name="test" data-testid="field" />;
    const changeHandler = jest.fn();
    const setupHandler = jest.fn();
    render(
      <Formik
        initialValues={{
          test: false,
        }}
        onSubmit={jest.fn()}
      >
        <FormikFormData onFormChange={changeHandler} onSetup={setupHandler}>
          {children}
        </FormikFormData>
      </Formik>
    );
    return { changeHandler, setupHandler };
  }

  it("renders the supplied children", () => {
    generateComponent();
    expect(screen.getByTestId("field")).toBeInTheDocument();
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
