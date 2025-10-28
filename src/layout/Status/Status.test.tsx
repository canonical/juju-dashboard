import { screen } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import Status from "./Status";
import { StatusView } from "./types";

const TEST_ID = "webcli";

vi.mock("components/JujuCLI", () => ({
  __esModule: true,
  default: (): JSX.Element => {
    return <div className="webcli" data-testid={TEST_ID}></div>;
  },
}));

describe("Status", () => {
  it("handles no status content", () => {
    renderComponent(<Status />);
    expect(screen.queryByTestId(TEST_ID)).not.toBeInTheDocument();
  });

  it("displays the CLI", () => {
    renderComponent(<Status status={StatusView.CLI} />);
    expect(screen.getByTestId(TEST_ID)).toBeInTheDocument();
  });
});
