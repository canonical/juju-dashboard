import { waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

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
  rebacRelationshipFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { renderWrappedHook } from "testing/utils";

import useModelAccess from "./useModelAccess";

const mockStore = configureStore<RootState, unknown>([]);

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
    const store = mockStore(state);
    renderWrappedHook(() => useModelAccess("abc123"), {
      store,
      path,
      url,
    });
    const action = jujuActions.listRelationshipTuples({
      tuple: {
        object: "user-eggman@external",
        target_object: "model-abc123",
      },
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
    await waitFor(() => {
      expect(
        store.getActions().find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("handles admin access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const tuple = {
      object: "user-eggman@external",
      target_object: "model-abc123",
    };
    const relationships = rebacRelationshipFactory.build({
      loaded: true,
      relationships: [
        relationshipTupleFactory.build({
          relation: JIMMRelation.READER,
        }),
        relationshipTupleFactory.build({
          relation: JIMMRelation.ADMINISTRATOR,
        }),
        relationshipTupleFactory.build({
          relation: JIMMRelation.WRITER,
        }),
      ],
    });
    // Manually set the tuple so it doesn't get merged with the defaults.
    relationships.tuple = tuple;
    state.juju.rebac.relationships = [relationships];
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
    const tuple = {
      object: "user-eggman@external",
      target_object: "model-abc123",
    };
    const relationships = rebacRelationshipFactory.build({
      loaded: true,
      relationships: [
        relationshipTupleFactory.build({
          relation: JIMMRelation.READER,
        }),
        relationshipTupleFactory.build({
          relation: JIMMRelation.WRITER,
        }),
      ],
    });
    // Manually set the tuple so it doesn't get merged with the defaults.
    relationships.tuple = tuple;
    state.juju.rebac.relationships = [relationships];
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
    const tuple = {
      object: "user-eggman@external",
      target_object: "model-abc123",
    };
    const relationships = rebacRelationshipFactory.build({
      loaded: true,
      relationships: [
        relationshipTupleFactory.build({
          relation: JIMMRelation.READER,
        }),
      ],
    });
    // Manually set the tuple so it doesn't get merged with the defaults.
    relationships.tuple = tuple;
    state.juju.rebac.relationships = [relationships];
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe(JIMMRelation.READER);
  });

  it("handles unexpected relations for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const tuple = {
      object: "user-eggman@external",
      target_object: "model-abc123",
    };
    const relationships = rebacRelationshipFactory.build({
      loaded: true,
      relationships: [
        relationshipTupleFactory.build({
          relation: JIMMRelation.WRITER,
        }),
        relationshipTupleFactory.build({
          // This relation is not valid for a model.
          relation: JIMMRelation.AUDIT_LOG_VIEWER,
        }),
      ],
    });
    // Manually set the tuple so it doesn't get merged with the defaults.
    relationships.tuple = tuple;
    state.juju.rebac.relationships = [relationships];
    const { result } = renderWrappedHook(() => useModelAccess("abc123"), {
      state,
      path,
      url,
    });
    expect(result.current).toBe(JIMMRelation.WRITER);
  });
});
