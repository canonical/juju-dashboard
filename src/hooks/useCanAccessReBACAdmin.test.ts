import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import type { RootState } from "store/store";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
} from "testing/factories/general";
import {
  rebacAllowedFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/jimm";
import { jujuStateFactory } from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderWrappedHook } from "testing/utils";

import useCanAccessReBACAdmin from "./useCanAccessReBACAdmin";

describe("useCanAccessReBACAdmin", () => {
  let state: RootState;

  beforeEach(() => {
    localStorage.setItem("flags", JSON.stringify(["rebac"]));
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: false,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
      }),
      juju: jujuStateFactory.build({
        rebac: {
          allowed: [
            rebacAllowedFactory.build({
              tuple: relationshipTupleFactory.build({
                object: "user-eggman@external",
                relation: JIMMRelation.ADMINISTRATOR,
                target_object: JIMMTarget.JIMM_CONTROLLER,
              }),
              allowed: true,
              loaded: true,
            }),
          ],
        },
      }),
    });
  });

  afterEach(() => {
    localStorage.removeItem("flags");
  });

  it("allows access", () => {
    localStorage.setItem("flags", JSON.stringify(["rebac"]));
    const { result } = renderWrappedHook(() => useCanAccessReBACAdmin(), {
      state,
    });
    expect(result.current).toBe(true);
  });

  it("does not allow access under Juju", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    } else {
      assert.fail("config not defined");
    }
    const { result } = renderWrappedHook(() => useCanAccessReBACAdmin(), {
      state,
    });
    expect(result.current).toBe(false);
  });

  it("does not allow access if the controller doesn't support rebac", () => {
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://controller.example.com": controllerFeaturesFactory.build({
        rebac: false,
      }),
    });
    const { result } = renderWrappedHook(() => useCanAccessReBACAdmin(), {
      state,
    });
    expect(result.current).toBe(false);
  });

  it("does not allow access if the feature flag is not enabled", () => {
    localStorage.removeItem("flags");
    const { result } = renderWrappedHook(() => useCanAccessReBACAdmin(), {
      state,
    });
    expect(result.current).toBe(false);
  });
});
