import { renderHook } from "@testing-library/react";

import useInlineErrors from "./useInlineErrors";

describe("useInlineErrors", () => {
  it("can add an error", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    setError("Error1", "Uh oh!");
    rerender();
    [errors] = result.current;
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
  });

  it("can update an error", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    setError("Error1", "Uh oh!");
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
    setError("Error1", ["It just got worse"]);
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["It just got worse"]);
  });

  it("can clear an error", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    setError("Error1", "Uh oh!");
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!"]);
    setError("Error1", null);
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual([]);
  });

  it("returns errors", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    setError("Error1", "Uh oh!");
    setError("Error2", ["Bad!", "Wrong!"]);
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh oh!", "Bad!", "Wrong!"]);
  });

  it("does not return null errors", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [errors, setError] = result.current;
    setError("Error1", null);
    setError("Error2", [null, "Uh, oh!"]);
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual(["Uh, oh!"]);
  });

  it("can map errors", () => {
    const { result, rerender } = renderHook(() =>
      useInlineErrors({
        Error1: (error) => `Mapped! ${error}`,
        Error2: (error) => [`Mapped to array! ${error}`],
      }),
    );
    let [errors, setError] = result.current;
    setError("Error1", "Uh oh!");
    setError("Error2", "Something went wrong!");
    rerender();
    [errors] = result.current;
    expect(errors).toStrictEqual([
      "Mapped! Uh oh!",
      "Mapped to array! Something went wrong!",
    ]);
  });

  it("can check if an error exists", () => {
    const { result, rerender } = renderHook(() => useInlineErrors());
    let [, setError, hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(false);
    setError("Error1", "Uh oh!");
    rerender();
    [, , hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(true);
    setError("Error1", ["Uh oh!"]);
    rerender();
    [, , hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(true);
    setError("Error1", [null]);
    rerender();
    [, , hasError] = result.current;
    expect(hasError("Error1")).toStrictEqual(false);
  });
});
