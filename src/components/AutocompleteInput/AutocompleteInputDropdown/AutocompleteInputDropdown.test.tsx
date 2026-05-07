import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import AutocompleteInputDropdown from "./AutocompleteInputDropdown";

describe("AutocompleteInputDropdown", () => {
  it("displays options", () => {
    renderComponent(
      <AutocompleteInputDropdown
        highlightedOptionIndex={0}
        id="abc"
        setHighlightedOptionIndex={vi.fn()}
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onSelectItem={vi.fn()}
        isOpen
      />,
    );
    expect(
      screen.getByRole("option", { name: "Option One" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option Two" }),
    ).toBeInTheDocument();
  });

  it("calls the callback when an option is clicked", async () => {
    const onSelectItem = vi.fn();
    renderComponent(
      <AutocompleteInputDropdown
        highlightedOptionIndex={0}
        id="abc"
        setHighlightedOptionIndex={vi.fn()}
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onSelectItem={onSelectItem}
        isOpen
      />,
    );
    await userEvent.click(screen.getByRole("option", { name: "Option One" }));
    expect(onSelectItem).toHaveBeenCalledWith("option1");
  });

  it("displays an item as highlighted", async () => {
    const onSelectItem = vi.fn();
    renderComponent(
      <AutocompleteInputDropdown
        highlightedOptionIndex={1}
        id="abc"
        setHighlightedOptionIndex={vi.fn()}
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onSelectItem={onSelectItem}
        isOpen
      />,
    );
    const option = screen.getByRole("option", { name: "Option Two" });
    expect(option).toHaveClass("highlight");
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "abc-option-1",
    );
  });

  it("sets the highlighted index when hovered", async () => {
    const setHighlightedOptionIndex = vi.fn();
    renderComponent(
      <AutocompleteInputDropdown
        highlightedOptionIndex={0}
        id="abc"
        setHighlightedOptionIndex={setHighlightedOptionIndex}
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onSelectItem={vi.fn()}
        isOpen
      />,
    );
    await userEvent.hover(screen.getByRole("option", { name: "Option Two" }));
    expect(setHighlightedOptionIndex).toHaveBeenCalledWith(1);
  });

  it("scrolls to items that are off the screen", async () => {
    const scrollSpy = vi.spyOn(window.HTMLElement.prototype, "scrollIntoView");
    renderComponent(
      <div style={{ height: "20px", overflow: "scroll" }}>
        <AutocompleteInputDropdown
          highlightedOptionIndex={1}
          id="abc"
          setHighlightedOptionIndex={vi.fn()}
          options={[
            { label: "Option One", value: "option1" },
            { label: "Option Two", value: "option2" },
          ]}
          onSelectItem={vi.fn()}
          isOpen
        />
        ,
      </div>,
    );
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledOnce();
    });
  });
});
