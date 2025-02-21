import { vi } from "vitest";

import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
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
});
