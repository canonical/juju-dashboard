import { vi } from "vitest";

import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { connectionInfoFactory } from "testing/factories/juju/jujulib";
import { renderWrappedHook } from "testing/utils";
import * as analyticsUtils from "utils/analytics";

import useAnalytics from "./useAnalytics";

describe("useAnalytics", () => {
  beforeEach(() => {
    vi.spyOn(analyticsUtils, "default").mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does not send events if analytics are disabled", () => {
    const { result } = renderWrappedHook(() => useAnalytics(), {
      state: rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            analyticsEnabled: false,
          }),
        }),
      }),
    });
    result.current({ path: "/some/path" });
    expect(analyticsUtils.default).toHaveBeenCalledWith(
      false,
      { controllerVersion: "", dashboardVersion: "", isJuju: "false" },
      { path: "/some/path" },
    );
  });

  it("can send pageview events", () => {
    const { result } = renderWrappedHook(() => useAnalytics(), {
      state: rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            analyticsEnabled: true,
          }),
        }),
      }),
    });
    result.current({ path: "/some/path" });
    expect(analyticsUtils.default).toHaveBeenCalledWith(
      true,
      { controllerVersion: "", dashboardVersion: "", isJuju: "false" },
      { path: "/some/path" },
    );
  });

  it("can send events", () => {
    const { result } = renderWrappedHook(() => useAnalytics(), {
      state: rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            analyticsEnabled: true,
          }),
        }),
      }),
    });
    result.current({ category: "sidebar", action: "toggle" });
    expect(analyticsUtils.default).toHaveBeenCalledWith(
      true,
      { controllerVersion: "", dashboardVersion: "", isJuju: "false" },
      { category: "sidebar", action: "toggle" },
    );
  });

  it("can send events with correct event params", () => {
    const { result } = renderWrappedHook(() => useAnalytics(), {
      state: rootStateFactory.build({
        general: generalStateFactory.build({
          appVersion: "1.0.0",
          controllerConnections: {
            "wss://example.com/api": connectionInfoFactory.build({
              serverVersion: "1.2.3",
            }),
          },
          config: configFactory.build({
            analyticsEnabled: true,
            isJuju: true,
            controllerAPIEndpoint: "wss://example.com/api",
          }),
        }),
      }),
    });
    result.current({ category: "sidebar", action: "toggle" });
    expect(analyticsUtils.default).toHaveBeenCalledWith(
      true,
      { controllerVersion: "1.2.3", dashboardVersion: "1.0.0", isJuju: "true" },
      { category: "sidebar", action: "toggle" },
    );
  });
});
