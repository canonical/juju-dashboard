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
    expect(result.current[0]).toBe("hello");
  });

  it("debounces updates", () => {
    const { result } = renderHook(() => useDebounce("hello", 250));

    expect(result.current[0]).toBe("hello");

    act(() => {
      result.current[1]("world");
    });
    expect(result.current[0]).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current[0]).toBe("world");
  });

  it("only applies the last value when updates happen during the delay", () => {
    const { result } = renderHook(() => useDebounce("hello", 250));

    act(() => {
      result.current[1]("first");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current[1]("second");
    });

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(result.current[0]).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe("second");
  });

  it("cancels pending updates on unmount", () => {
    const { result, unmount } = renderHook(() => useDebounce("hello", 250));

    act(() => {
      result.current[1]("world");
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current[0]).toBe("hello");
  });

  it("respects custom delay", () => {
    const { result } = renderHook(() => useDebounce("hello", 100));

    act(() => {
      result.current[1]("world");
    });
    expect(result.current[0]).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBe("hello");

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current[0]).toBe("world");
  });

  it("updates immediately and clears pending debounced updates", () => {
    const { result } = renderHook(() => useDebounce("hello", 250));

    act(() => {
      result.current[1]("delayed");
    });

    act(() => {
      result.current[1]("", { immediate: true });
    });
    expect(result.current[0]).toBe("");

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current[0]).toBe("");
  });

  it("supports function values without invoking them", () => {
    const initialFn = vi.fn(() => "initial");
    const nextFn = vi.fn(() => "next");
    const { result } = renderHook(() => useDebounce(initialFn, 250));

    expect(result.current[0]).toBe(initialFn);

    act(() => {
      result.current[1](nextFn);
    });
    expect(result.current[0]).toBe(initialFn);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current[0]).toBe(nextFn);
    expect(initialFn).not.toHaveBeenCalled();
    expect(nextFn).not.toHaveBeenCalled();
  });
});
