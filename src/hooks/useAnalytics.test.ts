import { renderHook } from "@testing-library/react";
import * as reactGA from "react-ga";

import { DISABLE_ANALYTICS_KEY } from "pages/Settings/Settings";

import useAnalytics from "./useAnalytics";

jest.mock("react-ga", () => ({
  event: jest.fn(),
  pageview: jest.fn(),
}));

describe("useAnalytics", () => {
  let pageviewSpy: jest.SpyInstance;
  let eventSpy: jest.SpyInstance;
  const node_env = process.env.NODE_ENV;

  beforeEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", { value: "production" });
    eventSpy = jest.spyOn(reactGA, "event");
    pageviewSpy = jest.spyOn(reactGA, "pageview");
  });

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: node_env,
    });
    localStorage.clear();
  });

  it("does not send events in development", () => {
    Object.defineProperty(process.env, "NODE_ENV", { value: "development" });
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(eventSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });

  it("does not send events if analytics are disabled", () => {
    localStorage.setItem(DISABLE_ANALYTICS_KEY, JSON.stringify(true));
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(eventSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });

  it("can send pageview events", () => {
    const { result } = renderHook(() => useAnalytics());
    result.current({ path: "/some/path" });
    expect(pageviewSpy).toHaveBeenCalledWith("/some/path");
  });

  it("can send events", () => {
    const { result } = renderHook(() => useAnalytics());
    result.current({ category: "sidebar", action: "toggle" });
    expect(eventSpy).toHaveBeenCalledWith({
      category: "sidebar",
      action: "toggle",
    });
  });
});
