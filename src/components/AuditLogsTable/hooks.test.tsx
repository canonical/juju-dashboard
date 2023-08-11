import { renderHook } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { ComponentProviders } from "testing/utils";

import { DEFAULT_LIMIT_VALUE } from "./consts";
import { useFetchAuditEvents } from "./hooks";

const mockStore = configureStore<RootState, unknown>([]);

describe("useFetchAuditEvents", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
    });
  });

  it("should fetch audit events", () => {
    const store = mockStore(state);
    const { result } = renderHook(() => useFetchAuditEvents(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="" store={store} />
      ),
    });
    // Call the returned callback:
    result.current();
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toMatchObject(action);
  });

  it("should not fetch audit logs if there is no websocket", () => {
    state.general.config = configFactory.build({
      controllerAPIEndpoint: "",
    });
    const store = mockStore(state);
    const { result } = renderHook(() => useFetchAuditEvents(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="" store={store} />
      ),
    });
    // Call the returned callback:
    result.current();
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toBeUndefined();
  });

  it("should not fetch audit logs if there is no controller", () => {
    state.general.controllerConnections = {};
    const store = mockStore(state);
    const { result } = renderHook(() => useFetchAuditEvents(), {
      wrapper: (props) => (
        <ComponentProviders {...props} path="" store={store} />
      ),
    });
    // Call the returned callback:
    result.current();
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toBeUndefined();
  });
});
