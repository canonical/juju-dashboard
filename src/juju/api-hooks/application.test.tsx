import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { renderHook } from "@testing-library/react";
import configureStore from "redux-mock-store";

import type { Config } from "juju/api";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  applicationGetFactory,
  errorResultsFactory,
} from "testing/factories/juju/Application";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { ComponentProviders, changeURL } from "testing/utils";

import {
  Label,
  useGetApplicationConfig,
  useSetApplicationConfig,
} from "./application";

const mockStore = configureStore<RootState, unknown>([]);

jest.mock("@canonical/jujulib", () => ({
  connectAndLogin: jest.fn(),
}));

describe("application", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url = "/models/eggman@external/group-test/app/etcd";

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

  describe("useGetApplicationConfig", () => {
    it("handles no application facade", async () => {
      const store = mockStore(state);
      changeURL(url);
      const loginResponse = {
        conn: {
          facades: {},
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useGetApplicationConfig("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(result.current("etcd")).rejects.toStrictEqual(
        Label.NO_APP_FACADE_ERROR,
      );
    });

    it("can get app config", async () => {
      const config = applicationGetFactory.build();
      const store = mockStore(state);
      changeURL(url);
      const loginResponse = {
        conn: {
          facades: {
            application: {
              get: jest.fn().mockImplementation(() => Promise.resolve(config)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useGetApplicationConfig("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(result.current("etcd")).resolves.toMatchObject(config);
      expect(loginResponse.conn.facades.application.get).toHaveBeenCalledWith({
        application: "etcd",
        branch: "",
      });
    });
  });

  describe("useSetApplicationConfig", () => {
    it("handles no application facade", async () => {
      const config: Config = {
        updateThis: {
          name: "changed config",
          description: "desc",
          source: "default",
          type: "string",
          newValue: "new val",
        },
      };
      const store = mockStore(state);
      changeURL(url);
      const loginResponse = {
        conn: {
          facades: {},
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useSetApplicationConfig("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(result.current("etcd", config)).rejects.toStrictEqual(
        Label.NO_APP_FACADE_ERROR,
      );
    });

    it("can set app config", async () => {
      const config: Config = {
        ignore: {
          name: "this should be ignored because it doesn't have a new value",
          description: "",
          source: "default",
          type: "boolean",
        },
        updateThis: {
          name: "changed config",
          description: "desc",
          source: "default",
          type: "string",
          newValue: "new val",
        },
      };
      const store = mockStore(state);
      changeURL(url);
      const configResponse = errorResultsFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            application: {
              setConfigs: jest
                .fn()
                .mockImplementation(() => Promise.resolve(configResponse)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useSetApplicationConfig("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(result.current("etcd", config)).resolves.toMatchObject(
        configResponse,
      );
      expect(
        loginResponse.conn.facades.application.setConfigs,
      ).toHaveBeenCalledWith({
        Args: [
          {
            application: "etcd",
            config: {
              updateThis: "new val",
            },
            "config-yaml": "",
            generation: "",
          },
        ],
      });
    });

    it("converts all values to strings", async () => {
      const config: Config = {
        bool: {
          name: "bool",
          description: "",
          source: "default",
          type: "boolean",
          newValue: false,
        },
        int: {
          name: "int",
          description: "desc",
          source: "default",
          type: "int",
          newValue: 0,
        },
        float: {
          name: "float",
          description: "desc",
          source: "default",
          type: "float",
          newValue: 0.0,
        },
      };
      const store = mockStore(state);
      changeURL(url);
      const configResponse = errorResultsFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            application: {
              setConfigs: jest
                .fn()
                .mockImplementation(() => Promise.resolve(configResponse)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useSetApplicationConfig("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await result.current("etcd", config);
      expect(
        loginResponse.conn.facades.application.setConfigs,
      ).toHaveBeenCalledWith({
        Args: [
          {
            application: "etcd",
            config: {
              bool: "false",
              int: "0",
              float: "0",
            },
            "config-yaml": "",
            generation: "",
          },
        ],
      });
    });
  });
});
