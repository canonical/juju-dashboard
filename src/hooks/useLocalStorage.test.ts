import { act, renderHook } from "@testing-library/react";

import useLocalStorage from "./useLocalStorage";

describe("useLocalStorage", () => {
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
    const [value] = result.current;
    expect(value).toBe("init-val");
  });

  it("can change the value", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [_value, setValue] = result.current;
    act(() => {
      setValue("new-val");
    });
    const [value] = result.current;
    expect(value).toBe("new-val");
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("new-val");
  });

  it("can handle unchanged value", () => {
    localStorage.setItem("test-key", JSON.stringify("val"));
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    const { result } = renderHook(() => useLocalStorage("test-key", "val"));
    const [value] = result.current;
    expect(value).toBe("val");
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("val");
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("can handle JSON errors when updating the value", () => {
    localStorage.setItem("test-key", JSON.stringify("init-val"));
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "init-val"),
    );
    const [_value, setValue] = result.current;
    // Create a value that can't be JSON stringified:
    const circular: Record<string, unknown> = {};
    circular.a = { b: circular };
    act(() => {
      setValue(circular as unknown as string);
    });
    const [value] = result.current;
    expect(value).toBe("init-val");
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("init-val");
  });
});
