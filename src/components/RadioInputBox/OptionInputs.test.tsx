import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

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
    const { container } = render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <OptionInputs
          name="MyAction"
          options={options}
          onValuesChange={onValuesChange}
        />
      </Formik>,
    );
    expect(container).toMatchSnapshot();
  });

  it("can display a text input", () => {
    const onValuesChange = jest.fn();
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <OptionInputs
          name="MyAction"
          options={options}
          onValuesChange={onValuesChange}
        />
      </Formik>,
    );
    expect(screen.getByRole("textbox", { name: "fruit" })).toBeInTheDocument();
  });

  it("can display a checkbox", () => {
    const onValuesChange = jest.fn();
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <OptionInputs
          name="MyAction"
          options={[
            {
              name: "fruit",
              description: "yum",
              type: "boolean",
              required: true,
            },
          ]}
          onValuesChange={onValuesChange}
        />
      </Formik>,
    );
    expect(screen.getByRole("checkbox", { name: "fruit" })).toBeInTheDocument();
  });

  it("On input value change calls the onValuesChange handler", async () => {
    const onValuesChange = jest.fn();
    render(
      <Formik
        initialValues={{
          "MyAction-fruit": "",
          "MyAction-veg": "",
        }}
        onSubmit={jest.fn()}
      >
        <OptionInputs
          name="MyAction"
          options={options}
          onValuesChange={onValuesChange}
        />
      </Formik>,
    );
    // Formik fires a change event for the initialValues set.
    expect(onValuesChange).toHaveBeenCalledTimes(1);
    await userEvent.type(screen.getByRole("textbox", { name: "fruit" }), "foo");
    // On change gets called for each letter that is typed into the textbox.
    expect(onValuesChange).toHaveBeenCalledTimes(4);
    expect(onValuesChange.mock.calls[3]).toEqual([
      "MyAction",
      { "MyAction-fruit": "foo", "MyAction-veg": "" },
    ]);
  });
});
