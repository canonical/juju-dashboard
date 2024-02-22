import * as jujuLib from "@canonical/jujulib";
import type { Connection } from "@canonical/jujulib";
import { renderHook, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { ComponentProviders, changeURL } from "testing/utils";

import { LOGIN_TIMEOUT, Label as APILabel } from "../api";

import {
  useModelConnectionCallback,
  useCallWithConnection,
  useCallWithConnectionPromise,
  Label,
} from "./common";

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
      expect(callback).toHaveBeenCalledWith({ connection: loginResponse.conn });
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
      expect(callback).toHaveBeenCalledWith({
        error: "Error during promise race.",
      });
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
      expect(callback).toHaveBeenCalledWith({
        error: APILabel.LOGIN_TIMEOUT_ERROR,
      });
    });
  });

  it("handles no connection", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
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
      expect(callback).toHaveBeenCalledWith({
        error: Label.NO_CONNECTION_ERROR,
      });
    });
  });

  it("handles no model", async () => {
    state.juju.models = {};
    changeURL("/models/eggman@external/group-test/app/etcd");
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
      expect(callback).toHaveBeenCalledWith({
        error: Label.NO_CONNECTION_ERROR,
      });
    });
  });

  it("responds with the connection", async () => {
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
      expect(callback).toHaveBeenCalledWith({
        connection: loginResponse.conn,
      });
    });
  });
});

describe("useCallWithConnectionPromise", () => {
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

  it("calls the handler with args", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest
      .fn()
      .mockImplementation(() => Promise.resolve("result"));
    const { result } = renderHook(
      () =>
        useCallWithConnectionPromise(handler, "eggman@external", "test-model"),
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
    await result.current("secret1");
    expect(handler).toHaveBeenCalledWith(loginResponse.conn, "secret1");
  });

  it("handles a successful call", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest
      .fn()
      .mockImplementation(() => Promise.resolve("result"));
    const { result } = renderHook(
      () =>
        useCallWithConnectionPromise(handler, "eggman@external", "test-model"),
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
    await expect(result.current("secret1")).resolves.toBe("result");
  });

  it("handles errors", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Uh oh!")));
    const { result } = renderHook(
      () =>
        useCallWithConnectionPromise(handler, "eggman@external", "test-model"),
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
    await expect(result.current("secret1")).rejects.toStrictEqual(
      new Error("Uh oh!"),
    );
  });
});

describe("useCallWithConnection", () => {
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

  it("calls the handler with args", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest.fn();
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(
      () =>
        useCallWithConnection(
          handler,
          onSuccess,
          onError,
          "eggman@external",
          "test-model",
        ),
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
    result.current("secret1");
    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(loginResponse.conn, "secret1");
    });
  });

  it("handles a successful call", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest
      .fn()
      .mockImplementation(() => Promise.resolve("result"));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(
      () =>
        useCallWithConnection(
          handler,
          onSuccess,
          onError,
          "eggman@external",
          "test-model",
        ),
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
    result.current("secret1");
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("result");
    });
  });

  it("handles errors", async () => {
    const store = mockStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: jest.fn(),
    };
    jest
      .spyOn(jujuLib, "connectAndLogin")
      .mockImplementation(() => Promise.resolve(loginResponse));
    const handler = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Uh oh!")));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(
      () =>
        useCallWithConnection(
          handler,
          onSuccess,
          onError,
          "eggman@external",
          "test-model",
        ),
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
    result.current("secret1");
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith("Uh oh!");
    });
  });
});
