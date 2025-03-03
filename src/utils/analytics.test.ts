import ReactGA from "react-ga4";
import type { MockInstance } from "vitest";
import { vi } from "vitest";

import analytics from "./analytics";

vi.mock("react-ga4", () => ({
  default: {
    initialize: vi.fn(),
    send: vi.fn(),
    event: vi.fn(),
    set: vi.fn(),
  },
}));

describe("analytics", () => {
  let pageviewSpy: MockInstance;
  let eventSpy: MockInstance;

  beforeEach(() => {
    eventSpy = vi.spyOn(ReactGA, "event");
    pageviewSpy = vi.spyOn(ReactGA, "send");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does not send events if analytics are disabled", () => {
    analytics(
      false,
      { dashboardVersion: "1.0.0", controllerVersion: "1.0.0", isJuju: "true" },
      { path: "/some/path" },
    );
    expect(eventSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });

  it("can send pageview events", () => {
    analytics(
      true,
      { dashboardVersion: "1.0.0", controllerVersion: "1.0.0", isJuju: "true" },
      { path: "/some/path" },
    );
    expect(pageviewSpy).toHaveBeenCalledWith({
      controllerVersion: "1.0.0",
      dashboardVersion: "1.0.0",
      hitType: "pageview",
      isJuju: "true",
      page: "/some/path",
    });
  });

  it("can send events", () => {
    analytics(
      true,
      { dashboardVersion: "1.0.0", controllerVersion: "1.0.0", isJuju: "true" },
      { category: "sidebar", action: "toggle" },
    );
    expect(eventSpy).toHaveBeenCalledWith("toggle", {
      category: "sidebar",
      controllerVersion: "1.0.0",
      dashboardVersion: "1.0.0",
      isJuju: "true",
    });
  });
});
