import { act, renderHook } from "@testing-library/react";

import useInlineErrors from "./useInlineErrors";

describe("useInlineErrors", () => {
  it("can add an error", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    act(() => setError("Error1", "Uh oh!"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
  });

  it("can update an error", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    act(() => setError("Error1", "Uh oh!"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
    act(() => setError("Error1", "It just got worse"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["It just got worse"]);
  });

  it("can clear an error", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    act(() => setError("Error1", "Uh oh!"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
    act(() => setError("Error1", null));
    [errors] = result.current;
    expect(errors).toStrictEqual([]);
  });

  it("returns errors", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    act(() => setError("Error1", "Uh oh!"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
  });

  it("does not return null errors", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    act(() => setError("Error1", null));
    [errors] = result.current;
    expect(errors).toStrictEqual([]);
  });

  it("can map errors", () => {
    const { result } = renderHook(() =>
      useInlineErrors({ Error1: (error) => `Mapped! ${error}` }),
    );
    let [errors, setError] = result.current;
    act(() => setError("Error1", "Uh oh!"));
    [errors] = result.current;
    expect(errors).toStrictEqual(["Mapped! Uh oh!"]);
  });

  it("can check if an error exists", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [, setError, hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(false);
    act(() => setError("Error1", "Uh oh!"));
    [, , hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(true);
  });

  it("can check if errors exist", () => {
    const { result } = renderHook(() => useInlineErrors());
    let [, setError, hasError] = result.current;
    expect(hasError()).toStrictEqual(false);
    act(() => setError("Error1", "Uh oh!"));
    [, , hasError] = result.current;
    expect(hasError()).toStrictEqual(true);
  });
});
