import { renderHook, act } from "@testing-library/react";

import useSortState from "./useSortState";

describe("useSortState", () => {
  it("initially has no sort", ({ expect }) => {
    const { result } = renderHook(() => useSortState());
    expect(result.current.sort).toEqual(null);
  });

  describe("from no sort", () => {
    it("sets ascending on toggle", ({ expect }) => {
      const { result } = renderHook(() => useSortState());
      act(() => {
        result.current.toggleSort("something");
      });
      expect(result.current.sort).toEqual({
        key: "something",
        direction: "ascending",
      });
    });
  });

  describe("from ascending", () => {
    it("sets descending on same key toggle", ({ expect }) => {
      const { result } = renderHook(() => useSortState());
      act(() => {
        result.current.toggleSort("something");
        result.current.toggleSort("something");
      });
      expect(result.current.sort).toEqual({
        key: "something",
        direction: "descending",
      });
    });

    it("sets ascending on different key toggle", ({ expect }) => {
      const { result } = renderHook(() => useSortState());
      act(() => {
        result.current.toggleSort("something");
        result.current.toggleSort("other");
      });
      expect(result.current.sort).toEqual({
        key: "other",
        direction: "ascending",
      });
    });
  });

  describe("from descending", () => {
    it("clears sort on same key toggle", ({ expect }) => {
      const { result } = renderHook(() => useSortState());
      act(() => {
        result.current.toggleSort("something");
        result.current.toggleSort("something");
        result.current.toggleSort("something");
      });
      expect(result.current.sort).toEqual(null);
    });

    it("sets ascending on different key toggle", ({ expect }) => {
      const { result } = renderHook(() => useSortState());
      act(() => {
        result.current.toggleSort("something");
        result.current.toggleSort("something");
        result.current.toggleSort("other");
      });
      expect(result.current.sort).toEqual({
        key: "other",
        direction: "ascending",
      });
    });
  });

  it("survives rerendering", ({ expect }) => {
    const { result, rerender } = renderHook(() => useSortState());
    act(() => {
      result.current.toggleSort("something");
      result.current.toggleSort("something");
    });
    expect(result.current.sort).toEqual({
      key: "something",
      direction: "descending",
    });
    rerender();
    expect(result.current.sort).toEqual({
      key: "something",
      direction: "descending",
    });
    act(() => {
      result.current.toggleSort("other");
    });
    expect(result.current.sort).toEqual({
      key: "other",
      direction: "ascending",
    });
  });
});
