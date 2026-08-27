import { act, renderHook } from "@testing-library/react";

import useToggleSelect from "./useToggleSelect";

const KEYS = ["one", "two", "three", "four", "five"] as const;

describe("useToggleSelect", () => {
  describe("toggle", () => {
    it("enables deselected key", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      expect(result.current.selected).not.toContain("one");
      act(() => {
        result.current.toggle("one");
      });
      expect(result.current.selected).toContain("one");
    });

    it("disables enabled key", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      act(() => {
        result.current.toggle("one");
      });
      expect(result.current.selected).toContain("one");
      act(() => {
        result.current.toggle("one");
      });
      expect(result.current.selected).not.toContain("one");
    });

    it("ignores invalid key", ({ expect }) => {
      const { result } = renderHook((keys) => useToggleSelect(keys), {
        initialProps: [] as string[],
      });
      expect(result.current.selected).not.toContain("one");
      act(() => {
        result.current.toggle("one");
      });
      expect(result.current.selected).not.toContain("one");
    });
  });

  describe("toggleAll", () => {
    it("selects all when nothing selected", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      expect(result.current.selected).toHaveLength(0);
      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selected).toHaveLength(KEYS.length);
    });

    it("selects all when some selected", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      act(() => {
        result.current.toggle("one");
        result.current.toggle("four");
      });
      expect(result.current.selected).toHaveLength(2);
      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selected).toHaveLength(KEYS.length);
    });

    it("deselects all when all selected", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      act(() => {
        for (const key of KEYS) {
          result.current.toggle(key);
        }
      });
      expect(result.current.selected).toHaveLength(KEYS.length);
      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selected).toHaveLength(0);
    });

    it("does nothing with no keys", ({ expect }) => {
      const { result } = renderHook((keys) => useToggleSelect(keys), {
        initialProps: [],
      });
      expect(result.current.selected).toHaveLength(0);
      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selected).toHaveLength(0);
    });
  });

  describe("state", () => {
    it("correctly detects none", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      expect(result.current.selected).toHaveLength(0);
      expect(result.current.state).toEqual("none");
    });

    it("correctly detects all", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      act(() => {
        for (const key of KEYS) {
          result.current.toggle(key);
        }
      });
      expect(result.current.selected).toHaveLength(KEYS.length);
      expect(result.current.state).toEqual("all");
    });

    it("correctly detects partial", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      act(() => {
        result.current.toggle("one");
        result.current.toggle("four");
      });
      expect(result.current.selected).toHaveLength(2);
      expect(result.current.state).toEqual("partial");
    });
  });

  describe("selected", () => {
    it("begins empty", ({ expect }) => {
      const { result } = renderHook(() => useToggleSelect(KEYS));
      expect(result.current.selected).toHaveLength(0);
    });

    it("previous keys are removed", ({ expect }) => {
      const { result, rerender } = renderHook((keys) => useToggleSelect(keys), {
        initialProps: KEYS as readonly string[],
      });
      act(() => {
        result.current.toggle("one");
        result.current.toggle("four");
      });
      expect(result.current.selected).toEqual(["one", "four"]);
      rerender(KEYS.slice(0, 3));
      expect(result.current.selected).toEqual(["one"]);
    });
  });

  it("survives rerender", ({ expect }) => {
    const { result, rerender } = renderHook((keys) => useToggleSelect(keys), {
      initialProps: KEYS,
    });
    act(() => {
      result.current.toggle("one");
      result.current.toggle("four");
    });
    expect(result.current.selected).toEqual(["one", "four"]);
    rerender(KEYS);
    expect(result.current.selected).toEqual(["one", "four"]);
  });
});
