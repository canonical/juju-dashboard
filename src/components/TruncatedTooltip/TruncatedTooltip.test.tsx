import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TruncatedTooltip from "./TruncatedTooltip";
import { UserEvent } from "@testing-library/user-event";

describe("TruncatedTooltip", () => {
  const offsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );
  const scrollWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    jest.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    if (offsetWidth) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
    }
    if (scrollWidth) {
      Object.defineProperty(HTMLElement.prototype, "scrollWidth", scrollWidth);
    }
    jest.useRealTimers();
  });

  it("hides the tooltip if the content fits", async () => {
    const content = "Some content";
    render(
      <TruncatedTooltip message="Tooltip content">{content}</TruncatedTooltip>,
    );
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText(content));
      jest.runAllTimers();
    });
    expect(screen.getByTestId("tooltip-portal")).toHaveClass("u-hide");
  });

  it("displays the tooltip if the content is truncated", async () => {
    const content = "Some content that is too long";
    // jsdom does not implement the resize observer or element dimensions so the
    // best we can do is mock the attributes we're using to check if the content
    // is truncated.
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 200,
    });
    render(
      <TruncatedTooltip message="Tooltip content">{content}</TruncatedTooltip>,
    );
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText(content));
      jest.runAllTimers();
    });
    expect(screen.getByTestId("tooltip-portal")).not.toHaveClass("u-hide");
  });
});
