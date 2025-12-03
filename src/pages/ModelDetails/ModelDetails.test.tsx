import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { act, screen, waitFor } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import * as juju from "juju/api";
import type { AllWatcherDelta, ApplicationChangeDelta } from "juju/types";
import { EntityDetailsLabel } from "pages/EntityDetails";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { createStore, renderComponent } from "testing/utils";
import urls from "urls";

import ModelDetails from "./ModelDetails";

const APP_TEST_ID = "app";
const MACHINE_TEST_ID = "machine";
const MODEL_TEST_ID = "model";
const UNIT_TEST_ID = "unit";

vi.mock("pages/EntityDetails/App", () => {
  return { default: (): JSX.Element => <div data-testid={APP_TEST_ID}></div> };
});

vi.mock("pages/EntityDetails/Model", () => {
  return {
    default: (): JSX.Element => <div data-testid={MODEL_TEST_ID}></div>,
  };
});

vi.mock("pages/EntityDetails/Unit", () => {
  return { default: (): JSX.Element => <div data-testid={UNIT_TEST_ID}></div> };
});

vi.mock("pages/EntityDetails/Machine", () => {
  return {
    default: (): JSX.Element => <div data-testid={MACHINE_TEST_ID}></div>,
  };
});

vi.mock("@canonical/jujulib", () => ({
  connectAndLogin: vi.fn(),
}));

function applicationDeployDelta(name: string): AllWatcherDelta {
  return [
    "application",
    "change",
    {
      "model-uuid": "abc123",
      name,
    } as ApplicationChangeDelta,
  ] as AllWatcherDelta;
}

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
        facades: {
          client: {
            fullStatus: vi.fn(),
            watchAll: vi.fn().mockReturnValue({ "watcher-id": "123" }),
          },
          allWatcher: {
            next: vi.fn().mockReturnValue(new Promise(() => {})),
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
    renderComponent(<ModelDetails />, { path, url, state });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId(MODEL_TEST_ID);
    expect(client.conn.facades.client.watchAll).toHaveBeenCalled();
  });

  it("should stop watching the model on unmount", async () => {
    const { result } = renderComponent(<ModelDetails />, { path, url, state });
    // Wait for the component to be rendered so that async methods have completed.
    await screen.findByTestId(MODEL_TEST_ID);
    result.unmount();
    expect(client.conn.facades.allWatcher.stop).toHaveBeenCalled();
  });

  it("should display the model page", async () => {
    renderComponent(<ModelDetails />, { path, url, state });
    expect(await screen.findByTestId(MODEL_TEST_ID)).toBeInTheDocument();
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
    expect(await screen.findByTestId(APP_TEST_ID)).toBeInTheDocument();
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
    expect(await screen.findByTestId(UNIT_TEST_ID)).toBeInTheDocument();
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
    expect(await screen.findByTestId(MACHINE_TEST_ID)).toBeInTheDocument();
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

  it("should display console error when trying to stop model watcher", async () => {
    vi.spyOn(juju, "startModelWatcher").mockImplementation(
      vi.fn().mockResolvedValue({
        conn: client.conn,
        watcherHandle: { "watcher-id": "1" },
        pingerIntervalId: 1,
        next: async () => new Promise(() => {}),
      }),
    );
    vi.spyOn(juju, "stopModelWatcher").mockImplementation(
      vi.fn().mockRejectedValue(new Error("Failed to stop model watcher!")),
    );

    const {
      result: { unmount },
    } = renderComponent(<ModelDetails />, { path, url, state });
    await waitFor(() => {
      expect(juju.startModelWatcher).toHaveBeenCalledTimes(1);
    });
    unmount();
    await waitFor(() => {
      expect(juju.stopModelWatcher).toHaveBeenCalledTimes(1);
    });
  });

  it("should update model information when watcher updates", async () => {
    const watcherNextMock = vi
      .fn()
      .mockResolvedValueOnce({ deltas: [applicationDeployDelta("new-name")] })
      .mockReturnValue(new Promise(() => {}));

    vi.spyOn(juju, "startModelWatcher").mockResolvedValue({
      conn: client.conn,
      watcherHandle: { "watcher-id": "1" },
      pingerIntervalId: 1,
      next: watcherNextMock,
    });

    const [store, actions] = createStore(state, { trackActions: true });

    await act(async () =>
      renderComponent(<ModelDetails />, { path, url, store }),
    );

    const action = jujuActions.processAllWatcherDeltas([
      applicationDeployDelta("new-name"),
    ]);
    expect(
      actions.findLast((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });

  it("should update model information when multiple updates are passed in", async () => {
    const { promise, resolve } = Promise.withResolvers();

    const watcherNextMock = vi
      .fn()
      .mockResolvedValueOnce({ deltas: [applicationDeployDelta("new-name")] })
      .mockReturnValueOnce(promise)
      .mockReturnValue(new Promise(() => {}));

    vi.spyOn(juju, "startModelWatcher").mockResolvedValue({
      conn: client.conn,
      watcherHandle: { "watcher-id": "1" },
      pingerIntervalId: 1,
      next: watcherNextMock,
    });

    const [store, actions] = createStore(state, { trackActions: true });

    await act(async () =>
      renderComponent(<ModelDetails />, { path, url, store }),
    );

    // Find the first action.
    const action = jujuActions.processAllWatcherDeltas([
      applicationDeployDelta("new-name"),
    ]);
    expect(
      actions.findLast((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);

    // Trigger the next update.
    await act(async () => {
      resolve({ deltas: [applicationDeployDelta("another-application")] });
    });

    // Find the second action.
    const anotherAction = jujuActions.processAllWatcherDeltas([
      applicationDeployDelta("another-application"),
    ]);
    expect(
      actions.findLast((dispatch) => dispatch.type === anotherAction.type),
    ).toMatchObject(anotherAction);
  });
});
