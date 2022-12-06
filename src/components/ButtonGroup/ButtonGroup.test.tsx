import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ButtonGroup, { TestId } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("shows active button", () => {
    const setActiveButton = jest.fn();
    render(
      <ButtonGroup
        label="Foo"
        buttons={["status", "cloud", "owner"]}
        activeButton="cloud"
        setActiveButton={setActiveButton}
      />
    );
    expect(screen.getByRole("button", { name: "view by cloud" })).toHaveClass(
      "is-selected"
    );
  });

  it("if no active button is defined then none is selected", () => {
    const setActiveButton = jest.fn();
    render(
      <ButtonGroup
        label="Foo"
        buttons={["status", "cloud", "owner"]}
        activeButton=""
        setActiveButton={setActiveButton}
      />
    );
    expect(document.querySelector(".is-selected")).not.toBeInTheDocument();
  });

  it("calls to set active button on click", async () => {
    const setActiveButton = jest.fn();
    render(
      <ButtonGroup
        label="Foo"
        buttons={["status", "cloud", "owner"]}
        activeButton="cloud"
        setActiveButton={setActiveButton}
      />
    );
    expect(screen.getByRole("button", { name: "view by cloud" })).toHaveClass(
      "is-selected"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "view by owner" })
    );
    expect(setActiveButton.mock.calls.length).toBe(1);
    expect(setActiveButton.mock.calls[0]).toEqual(["owner"]);
    // We don't check that the UI updated because it has no internal state.
    // It requires a parent to re-render it with a new selected group.
  });

  it("renders the supplied label", () => {
    const setActiveButton = jest.fn();
    render(
      <ButtonGroup
        label="Foo"
        buttons={["status", "cloud", "owner"]}
        activeButton="cloud"
        setActiveButton={setActiveButton}
      />
    );
    expect(screen.getByTestId(TestId.LABEL)).toHaveTextContent("Foo");
  });

  it("allows the label to be optional", () => {
    const setActiveButton = jest.fn();
    render(
      <ButtonGroup
        buttons={["status", "cloud", "owner"]}
        activeButton="cloud"
        setActiveButton={setActiveButton}
      />
    );
    expect(screen.queryByTestId(TestId.LABEL)).not.toBeInTheDocument();
  });
});
