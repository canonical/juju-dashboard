import { act, renderHook } from "@testing-library/react";
import log from "loglevel";
import { vi } from "vitest";

import useLocalStorage from "./useLocalStorage";

vi.mock("loglevel", async () => {
  const actual = await vi.importActual("loglevel");
  return {
    ...actual,
    error: vi.fn(),
  };
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.spyOn(log, "error").mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("can set an initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [value] = result.current;
    expect(value).toBe("init-val");
  });

  it("can restore an existing value", () => {
    localStorage.setItem("test-key", JSON.stringify("restored-val"));
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [value] = result.current;
    expect(value).toBe("restored-val");
  });

  it("can handle JSON errors when restoring an existing value", () => {
    localStorage.setItem("test-key", "not json");
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    expect(log.error).toHaveBeenCalledWith(
      "Unable to parse local storage:",
      expect.any(Error),
    );
    const [value] = result.current;
    expect(value).toBe("init-val");
  });

  it("can change the value", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [, setValue] = result.current;
    act(() => {
      setValue("new-val");
    });
    const [value] = result.current;
    expect(value).toBe("new-val");
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("new-val");
  });

  it("can handle JSON errors when updating the value", () => {
    localStorage.setItem("test-key", JSON.stringify("init-val"));
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [, setValue] = result.current;
    // Create a value that can't be JSON stringified:
    const circular: Record<string, unknown> = {};
    circular.a = { b: circular };
    act(() => {
      setValue(circular as unknown as string);
    });
    expect(log.error).toHaveBeenCalledWith(expect.any(Error));
    const [value] = result.current;
    expect(value).toBe("init-val");
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("init-val");
  });
});
