import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import useDebounce from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 250));
    expect(result.current).toBe("hello");
  });

  it("debounces updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 250 } },
    );

    expect(result.current).toBe("hello");

    rerender({ value: "world", delay: 250 });
    expect(result.current).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("world");
  });

  it("cancels pending updates on unmount", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 250 } },
    );

    rerender({ value: "world", delay: 250 });
    unmount();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("hello");
  });

  it("respects custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 100 } },
    );

    rerender({ value: "world", delay: 100 });
    expect(result.current).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("world");
  });
});
