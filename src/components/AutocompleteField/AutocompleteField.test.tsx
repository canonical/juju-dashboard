import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import AutocompleteField from "./AutocompleteField";

describe("AutocompleteField", () => {
  it("should display the input and options", async () => {
    renderComponent(
      <Formik initialValues={{ "auto-complete": "" }} onSubmit={vi.fn()}>
        <AutocompleteField
          options={[{ label: "Option One", value: "option1" }]}
          label="auto complete"
          name="auto-complete"
        />
      </Formik>,
    );
    const input = screen.getByRole("textbox", { name: "auto complete" });
    expect(input).toBeInTheDocument();
    await userEvent.click(input);
    expect(screen.getByRole("option", { name: "Option One" })).toHaveAttribute(
      "data-value",
      "option1",
    );
  });

  it("should update value in formik", async () => {
    const onSubmit = vi.fn();
    renderComponent(
      <Formik initialValues={{ "auto-complete": "" }} onSubmit={onSubmit}>
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <AutocompleteField
              options={[{ label: "Option One", value: "option1" }]}
              label="auto complete"
              name="auto-complete"
            />
          </form>
        )}
      </Formik>,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "auto complete" }),
      "something{enter}",
    );
    expect(onSubmit).toHaveBeenCalledWith(
      { "auto-complete": "something" },
      expect.any(Object),
    );
  });
});
