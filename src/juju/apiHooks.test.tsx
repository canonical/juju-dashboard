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
import {
  useModelConnection,
  useListSecrets,
  useCreateSecrets,
  useModelConnectionCallback,
} from "./apiHooks";

const mockStore = configureStore<RootState, unknown>([]);

jest.mock("@canonical/jujulib", () => ({
  connectAndLogin: jest.fn(),
}));

describe("useModelConnectionCallback", () => {
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
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    result.current(callback);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(loginResponse.conn);
    });
  });

  it("does not connect if the data is unavailable", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const connectAndLoginSpy = jest.spyOn(jujuLib, "connectAndLogin");
    const callback = jest.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(rootStateFactory.build())}
        />
      ),
    });
    result.current(callback);
    await waitFor(() => {
      expect(connectAndLoginSpy).not.toHaveBeenCalled();
    });
  });

  it("returns connection errors", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.reject(new Error()));
    const callback = jest.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    result.current(callback);
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
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(state)}
        />
      ),
    });
    result.current(callback);
    jest.advanceTimersByTime(LOGIN_TIMEOUT);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(null, "timeout");
    });
  });
});

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

  it("does not connect until the data is available", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const connectAndLoginSpy = jest.spyOn(jujuLib, "connectAndLogin");
    const callback = jest.fn();
    renderHook(() => useModelConnection(callback, "abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={mockStore(rootStateFactory.build())}
        />
      ),
    });
    await waitFor(() => {
      expect(connectAndLoginSpy).not.toHaveBeenCalled();
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
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current();
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
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current();
    await waitFor(() => {
      expect(store.getActions()).toHaveLength(0);
    });
  });

  it("stores connection errors", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.reject(new Error()));
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current();
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

  it("stores errors from fetching secrets", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: jest
              .fn()
              .mockImplementation(() => Promise.reject(new Error("Uh oh!"))),
          },
        },
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current();
    const updateAction = jujuActions.setSecretsErrors({
      modelUUID: "abc123",
      errors: "Uh oh!",
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

describe("useCreateSecrets", () => {
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

  it("can create secrets", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const results = { results: [{ result: "secret:def456" }] };
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            createSecrets,
          },
        },
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).resolves.toBe(results);
    expect(createSecrets).toHaveBeenCalledWith({ args: secrets });
  });

  it("handles no connection", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const loginResponse = {
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toStrictEqual(
      new Error("Unable to connect to model"),
    );
  });

  it("handles connection errors", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.reject(new Error()));
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toBe(
      "Error during promise race.",
    );
  });

  it("handles errors from creating secrets", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Uh oh!")));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            createSecrets,
          },
        },
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:userName/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toStrictEqual(
      new Error("Uh oh!"),
    );
  });
});
