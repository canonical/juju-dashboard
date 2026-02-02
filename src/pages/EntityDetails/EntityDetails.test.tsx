import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { vi } from "vitest";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import { applicationStatusFactory } from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { controllerFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import EntityDetails from "./EntityDetails";
import { Label } from "./types";

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

describe("Entity Details Container", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/kirk@external/enterprise";

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
        credentials: {
          "wss://example.com:17070/api": credentialFactory.build({
            user: "user-kirk@external",
          }),
        },
      }),
      juju: jujuStateFactory.build({
        controllers: {
          "wss://example.com:17070/api": [
            controllerFactory.build({ uuid: "controller123" }),
          ],
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              "controller-uuid": "controller123",
              name: "enterprise",
              "owner-tag": "user-kirk@external",
            }),
            applications: {
              "ceph-mon": applicationStatusFactory.build(),
            },
          }),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        modelsLoaded: true,
      }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it("should display the correct window title", () => {
    renderComponent(<EntityDetails />, { path, url, state });
    expect(document.title).toEqual("Model: enterprise | Juju Dashboard");
  });

  it("should show a spinner if waiting on model list data", () => {
    state.juju.modelsLoaded = false;
    state.juju.modelWatcherData = {};
    state.juju.modelData = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
  });

  it("should show a spinner if waiting on model data", () => {
    state.juju.modelWatcherData = {};
    state.juju.modelData = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
  });

  it("should show a not found message if the model does not exist", () => {
    state.juju.models = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND }),
    ).toBeInTheDocument();
  });

  it("shows the supplied child", async () => {
    const children = "Hello I am a child!";
    renderComponent(<EntityDetails />, {
      path,
      url,
      routeChildren: [{ path: "", element: children }],
      state,
    });
    expect(await screen.findByText(children)).toBeInTheDocument();
  });

  it("gives the header a class when the header should be a single column", async () => {
    renderComponent(<EntityDetails />, {
      path: "/models/:userName/:modelName/app/:appName",
      url: "/models/eggman@external/group-test/app/etcd",
      state,
    });
    await waitFor(() => {
      expect(document.querySelector(".entity-details__header")).toHaveClass(
        "entity-details__header--single-col",
      );
    });
  });

  it("gives the content the correct class for the model", () => {
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      document.querySelector(".entity-details__model"),
    ).toBeInTheDocument();
  });

  it("gives the content the correct class for an app", () => {
    renderComponent(<EntityDetails />, {
      path: urls.model.app.index(null),
      url: urls.model.app.index({
        userName: "kirk@external",
        modelName: "enterprise",
        appName: "etcd",
      }),
      state,
    });
    expect(document.querySelector(".entity-details__app")).toBeInTheDocument();
  });

  it("gives the content the correct class for a machine", () => {
    renderComponent(<EntityDetails />, {
      path: urls.model.machine(null),
      url: urls.model.machine({
        userName: "kirk@external",
        modelName: "enterprise",
        machineId: "1",
      }),
      state,
    });
    expect(
      document.querySelector(".entity-details__machine"),
    ).toBeInTheDocument();
  });

  it("gives the content the correct class for a unit", () => {
    renderComponent(<EntityDetails />, {
      path: urls.model.unit(null),
      url: urls.model.unit({
        userName: "kirk@external",
        modelName: "enterprise",
        appName: "etcd",
        unitId: "etcd-0",
      }),
      state,
    });
    expect(document.querySelector(".entity-details__unit")).toBeInTheDocument();
  });

  it("should show watcher model data timeout error", () => {
    renderComponent(<EntityDetails modelWatcherError="timeout" />, {
      path,
      url,
      state,
    });
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent(Label.MODEL_WATCHER_TIMEOUT);
  });

  it("should show watcher model custom error", () => {
    renderComponent(<EntityDetails modelWatcherError="custom error" />, {
      path,
      url,
      state,
    });
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent(`${Label.MODEL_WATCHER_ERROR} custom error`);
  });

  it("should refresh page when pressing pressing Refresh button within error notification", async () => {
    const reloadSpy = vi.spyOn(window.location, "reload");
    renderComponent(<EntityDetails modelWatcherError="timeout" />, {
      path,
      url,
      state,
    });
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    reloadSpy.mockReset();
  });
});
