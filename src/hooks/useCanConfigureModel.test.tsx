import { renderHook, waitFor } from "@testing-library/react";
import type { JSX, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";

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
  rebacAllowedFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { renderWrappedHook, createStore } from "testing/utils";

import useCanConfigureModel, {
  useCanConfigureModelWithUUID,
} from "./useCanConfigureModel";

const generateContainer =
  (state: RootState, path: string, url: string) =>
  ({ children }: PropsWithChildren): JSX.Element => {
    window.happyDOM.setURL(url);
    const store = createStore(state);
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  };

describe("useCanConfigureModel", () => {
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

  it("should return true when juju user has admin access", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const { result } = renderHook(() => useCanConfigureModel(), {
      wrapper: generateContainer(state, path, url),
    });
    expect(result.current).toBe(true);
  });

  it("can be passed a username and password", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const { result } = renderWrappedHook(
      () => useCanConfigureModel(false, "test1", "eggman@external"),
      { state },
    );
    expect(result.current).toBe(true);
  });

  it("should return true when juju user has write access", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "write",
        }),
      ],
    });
    const { result } = renderHook(() => useCanConfigureModel(), {
      wrapper: generateContainer(state, path, url),
    });
    expect(result.current).toBe(true);
  });

  it("should return false when juju user has read access", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    const { result } = renderHook(() => useCanConfigureModel(), {
      wrapper: generateContainer(state, path, url),
    });
    expect(result.current).toBe(false);
  });

  it("should request permissions for the JAAS user", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://jimm.jujucharms.com/api": controllerFeaturesFactory.build({
        rebac: true,
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderWrappedHook(() => useCanConfigureModel(), {
      store,
      path,
      url,
    });
    const action = jujuActions.checkRelation({
      tuple: {
        object: "user-eggman@external",
        relation: JIMMRelation.WRITER,
        target_object: "model-abc123",
      },
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("should return true when a JAAS user has write access", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: {
          object: "user-eggman@external",
          relation: JIMMRelation.WRITER,
          target_object: "model-abc123",
        },
        allowed: true,
      }),
    ];
    const { result } = renderHook(() => useCanConfigureModel(), {
      wrapper: generateContainer(state, path, url),
    });
    expect(result.current).toBe(true);
  });

  it("should return false when a JAAS user doesn't have write access", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: {
          object: "user-eggman@external",
          relation: JIMMRelation.WRITER,
          target_object: "model-abc123",
        },
        allowed: false,
      }),
    ];
    const { result } = renderHook(() => useCanConfigureModel(), {
      wrapper: generateContainer(state, path, url),
    });
    expect(result.current).toBe(false);
  });

  it("checks model with UUID", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const { result } = renderWrappedHook(
      () => useCanConfigureModelWithUUID(false, "abc123"),
      { state },
    );
    expect(result.current).toBe(true);
  });
});
