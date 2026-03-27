import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import AutocompleteInput from "./AutocompleteInput";

describe("AutocompleteInput", () => {
  it("initially hides the suggestions", () => {
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
      />,
    );
    expect(
      screen.queryByRole("option", { name: "Option One" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Option Two" }),
    ).not.toBeInTheDocument();
  });

  it("displays the suggestions when clicking on the field", async () => {
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
      />,
    );
    await userEvent.click(
      screen.getByRole("textbox", { name: "auto complete" }),
    );
    expect(
      screen.getByRole("option", { name: "Option One" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option Two" }),
    ).toBeInTheDocument();
  });

  it("filters the suggestions by the input text", async () => {
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          // This should be matched by its value.
          { label: "Option One", value: "option1" },
          // This should be matched by its label.
          { label: "Option 1", value: "option-another-one" },
          { label: "Option Two", value: "option2" },
        ]}
      />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "auto complete" }),
      "1",
    );
    expect(
      screen.getByRole("option", { name: "Option One" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Option Two" }),
    ).not.toBeInTheDocument();
  });

  it("does not display the dropdown if there are no suggestions", async () => {
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
      />,
    );
    const input = screen.getByRole("textbox", { name: "auto complete" });
    await userEvent.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.type(input, "x", { skipClick: true });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates the input if a suggestion is clicked", async () => {
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
      />,
    );
    await userEvent.click(
      screen.getByRole("textbox", { name: "auto complete" }),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Option One" }));
    expect(screen.getByRole("textbox", { name: "auto complete" })).toHaveValue(
      "option1",
    );
    // The dropdown should have closed.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls the callback when the value changes in the input", async () => {
    const onValueChanged = vi.fn();
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onValueChanged={onValueChanged}
      />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "auto complete" }),
      "new val",
    );
    expect(onValueChanged).toHaveBeenCalledWith("new val");
  });

  it("calls the callback when a suggestion is clicked", async () => {
    const onValueChanged = vi.fn();
    renderComponent(
      <AutocompleteInput
        name="auto-complete"
        label="auto complete"
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onValueChanged={onValueChanged}
      />,
    );
    await userEvent.click(
      screen.getByRole("textbox", { name: "auto complete" }),
    );
    await userEvent.click(screen.getByRole("option", { name: "Option One" }));
    expect(onValueChanged).toHaveBeenCalledWith("option1");
  });
});
