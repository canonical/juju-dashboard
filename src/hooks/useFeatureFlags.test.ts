import { renderHook } from "@testing-library/react";

import useFeatureFlags from "./useFeatureFlags";
import * as LocalStorage from "./useLocalStorage";
import * as QueryParams from "./useQueryParams";

vi.mock("./useLocalStorage");
vi.mock("./useQueryParams");

describe("useFeatureFlags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty flags from local storage", () => {
    vi.spyOn(LocalStorage, "default").mockReturnValue([[], vi.fn()]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": [], "disable-flag": [] },
      vi.fn(),
    ]);
    renderHook(() => {
      useFeatureFlags();
    });
    expect(LocalStorage.default).toHaveBeenCalledWith("flags", []);
  });

  it("should enable flags from query parameters", () => {
    const setLocalStorage = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([[], setLocalStorage]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": ["featureA", "featureB"], "disable-flag": [] },
      vi.fn(),
    ]);
    renderHook(() => {
      useFeatureFlags();
    });
    expect(setLocalStorage).toHaveBeenCalledWith(["featureA", "featureB"]);
  });

  it("should disable flags from query parameters", () => {
    const setLocalStorage = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["featureA", "featureB", "featureC"],
      setLocalStorage,
    ]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": [], "disable-flag": ["featureB"] },
      vi.fn(),
    ]);
    renderHook(() => {
      useFeatureFlags();
    });
    expect(setLocalStorage).toHaveBeenCalledWith(["featureA", "featureC"]);
  });

  it("should handle both enable and disable flags", () => {
    const setLocalStorage = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["featureA", "featureB", "featureC"],
      setLocalStorage,
    ]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": ["featureD"], "disable-flag": ["featureB"] },
      vi.fn(),
    ]);
    renderHook(() => {
      useFeatureFlags();
    });
    expect(setLocalStorage).toHaveBeenCalledWith([
      "featureA",
      "featureC",
      "featureD",
    ]);
  });

  it("should not update local storage when flags are the same", () => {
    const setLocalStorage = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["featureA", "featureB"],
      setLocalStorage,
    ]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": ["featureA", "featureB"], "disable-flag": [] },
      vi.fn(),
    ]);
    renderHook(() => {
      useFeatureFlags();
    });
    expect(setLocalStorage).toHaveBeenCalledTimes(1);
  });

  it("should handle empty array query params", () => {
    const setLocalStorage = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["featureA"],
      setLocalStorage,
    ]);
    vi.spyOn(QueryParams, "useQueryParams").mockReturnValue([
      { "enable-flag": [], "disable-flag": [] },
      vi.fn(),
    ]);
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    renderHook(() => {
      useFeatureFlags();
    });
    expect(setLocalStorage).toHaveBeenCalledTimes(1);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
