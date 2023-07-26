import { render, screen } from "@testing-library/react";

import SegmentedControl from "./SegmentedControl";

describe("SegmentedControl", () => {
  it("shows active button", () => {
    render(
      <SegmentedControl
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton="cloud"
      />
    );
    expect(screen.getByRole("tab", { name: "cloud" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("if no active button is defined then none is selected", () => {
    render(
      <SegmentedControl
        buttons={[
          { children: "status", key: "status" },
          { children: "cloud", key: "cloud" },
          { children: "owner", key: "owner" },
        ]}
        activeButton=""
      />
    );
    expect(screen.getByRole("tab", { name: "cloud" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "status" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "owner" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });
});
