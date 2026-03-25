import type { RootState } from "store/store";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  controllerFactory,
  cloudInfoStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderWrappedHook } from "testing/utils";

import { useCanAddModel } from "./useCanAddModel";

describe("useCanAddModel", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
          },
        }),
        controllers: {
          "wss://controller.example.com": [
            controllerFactory.build({
              uuid: "test-controller-1",
            }),
          ],
        },
      }),
    });
  });

  it("should return true when a Juju user has access to clouds", () => {
    const { result } = renderWrappedHook(() => useCanAddModel(), {
      state,
    });
    expect(result.current).toBe(true);
  });

  it("should return false when a Juju user does not have access to clouds", () => {
    state.juju.cloudInfo = cloudInfoStateFactory.build({
      clouds: null,
    });
    const { result } = renderWrappedHook(() => useCanAddModel(), {
      state,
    });
    expect(result.current).toBe(false);
  });

  it("should return true when a JAAS user has access to clouds and controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const { result } = renderWrappedHook(() => useCanAddModel(), {
      state,
    });
    expect(result.current).toBe(true);
  });

  it("should return false when a JAAS user has access to clouds but not controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.controllers = {};
    const { result } = renderWrappedHook(() => useCanAddModel(), {
      state,
    });
    expect(result.current).toBe(false);
  });

  it("should return false when a JAAS user does not have access to clouds", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.cloudInfo = cloudInfoStateFactory.build({
      clouds: null,
    });
    const { result } = renderWrappedHook(() => useCanAddModel(), {
      state,
    });
    expect(result.current).toBe(false);
  });
});
