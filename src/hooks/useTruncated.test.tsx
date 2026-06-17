import { act, renderHook } from "@testing-library/react";
import type { MockInstance } from "vitest";

import useTruncated, { checkTruncated } from "./useTruncated";

describe("useTruncated", () => {
  const resizeObserver = globalThis.ResizeObserver;
  let observe: MockInstance;

  beforeEach(() => {
    observe = vi.fn();

    globalThis.ResizeObserver = vi.fn(function () {
      return {
        observe,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ResizeObserver;
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = resizeObserver;
  });

  describe("checkTruncated", () => {
    it("returns false when the content fits", () => {
      const element = {
        offsetWidth: 1000,
        scrollWidth: 1000,
      } as HTMLElement;

      expect(checkTruncated(element)).toBe(false);
    });

    it("returns true when the content is truncated", () => {
      const element = {
        offsetWidth: 200,
        scrollWidth: 1000,
      } as HTMLElement;

      expect(checkTruncated(element)).toBe(true);
    });
  });

  it("sets truncated state from the observed element when enabled", () => {
    const element = {
      offsetWidth: 200,
      scrollWidth: 1000,
    } as HTMLElement;

    const { result, rerender } = renderHook(
      ({ enabled }) => useTruncated(enabled),
      { initialProps: { enabled: false } },
    );

    act(() => {
      result.current.ref.current = element;
    });
    rerender({ enabled: true });

    expect(result.current.truncated).toBe(true);
    expect(observe).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(element);
  });

  it("does not observe when disabled", () => {
    const { result } = renderHook(() => useTruncated(false));
    expect(result.current.truncated).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });
});
