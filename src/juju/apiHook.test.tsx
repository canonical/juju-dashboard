import * as jujuLib from "@canonical/jujulib";
import type { Connection } from "@canonical/jujulib";
import { renderHook, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  modelListInfoFactory,
  listSecretResultFactory,
} from "testing/factories/juju/juju";
import { ComponentProviders, changeURL } from "testing/utils";

import { LOGIN_TIMEOUT } from "./api";
import { useModelConnection, useListSecrets } from "./apiHooks";

const mockStore = configureStore<RootState, unknown>([]);

jest.mock("@canonical/jujulib", () => ({
  connectAndLogin: jest.fn(),
}));

describe("useModelConnection", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        credentials: {
          "wss://example.com/api": credentialFactory.build(),
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: {
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
        },
      },
    });
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("can connect and log in", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          client: {
            fullStatus: jest.fn().mockReturnValue({}),
          },
        },
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const callback = jest.fn();
    renderHook(() => useModelConnection(callback, "abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(loginResponse.conn);
    });
  });

  it("returns connection errors", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.reject(new Error()));
    const callback = jest.fn();
    renderHook(() => useModelConnection(callback, "abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(null, "Error during promise race.");
    });
  });

  it("returns string connection errors", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    jest.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(resolve, LOGIN_TIMEOUT + 10);
        }),
    );
    const callback = jest.fn();
    renderHook(() => useModelConnection(callback, "abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    jest.advanceTimersByTime(LOGIN_TIMEOUT);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(null, "timeout");
    });
  });
});

describe("useListSecrets", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        credentials: {
          "wss://example.com/api": credentialFactory.build(),
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: {
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
            uuid: "abc123",
          }),
        },
      },
    });
  });

  it("fetches secrets", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [listSecretResultFactory.build()];
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: jest
              .fn()
              .mockImplementation(() => Promise.resolve({ results: secrets })),
          },
        },
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    renderHook(() => useListSecrets("eggman@external", "test-model"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={store}
        />
      ),
    });
    const updateAction = jujuActions.updateSecrets({
      modelUUID: "abc123",
      secrets: secrets,
      wsControllerURL: "wss://example.com/api",
    });
    const loadingAction = jujuActions.secretsLoading({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        store
          .getActions()
          .find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
      expect(
        store
          .getActions()
          .find((dispatch) => dispatch.type === loadingAction.type),
      ).toMatchObject(loadingAction);
    });
  });

  it("handles no connection", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    renderHook(() => useListSecrets("eggman@external", "test-model"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={store}
        />
      ),
    });
    await waitFor(() => {
      expect(store.getActions()).toHaveLength(0);
    });
  });

  it("returns errors", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.reject(new Error()));
    renderHook(() => useListSecrets("eggman@external", "test-model"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={store}
        />
      ),
    });
    const updateAction = jujuActions.setSecretsErrors({
      modelUUID: "abc123",
      errors: "Error during promise race.",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        store
          .getActions()
          .find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
    });
  });
});
