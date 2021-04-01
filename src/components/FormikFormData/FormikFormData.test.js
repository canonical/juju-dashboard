import { mount } from "enzyme";
import { Formik, Field } from "formik";
import { waitForComponentToPaint } from "testing/utils";

import FormikFormData from "./FormikFormData";

describe("FormikFormData", () => {
  function generateComponent() {
    const children = <Field type="checkbox" name="test" />;
    const changeHandler = jest.fn();
    const setupHandler = jest.fn();
    const wrapper = mount(
      <Formik
        initialValues={{
          test: false,
        }}
      >
        <FormikFormData onFormChange={changeHandler} onSetup={setupHandler}>
          {children}
        </FormikFormData>
      </Formik>
    );
    return { children, wrapper, changeHandler, setupHandler };
  }

  it("renders the supplied children", () => {
    const { wrapper, children } = generateComponent();
    expect(wrapper.contains(children)).toBe(true);
  });

  it("emits change events for the form", async () => {
    const { changeHandler, wrapper } = generateComponent();
    // Gets called once on initial render.
    await waitForComponentToPaint(wrapper);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    wrapper.find('input[name="test"]').simulate("change", {
      target: { name: "test", value: true },
    });
    await waitForComponentToPaint(wrapper);
    expect(changeHandler).toHaveBeenCalledTimes(2);
  });

  it("emits a setup event for the form", async () => {
    const { setupHandler } = generateComponent();
    expect(setupHandler).toHaveBeenCalledTimes(1);
  });
});
