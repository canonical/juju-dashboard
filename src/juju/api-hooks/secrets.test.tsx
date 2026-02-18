import * as jujuLib from "@canonical/jujulib";
import type { Connection } from "@canonical/jujulib";
import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { Auth, LocalAuth } from "auth";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { listSecretResultFactory } from "testing/factories/juju/SecretsV2";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { ComponentProviders, changeURL, createStore } from "testing/utils";

import {
  useListSecrets,
  useCreateSecrets,
  useGetSecretContent,
  useRemoveSecrets,
  useUpdateSecrets,
  useGrantSecret,
  useRevokeSecret,
  Label,
} from "./secrets";

vi.mock("@canonical/jujulib", () => ({
  connectAndLogin: vi.fn(),
}));

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
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("fetches secrets", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [listSecretResultFactory.build()];
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockResolvedValue({ results: secrets }),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
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
        storeActions.find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
      expect(
        storeActions.find((dispatch) => dispatch.type === loadingAction.type),
      ).toMatchObject(loadingAction);
    });
  });

  it("handles no secrets facade", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current();
    const updateAction = jujuActions.setSecretsErrors({
      modelUUID: "abc123",
      errors: Label.NO_SECRETS_FACADE_ERROR,
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
    });
  });

  it("stores errors from fetching secrets", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockRejectedValue(new Error("Uh oh!")),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useListSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
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
        storeActions.find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
    });
  });
});

describe("useGetSecretContent", () => {
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

  it("fetches secrets", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const data = { key: "val" };
    const secrets = [
      listSecretResultFactory.build({
        value: { data },
      }),
    ];
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockResolvedValue({ results: secrets }),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGetSecretContent("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current("secret:aabbccdd", 2);
    const updateAction = jujuActions.updateSecretsContent({
      modelUUID: "abc123",
      content: data,
      wsControllerURL: "wss://example.com/api",
    });
    const loadingAction = jujuActions.secretsContentLoading({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
      expect(
        storeActions.find((dispatch) => dispatch.type === loadingAction.type),
      ).toMatchObject(loadingAction);
    });
  });

  it("handles value errors", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      listSecretResultFactory.build({
        value: { error: new Error("Uh oh!") },
      }),
    ];
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockResolvedValue({ results: secrets }),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGetSecretContent("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current("secret:aabbccdd", 2);
    const errorAction = jujuActions.setSecretsContentErrors({
      modelUUID: "abc123",
      errors: "Uh oh!",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === errorAction.type),
      ).toMatchObject(errorAction);
    });
  });

  it("handles no data", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      listSecretResultFactory.build({
        value: {},
      }),
    ];
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockResolvedValue({ results: secrets }),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGetSecretContent("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current("secret:aabbccdd", 2);
    const errorAction = jujuActions.setSecretsContentErrors({
      modelUUID: "abc123",
      errors: "No secret data",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === errorAction.type),
      ).toMatchObject(errorAction);
    });
  });

  it("handles no secrets facade", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGetSecretContent("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current("secret:aabbccdd", 2);
    const errorAction = jujuActions.setSecretsContentErrors({
      modelUUID: "abc123",
      errors: Label.NO_SECRETS_FACADE_ERROR,
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === errorAction.type),
      ).toMatchObject(errorAction);
    });
  });

  it("stores errors from fetching secrets", async () => {
    const [store, storeActions] = createStore(state, { trackActions: true });
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            listSecrets: vi
              .fn()
              .mockImplementation(
                vi.fn().mockRejectedValue(new Error("Uh oh!")),
              ),
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGetSecretContent("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    result.current("secret:aabbccdd", 2);
    const errorAction = jujuActions.setSecretsContentErrors({
      modelUUID: "abc123",
      errors: "Uh oh!",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        storeActions.find((dispatch) => dispatch.type === errorAction.type),
      ).toMatchObject(errorAction);
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
    new LocalAuth(vi.fn());
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("can create secrets", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const results = { results: [{ result: "secret:def456" }] };
    const createSecrets = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            createSecrets,
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).resolves.toBe(results);
    expect(createSecrets).toHaveBeenCalledWith({ args: secrets });
  });

  it("handles no secrets facade", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useCreateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toStrictEqual(
      new Error(Label.NO_SECRETS_FACADE_ERROR),
    );
  });
});

describe("useUpdateSecrets", () => {
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

  it("can update secrets", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        "existing-label": "old label",
        uri: "secret:aabbccdd",
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const results = { results: [{ result: "secret:def456" }] };
    const updateSecrets = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            updateSecrets,
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useUpdateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).resolves.toBe(results);
    expect(updateSecrets).toHaveBeenCalledWith({ args: secrets });
  });

  it("handles no secrets facade", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        "existing-label": "old label",
        uri: "secret:aabbccdd",
        label: "a secret",
        "owner-tag": "model-abc123",
        UpsertSecretArg: {},
      },
    ];
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useUpdateSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toStrictEqual(
      new Error(Label.NO_SECRETS_FACADE_ERROR),
    );
  });
});

describe("useRemoveSecrets", () => {
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

  it("can remove secrets", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        uri: "secret:aabbccdd",
      },
    ];
    const results = { results: [{ result: "secret:def456" }] };
    const removeSecrets = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            removeSecrets,
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useRemoveSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).resolves.toBe(results);
    expect(removeSecrets).toHaveBeenCalledWith({ args: secrets });
  });

  it("handles no secrets facade", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const secrets = [
      {
        uri: "secret:aabbccdd",
      },
    ];
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useRemoveSecrets("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(result.current(secrets)).rejects.toStrictEqual(
      new Error(Label.NO_SECRETS_FACADE_ERROR),
    );
  });
});

describe("useGrantSecret", () => {
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

  it("can grant apps", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const results = { results: [{ result: "secret:def456" }] };
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            grantSecret,
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGrantSecret("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(
      result.current("secret:aabbccdd", ["lxd", "etcd"]),
    ).resolves.toBe(results);
    expect(grantSecret).toHaveBeenCalledWith({
      applications: ["lxd", "etcd"],
      uri: "secret:aabbccdd",
    });
  });

  it("handles no secrets facade", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useGrantSecret("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(
      result.current("secret:aabbccdd", ["lxd", "etcd"]),
    ).rejects.toStrictEqual(new Error(Label.NO_SECRETS_FACADE_ERROR));
  });
});

describe("useRevokeSecret", () => {
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

  it("can revoke apps", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const results = { results: [{ result: "secret:def456" }] };
    const revokeSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(results));
    const loginResponse = {
      conn: {
        facades: {
          secrets: {
            revokeSecret,
          },
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useRevokeSecret("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(
      result.current("secret:aabbccdd", ["lxd", "etcd"]),
    ).resolves.toBe(results);
    expect(revokeSecret).toHaveBeenCalledWith({
      applications: ["lxd", "etcd"],
      uri: "secret:aabbccdd",
    });
  });

  it("handles no secrets facade", async () => {
    const store = createStore(state);
    changeURL("/models/eggman@external/group-test/app/etcd");
    const loginResponse = {
      conn: {
        facades: {},
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(
      vi.fn().mockResolvedValue(loginResponse),
    );
    const { result } = renderHook(
      () => useRevokeSecret("eggman@external", "test-model"),
      {
        wrapper: (props) => (
          <ComponentProviders
            {...props}
            path="/models/:qualifier/:modelName/app/:appName"
            store={store}
          />
        ),
      },
    );
    await expect(
      result.current("secret:aabbccdd", ["lxd", "etcd"]),
    ).rejects.toStrictEqual(new Error(Label.NO_SECRETS_FACADE_ERROR));
  });
});
