import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

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
    const input = screen.getByRole("textbox", { name: "auto complete" });
    await userEvent.click(input);
    expect(
      screen.getByRole("option", { name: "Option Two" }),
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole("textbox", { name: "auto complete" }),
      "1",
      { skipClick: true },
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

  describe("navigation", () => {
    let onSubmit: Mock;
    let onFormKeyDown: Mock;
    beforeEach(() => {
      onSubmit = vi.fn();
      onFormKeyDown = vi.fn();
      renderComponent(
        <form onSubmit={onSubmit} onKeyDown={onFormKeyDown}>
          <AutocompleteInput
            name="auto-complete"
            label="auto complete"
            options={[
              { label: "Option One", value: "option1" },
              { label: "Option Two", value: "option2" },
            ]}
            onValueChanged={vi.fn()}
          />
        </form>,
      );
      act(() => {
        screen.getByRole("textbox", { name: "auto complete" }).focus();
      });
    });

    it("opens the menu if the up key is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      await userEvent.type(input, "{arrowup}", { skipClick: true });
      expect(await screen.findByRole("listbox")).toBeInTheDocument();
    });

    it("opens the menu if the down key is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      await userEvent.type(input, "{arrowdown}");
      expect(screen.queryByRole("listbox")).toBeInTheDocument();
    });

    it("selects the next item if the down arrow is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      expect(
        screen.getByRole("option", { name: "Option One" }),
      ).toHaveAttribute("aria-selected", "false");
      await userEvent.type(input, "{arrowdown}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option One" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.type(input, "{arrowdown}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "true");
    });

    it("selects the previous item if the up arrow is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "false");
      await userEvent.type(input, "{arrowup}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.type(input, "{arrowup}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("selects the next item if tab is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      expect(
        screen.getByRole("option", { name: "Option One" }),
      ).toHaveAttribute("aria-selected", "false");
      await userEvent.type(input, "{tab}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option One" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.type(input, "{tab}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "true");
      // It shouldn't remove focus from the input.
      expect(input).toHaveFocus();
    });

    it("selects the previous item if shift+tab is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "false");
      await userEvent.type(input, "{shift>}{tab}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.type(input, "{shift>}{tab}", { skipClick: true });
      expect(
        screen.getByRole("option", { name: "Option Two" }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("selects an item if the enter key is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      expect(
        screen.getByRole("option", { name: "Option One" }),
      ).toHaveAttribute("aria-selected", "false");
      await userEvent.type(input, "{arrowdown}{enter}", { skipClick: true });
      expect(input).toHaveValue("option1");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      // It shouldn't submit the form.
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("closes the menu if escape is pressed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("allows enter to work normally if the menu is closed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      await userEvent.type(input, "{enter}", { skipClick: true });
      expect(onSubmit).toHaveBeenCalled();
    });

    it("allows tab to work normally if the menu is closed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(input).toHaveFocus();
      await userEvent.type(input, "{tab}", { skipClick: true });
      expect(input).not.toHaveFocus();
    });

    it("allows escape to work normally if the menu is closed", async () => {
      const input = screen.getByRole("textbox", { name: "auto complete" });
      // Close the menu
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(onFormKeyDown).not.toHaveBeenCalled();
      await userEvent.type(input, "{escape}", { skipClick: true });
      expect(onFormKeyDown).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ key: "Escape" }),
      );
    });
  });
});
