import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import type { MockInstance } from "vitest";

import * as useTruncatedModule from "hooks/useTruncated";

import TruncatedTooltip from "./TruncatedTooltip";

// The tooltip portal test id is defined in react-components.
const TOOLTIP_PORTAL_TEST_ID = "tooltip-portal";

describe("TruncatedTooltip", () => {
  let userEventWithTimers: UserEvent;
  let useTruncatedSpy: MockInstance;

  beforeEach(() => {
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    useTruncatedSpy = vi.spyOn(useTruncatedModule, "default").mockReturnValue({
      ref: { current: null },
      truncated: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("hides the tooltip if the content fits", async () => {
    const content = "Some content";
    render(
      <TruncatedTooltip message="Tooltip content">{content}</TruncatedTooltip>,
    );
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText(content));
      vi.runAllTimers();
    });
    expect(screen.getByTestId(TOOLTIP_PORTAL_TEST_ID)).toHaveClass("u-hide");
  });

  it("displays the tooltip if the content is truncated", async () => {
    const content = "Some content";
    useTruncatedSpy.mockReturnValue({
      ref: { current: null },
      truncated: true,
    });

    render(
      <TruncatedTooltip message="Tooltip content">{content}</TruncatedTooltip>,
    );
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText(content));
      vi.runAllTimers();
    });
    expect(screen.getByTestId(TOOLTIP_PORTAL_TEST_ID)).not.toHaveClass(
      "u-hide",
    );
  });

  it("should render an inner div by default", () => {
    const content = "Some content";
    render(
      <TruncatedTooltip message="Tooltip content">{content}</TruncatedTooltip>,
    );
    const innerElement = screen.getByText(content);
    expect(innerElement.tagName.toLowerCase()).toBe("div");
    expect(innerElement).toHaveClass("u-truncate");
    expect(innerElement.parentElement).toHaveStyle({
      display: "inline-block",
    });
  });

  it("should render an inner custom element type", () => {
    const content = "Some content";
    render(
      <TruncatedTooltip message="Tooltip content" element="button">
        {content}
      </TruncatedTooltip>,
    );
    expect(screen.getByRole("button", { name: content })).toHaveClass(
      "u-truncate",
    );
  });
});
