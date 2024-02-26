import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { renderHook } from "@testing-library/react";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { applicationsCharmActionsResultsFactory } from "testing/factories/juju/ActionV7";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { ComponentProviders, changeURL } from "testing/utils";

import {
  Label,
  useGetActionsForApplication,
  useExecuteActionOnUnits,
  useQueryOperationsList,
  useQueryActionsList,
} from "./actions";

const mockStore = configureStore<RootState, unknown>([]);

jest.mock("@canonical/jujulib", () => ({
  connectAndLogin: jest.fn(),
}));

describe("actions", () => {
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

  describe("useGetActionsForApplication", () => {
    it("handles no actions facade", async () => {
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
        () => useGetActionsForApplication("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(result.current("etcd")).rejects.toStrictEqual(
        Label.NO_ACTION_FACADE_ERROR,
      );
    });

    it("gets actions for an application", async () => {
      const store = mockStore(state);
      changeURL("/models/eggman@external/group-test/app/etcd");
      const actionList = applicationsCharmActionsResultsFactory.build();
      const loginResponse = {
        conn: {
          facades: {
            action: {
              applicationsCharmsActions: jest
                .fn()
                .mockImplementation(() => Promise.resolve(actionList)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useGetActionsForApplication("eggman@external", "test-model"),
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
      await expect(result.current("etcd")).resolves.toBe(actionList);
      expect(
        loginResponse.conn.facades.action.applicationsCharmsActions,
      ).toHaveBeenCalledWith({
        entities: [{ tag: "application-etcd" }],
      });
    });
  });

  describe("useExecuteActionOnUnits", () => {
    it("handles no actions facade", async () => {
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
        () => useExecuteActionOnUnits("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(
        result.current(["etcd/0", "mysql/2"], "reboot", { extra: "options" }),
      ).rejects.toStrictEqual(Label.NO_ACTION_FACADE_ERROR);
    });

    it("can execute actions on units", async () => {
      const store = mockStore(state);
      changeURL("/models/eggman@external/group-test/app/etcd");
      const returnResult = { operation: "rebooting" };
      const loginResponse = {
        conn: {
          facades: {
            action: {
              enqueueOperation: jest
                .fn()
                .mockImplementation(() => Promise.resolve(returnResult)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useExecuteActionOnUnits("eggman@external", "test-model"),
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
      await expect(
        result.current(["etcd/0", "mysql/2"], "reboot", { extra: "options" }),
      ).resolves.toBe(returnResult);
      expect(
        loginResponse.conn.facades.action.enqueueOperation,
      ).toHaveBeenCalledWith({
        actions: [
          {
            name: "reboot",
            receiver: "unit-etcd-0",
            parameters: { extra: "options" },
            tag: "",
          },
          {
            name: "reboot",
            receiver: "unit-mysql-2",
            parameters: { extra: "options" },
            tag: "",
          },
        ],
      });
    });
  });

  describe("useQueryOperationsList", () => {
    it("handles no actions facade", async () => {
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
        () => useQueryOperationsList("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(
        result.current({
          limit: 99,
        }),
      ).rejects.toStrictEqual(Label.NO_ACTION_FACADE_ERROR);
    });

    it("get the operations list", async () => {
      const store = mockStore(state);
      changeURL("/models/eggman@external/group-test/app/etcd");
      const returnResult = { results: [], truncated: true };
      const loginResponse = {
        conn: {
          facades: {
            action: {
              listOperations: jest
                .fn()
                .mockImplementation(() => Promise.resolve(returnResult)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useQueryOperationsList("eggman@external", "test-model"),
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
      await expect(
        result.current({
          limit: 99,
        }),
      ).resolves.toBe(returnResult);
      expect(
        loginResponse.conn.facades.action.listOperations,
      ).toHaveBeenCalledWith({
        actions: [],
        applications: [],
        limit: 99,
        machines: [],
        offset: 0,
        status: [],
        units: [],
      });
    });
  });

  describe("useQueryActionsList", () => {
    it("handles no actions facade", async () => {
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
        () => useQueryActionsList("eggman@external", "test-model"),
        {
          wrapper: (props) => (
            <ComponentProviders {...props} path={path} store={store} />
          ),
        },
      );
      await expect(
        result.current({
          entities: [{ tag: "one" }],
        }),
      ).rejects.toStrictEqual(Label.NO_ACTION_FACADE_ERROR);
    });

    it("can get the actions list", async () => {
      const store = mockStore(state);
      changeURL("/models/eggman@external/group-test/app/etcd");
      const returnResult = { results: [] };
      const loginResponse = {
        conn: {
          facades: {
            action: {
              actions: jest
                .fn()
                .mockImplementation(() => Promise.resolve(returnResult)),
            },
          },
        } as unknown as Connection,
        logout: jest.fn(),
      };
      jest
        .spyOn(jujuLib, "connectAndLogin")
        .mockImplementation(() => Promise.resolve(loginResponse));
      const { result } = renderHook(
        () => useQueryActionsList("eggman@external", "test-model"),
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
      const args = {
        entities: [{ tag: "one" }],
      };
      await expect(result.current(args)).resolves.toBe(returnResult);
      expect(loginResponse.conn.facades.action.actions).toHaveBeenCalledWith(
        args,
      );
    });
  });
});
