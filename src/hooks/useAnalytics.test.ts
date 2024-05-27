import { renderHook } from "@testing-library/react";
import * as reactGA from "react-ga";
import type { MockInstance } from "vitest";
import { vi } from "vitest";

import * as store from "store/store";

import useAnalytics from "./useAnalytics";

vi.mock("react-ga", () => ({
  event: vi.fn(),
  pageview: vi.fn(),
}));

describe("useAnalytics", () => {
  let pageviewSpy: MockInstance;
  let eventSpy: MockInstance;

  beforeEach(() => {
    vi.stubEnv("PROD", true);
    eventSpy = vi.spyOn(reactGA, "event");
    pageviewSpy = vi.spyOn(reactGA, "pageview");
  });

  afterEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("does not send events in development", () => {
    vi.spyOn(store, "useAppSelector").mockImplementation(
      vi.fn().mockReturnValue(true),
    );
    vi.stubEnv("PROD", false);
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(eventSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });

  it("does not send events if analytics are disabled", () => {
    vi.spyOn(store, "useAppSelector").mockImplementation(
      vi.fn().mockReturnValue(false),
    );
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(eventSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });

  it("can send pageview events", () => {
    vi.spyOn(store, "useAppSelector").mockImplementation(
      vi.fn().mockReturnValue(true),
    );
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(pageviewSpy).toHaveBeenCalledWith("/some/path");
  });

  it("can send events", () => {
    vi.spyOn(store, "useAppSelector").mockImplementation(
      vi.fn().mockReturnValue(true),
    );
    const { result } = renderHook(() => useAnalytics());
    result.current({ category: "sidebar", action: "toggle" });
    expect(eventSpy).toHaveBeenCalledWith({
      category: "sidebar",
      action: "toggle",
    });
  });
});
