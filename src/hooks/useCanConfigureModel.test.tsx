import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  credentialFactory,
} from "testing/factories/general";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";

import useCanConfigureModel from "./useCanConfigureModel";

const mockStore = configureStore();

const generateContainer =
  (state: RootState, path: string, url: string) =>
  ({ children }: PropsWithChildren) => {
    window.history.pushState({}, "", url);
    const store = mockStore(state);
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

describe("useModelStatus", () => {
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
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
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

  it("should return true when user has admin access", () => {
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

  it("should return true when user has write access", () => {
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

  it("should return false when user has read access", () => {
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
});
