import { render, screen } from "@testing-library/react";
import ButtonGroup, { TestId } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("shows active button", () => {
    render(
      <ButtonGroup
        label="Foo"
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton="cloud"
      />
    );
    expect(screen.getByRole("button", { name: "cloud" })).toHaveClass(
      "is-selected"
    );
  });

  it("if no active button is defined then none is selected", () => {
    render(
      <ButtonGroup
        label="Foo"
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton=""
      />
    );
    expect(document.querySelector(".is-selected")).not.toBeInTheDocument();
  });

  it("renders the supplied label", () => {
    render(
      <ButtonGroup
        label="Foo"
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton="cloud"
      />
    );
    expect(screen.getByTestId(TestId.LABEL)).toHaveTextContent("Foo");
  });

  it("allows the label to be optional", () => {
    render(
      <ButtonGroup
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton="cloud"
      />
    );
    expect(screen.queryByTestId(TestId.LABEL)).not.toBeInTheDocument();
  });

  it("can set the label to not wrap", () => {
    render(
      <ButtonGroup
        activeButton="cloud"
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        label="Foo"
        noWrap
      />
    );
    expect(screen.queryByTestId(TestId.LABEL)).toHaveClass(
      "p-button-group__label--fixed"
    );
  });
});
