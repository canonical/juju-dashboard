import { waitFor } from "@testing-library/react";

import { JIMMRelation } from "juju/jimm/JIMMV4";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  credentialFactory,
  authUserInfoFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
  configFactory,
} from "testing/factories/general";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
  relationshipTupleFactory,
  rebacAllowedFactory,
  rebacState,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { renderWrappedHook, createStore } from "testing/utils";

import useModelAccess from "./useModelAccess";

describe("useModelAccess", () => {
  let state: RootState;
  const url = "/models/eggman@external/test1";
  const path = "/models/:userName/:modelName";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
        credentials: {
          "wss://jimm.jujucharms.com/api": credentialFactory.build(),
        },
      }),
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build(),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build(),
        },
      }),
    });
  });

  it("gets access for a Juju controller", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          users: [
            modelUserInfoFactory.build({
              user: "eggman@external",
              access: "read",
            }),
          ],
        }),
      }),
    };
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe("read");
  });

  it("requests permissions for JIMM controllers", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://jimm.jujucharms.com/api": controllerFeaturesFactory.build({
        rebac: true,
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderWrappedHook(() => useModelAccess("abc123"), {
      store,
      path,
      url,
    });
    const action = jujuActions.checkRelations({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestId: expect.any(String),
      tuples: [
        relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: "model-abc123",
        }),
        relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.WRITER,
          target_object: "model-abc123",
        }),
        relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.READER,
          target_object: "model-abc123",
        }),
      ],
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("handles admin access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac = rebacState.build({
      allowed: [
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            relation: JIMMRelation.READER,
          }),
          loaded: true,
        }),
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            object: "user-eggman@external",
            target_object: "model-abc123",
            relation: JIMMRelation.WRITER,
          }),
          loaded: true,
        }),
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            object: "user-eggman@external",
            target_object: "model-abc123",
            relation: JIMMRelation.ADMINISTRATOR,
          }),
          loaded: true,
        }),
      ],
    });
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe(JIMMRelation.ADMINISTRATOR);
  });

  it("handles write access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac = rebacState.build({
      allowed: [
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            relation: JIMMRelation.READER,
          }),
          loaded: true,
        }),
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            object: "user-eggman@external",
            target_object: "model-abc123",
            relation: JIMMRelation.WRITER,
          }),
          loaded: true,
        }),
      ],
    });
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe(JIMMRelation.WRITER);
  });

  it("handles read access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac = rebacState.build({
      allowed: [
        rebacAllowedFactory.build({
          tuple: relationshipTupleFactory.build({
            object: "user-eggman@external",
            target_object: "model-abc123",
            relation: JIMMRelation.READER,
          }),
          loaded: true,
        }),
      ],
    });
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe(JIMMRelation.READER);
  });

  it("handles no access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac = rebacState.build({
      allowed: [],
    });
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBeNull();
  });
});
