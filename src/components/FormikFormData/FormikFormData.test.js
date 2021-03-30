import { mount } from "enzyme";
import { Formik, Field } from "formik";
import { waitForComponentToPaint } from "testing/utils";

import FormikFormData from "./FormikFormData";

describe("FormikFormData", () => {
  function generateComponent() {
    const children = <Field type="checkbox" name="test" />;
    const changeHandler = jest.fn();
    const wrapper = mount(
      <Formik
        initialValues={{
          test: false,
        }}
      >
        <FormikFormData onFormChange={changeHandler}>{children}</FormikFormData>
      </Formik>
    );
    return { children, changeHandler, wrapper };
  }

  it("renders the supplied children", () => {
    const { wrapper, children } = generateComponent();
    expect(wrapper.contains(children)).toBe(true);
  });

  it("emits change events for the form", async () => {
    const { changeHandler, wrapper } = generateComponent();
    // Gets called once on initial render.
    expect(changeHandler).toHaveBeenCalledTimes(1);
    wrapper.find('input[name="test"]').simulate("change", {
      target: { name: "test", checked: true },
    });
    await waitForComponentToPaint(wrapper);
    // It gets re-rendered twice so this gets called twice.
    expect(changeHandler).toHaveBeenCalledTimes(3);
  });
});
