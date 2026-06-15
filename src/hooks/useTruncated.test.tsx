import { render, screen } from "@testing-library/react";
import type { JSX } from "react";

import useTruncated from "./useTruncated";

const Harness = ({ enabled = true }): JSX.Element => {
  const { ref, truncated } = useTruncated(enabled);

  return (
    <>
      <span ref={ref}>Some content</span>
      <span data-testid="truncated-state">{truncated.toString()}</span>
    </>
  );
};

describe("useTruncated", () => {
  const offsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );
  const scrollWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );
  const resizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    globalThis.ResizeObserver = vi.fn(() => {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ResizeObserver;
    }) as unknown as typeof ResizeObserver;

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
    globalThis.ResizeObserver = resizeObserver;

    if (offsetWidth) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
    }
    if (scrollWidth) {
      Object.defineProperty(HTMLElement.prototype, "scrollWidth", scrollWidth);
    }
  });

  it("returns false when the content fits", () => {
    render(<Harness />);
    expect(screen.getByTestId("truncated-state")).toHaveTextContent("false");
  });

  it("returns true when the content is truncated", () => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 200,
    });

    render(<Harness />);
    expect(screen.getByTestId("truncated-state")).toHaveTextContent("true");
  });

  it("does not observe when disabled", () => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 200,
    });

    render(<Harness enabled={false} />);
    expect(screen.getByTestId("truncated-state")).toHaveTextContent("false");
  });
});
