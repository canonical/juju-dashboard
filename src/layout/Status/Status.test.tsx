import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import Status from "./Status";
import { StatusView } from "./types";

vi.mock("components/JujuCLI", () => ({
  __esModule: true,
  default: () => {
    return <div className="webcli" data-testid="webcli"></div>;
  },
}));

describe("Status", () => {
  it("handles no status content", () => {
    renderComponent(<Status />);
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });

  it("displays the CLI", () => {
    renderComponent(<Status status={StatusView.CLI} />);
    expect(screen.getByTestId("webcli")).toBeInTheDocument();
  });
});
