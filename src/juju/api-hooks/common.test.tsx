import * as jujuLib from "@canonical/jujulib";
import type { Connection } from "@canonical/jujulib";
import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { Auth, LocalAuth } from "auth";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { ComponentProviders, changeURL, createStore } from "testing/utils";

import { LOGIN_TIMEOUT } from "../api";
import { Label as APILabel } from "../types";

import {
  useModelConnectionCallback,
  useCallWithConnection,
  useCallWithConnectionPromise,
  Label,
} from "./common";

vi.mock("@canonical/jujulib", () => ({
  connectAndLogin: vi.fn(),
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
    vi.useFakeTimers();
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("can connect and log in", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          client: {
            fullStatus: vi.fn().mockReturnValue({}),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
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
    const connectAndLoginSpy = vi.spyOn(jujuLib, "connectAndLogin");
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(rootStateFactory.build())}
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
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.reject(new Error("Uh oh!")),
    );
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
        />
      ),
    });
    result.current(callback);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({
        error: "Uh oh!",
      });
    });
  });

  it("returns string connection errors", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(resolve, LOGIN_TIMEOUT + 10);
        }),
    );
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
        />
      ),
    });
    result.current(callback);
    vi.advanceTimersByTime(LOGIN_TIMEOUT);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({
        error: APILabel.LOGIN_TIMEOUT_ERROR,
      });
    });
  });

  it("handles no connection", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
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

  it("handles no model or websocket URL", async () => {
    state.juju.models = {};
    changeURL("/models/eggman@external/group-test/app/etcd");
    const callback = vi.fn();
    const connectAndLogin = vi.spyOn(jujuLib, "connectAndLogin");
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
        />
      ),
    });
    result.current(callback);
    await waitFor(() => {
      expect(connectAndLogin).not.toHaveBeenCalled();
    });
  });

  it("responds with the connection", async () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          client: {
            fullStatus: vi.fn().mockReturnValue({}),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const callback = vi.fn();
    const { result } = renderHook(() => useModelConnectionCallback("abc123"), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(state)}
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
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("calls the handler with args", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi
      .fn()
      .mockImplementation(async () => Promise.resolve("result"));
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
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi
      .fn()
      .mockImplementation(async () => Promise.resolve("result"));
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
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi
      .fn()
      .mockImplementation(async () => Promise.reject(new Error("Uh oh!")));
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
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("calls the handler with args", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
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
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi
      .fn()
      .mockImplementation(async () => Promise.resolve("result"));
    const onSuccess = vi.fn();
    const onError = vi.fn();
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
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () =>
      Promise.resolve(loginResponse),
    );
    const handler = vi
      .fn()
      .mockImplementation(async () => Promise.reject(new Error("Uh oh!")));
    const onSuccess = vi.fn();
    const onError = vi.fn();
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
