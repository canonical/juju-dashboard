import { mount } from "enzyme";
import { Formik } from "formik";
import { waitForComponentToPaint } from "testing/utils";

import OptionInputs from "./OptionInputs";

describe("OptionInputs", () => {
  const options = [
    {
      name: "fruit",
      description: "yum",
      type: "string",
      required: true,
    },
    {
      name: "veg",
      description: "ehhh",
      type: "string",
      required: false,
    },
  ];

  it("renders the supplied list of options", () => {
    const onValuesChange = jest.fn();
    const wrapper = mount(
      <Formik>
        <OptionInputs
          name="MyAction"
          options={options}
          onValuesChange={onValuesChange}
        />
      </Formik>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("On input value change calls the onValuesChange handler", async () => {
    const onValuesChange = jest.fn();
    const wrapper = mount(
      <Formik
        initialValues={{
          "MyAction-fruit": "",
          "MyAction-veg": "",
        }}
      >
        <OptionInputs
          name="MyAction"
          options={options}
          onValuesChange={onValuesChange}
        />
      </Formik>
    );
    await waitForComponentToPaint(wrapper);
    // Formik fires a change event for the initialValues set.
    expect(onValuesChange).toHaveBeenCalledTimes(1);

    wrapper.find('input[name="MyAction-fruit"]').simulate("change", {
      target: {
        name: "MyAction-fruit",
        value: "foo",
      },
    });

    await waitForComponentToPaint(wrapper);
    expect(onValuesChange).toHaveBeenCalledTimes(2);
    expect(onValuesChange.mock.calls[1]).toEqual([
      "MyAction",
      { "MyAction-fruit": "foo", "MyAction-veg": "" },
    ]);
  });
});
