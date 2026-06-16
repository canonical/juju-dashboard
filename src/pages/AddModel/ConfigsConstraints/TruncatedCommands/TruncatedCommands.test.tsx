import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";

import * as useTruncatedModule from "hooks/useTruncated";

import TruncatedCommands from "./TruncatedCommands";

describe("TruncatedCommands", () => {
  let useTruncatedSpy: MockInstance;

  beforeEach(() => {
    useTruncatedSpy = vi.spyOn(useTruncatedModule, "default").mockReturnValue({
      ref: { current: null },
      truncated: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render a toggle when the text fits", () => {
    render(
      <TruncatedCommands items={["destroy-controller", "destroy-model"]} />,
    );

    expect(
      screen.queryByTestId("truncated-commands-toggle"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("destroy-controller, destroy-model")).toHaveClass(
      "u-truncate",
    );
  });

  it("renders a show more toggle when the text is truncated", () => {
    useTruncatedSpy.mockReturnValue({
      ref: { current: null },
      truncated: true,
    });
    render(
      <TruncatedCommands
        items={[
          "destroy-controller",
          "destroy-model",
          "detach-storage",
          "remove-application",
        ]}
      />,
    );

    expect(screen.getByTestId("truncated-commands-toggle")).toBeInTheDocument();
  });

  it("toggles between collapsed and expanded text", async () => {
    const user = userEvent.setup();
    useTruncatedSpy.mockReturnValue({
      ref: { current: null },
      truncated: true,
    });
    render(
      <TruncatedCommands
        items={[
          "destroy-controller",
          "destroy-model",
          "detach-storage",
          "remove-application",
        ]}
      />,
    );

    const content = screen.getByText(
      "destroy-controller, destroy-model, detach-storage, remove-application",
    );
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(content).toHaveClass("u-truncate");

    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(content).not.toHaveClass("u-truncate");
    expect(useTruncatedSpy).toHaveBeenLastCalledWith(false);
  });
});
