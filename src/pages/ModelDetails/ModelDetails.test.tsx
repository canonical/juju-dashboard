import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { screen, waitFor } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import * as juju from "juju/api";
import { EntityDetailsLabel } from "pages/EntityDetails";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { createStore, renderComponent } from "testing/utils";
import urls from "urls";

import ModelDetails from "./ModelDetails";

vi.mock("pages/EntityDetails/App", () => {
  return { default: (): JSX.Element => <div data-testid="app"></div> };
});

vi.mock("pages/EntityDetails/Model", () => {
  return { default: (): JSX.Element => <div data-testid="model"></div> };
});

vi.mock("pages/EntityDetails/Unit", () => {
  return { default: (): JSX.Element => <div data-testid="unit"></div> };
});

vi.mock("pages/EntityDetails/Machine", () => {
  return { default: (): JSX.Element => <div data-testid="machine"></div> };
});

vi.mock("@canonical/jujulib", () => ({
  connectAndLogin: vi.fn(),
}));

describe("ModelDetails", () => {
  let state: RootState;
  let client: {
    conn: Connection;
    logout: () => void;
  };
  const path = `${urls.model.index(null)}/*`;
  const url = urls.model.index({
    modelName: "test-model",
    userName: "eggman@external",
  });

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build(),
        },
      }),
    });
    client = {
      conn: {
        info: {
          serverVersion: "3.2.1",
        },
        facades: {
          client: {
            fullStatus: vi.fn(),
            watchAll: vi.fn().mockReturnValue({ "watcher-id": "123" }),
          },
          allWatcher: {
            next: vi.fn(),
            stop: vi.fn(),
          },
        },
        transport: {
          close: vi.fn(),
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it("should start the watcher when displaying the model", async () => {
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
    renderComponent(<ModelDetails />, { path, url, state });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId("model");
    expect(client.conn.facades.client.watchAll).toHaveBeenCalled();
  });

  it("should load the full status when using pre 3.2 Juju", async () => {
    const status = fullStatusFactory.build();
    client.conn.facades.client.fullStatus.mockReturnValue(status);
    client.conn.info.serverVersion = "3.1.99";
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<ModelDetails />, { path, url, store });
    const action = jujuActions.populateMissingAllWatcherData({
      uuid: "abc123",
      status,
    });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId("model");
    expect(
      actions.find((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });

  it("should not load the full status when using Juju 3.2", async () => {
    client.conn.info.serverVersion = "3.2.99";
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<ModelDetails />, { path, url, store });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId("model");
    expect(client.conn.facades.client.fullStatus).not.toHaveBeenCalled();
    expect(
      actions.find(
        (dispatch) =>
          dispatch.type === jujuActions.populateMissingAllWatcherData.type,
      ),
    ).toBeUndefined();
  });

  it("should stop watching the model on unmount", async () => {
    const { result } = renderComponent(<ModelDetails />, { path, url, state });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId("model");
    result.unmount();
    expect(client.conn.facades.allWatcher.stop).toHaveBeenCalled();
  });

  it("should display the model page", async () => {
    renderComponent(<ModelDetails />, { path, url, state });
    expect(await screen.findByTestId("model")).toBeInTheDocument();
  });

  it("should display the app page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.app.index({
        modelName: "test-model",
        userName: "eggman@external",
        appName: "ceph",
      }),
    });
    expect(await screen.findByTestId("app")).toBeInTheDocument();
  });

  it("should display the unit page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.unit({
        modelName: "test-model",
        userName: "eggman@external",
        appName: "ceph",
        unitId: "ceph-0",
      }),
    });
    expect(await screen.findByTestId("unit")).toBeInTheDocument();
  });

  it("should display the machine page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.machine({
        modelName: "test-model",
        userName: "eggman@external",
        machineId: "1",
      }),
    });
    expect(await screen.findByTestId("machine")).toBeInTheDocument();
  });

  it("should display error if startModelWatcher timed out", async () => {
    vi.spyOn(juju, "startModelWatcher").mockRejectedValue("timeout");
    renderComponent(<ModelDetails />, { path, url, state });
    await waitFor(() => {
      expect(document.querySelector(".p-notification--negative")).toBeVisible();
    });
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent(EntityDetailsLabel.MODEL_WATCHER_TIMEOUT);
  });

  it("should display error if fullStatus request fails", async () => {
    client.conn.info.serverVersion = "3.1.99";
    client.conn.facades.client.fullStatus.mockRejectedValue(
      Error("fullStatus failed"),
    );
    renderComponent(<ModelDetails />, { path, url, state });
    await waitFor(() => {
      expect(document.querySelector(".p-notification--negative")).toBeVisible();
    });
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("fullStatus failed");
  });

  it("should display console error when trying to stop model watcher", async () => {
    vi.spyOn(juju, "startModelWatcher").mockImplementation(
      vi.fn().mockResolvedValue({
        conn: client.conn,
        watcherHandle: { "watcher-id": "1" },
        pingerIntervalId: 1,
      }),
    );
    vi.spyOn(juju, "stopModelWatcher").mockImplementation(
      vi.fn().mockRejectedValue(new Error("Failed to stop model watcher!")),
    );

    const {
      result: { unmount },
    } = renderComponent(<ModelDetails />, { path, url, state });
    await waitFor(() =>
      expect(juju.startModelWatcher).toHaveBeenCalledTimes(1),
    );
    unmount();
    await waitFor(() => expect(juju.stopModelWatcher).toHaveBeenCalledTimes(1));
  });
});
