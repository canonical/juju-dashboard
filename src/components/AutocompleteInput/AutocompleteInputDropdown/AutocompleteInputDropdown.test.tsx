import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import AutocompleteInputDropdown from "./AutocompleteInputDropdown";

describe("AutocompleteInputDropdown", () => {
  it("displays options", () => {
    renderComponent(
      <AutocompleteInputDropdown
        options={[
          { label: "Option One", value: "option1" },
          { label: "Option Two", value: "option2" },
        ]}
        onSelectItem={vi.fn()}
        isOpen
      />,
    );
    expect(screen.getByRole("option", { name: "Option One" })).toHaveAttribute(
      "data-value",
      "option1",
    );
    expect(screen.getByRole("option", { name: "Option Two" })).toHaveAttribute(
      "data-value",
      "option2",
    );
  });

  it("calls the callback when an option is clicked", async () => {
    const onSelectItem = vi.fn();
    renderComponent(
      <AutocompleteInputDropdown
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
});
