import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";

import * as WebCLIModule from "components/WebCLI/WebCLI";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { controllerFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";
import urls from "urls";

import EntityDetails, { Label } from "./EntityDetails";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => ({
  __esModule: true,
  default: () => {
    return <div className="webcli" data-testid="webcli"></div>;
  },
}));

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
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        modelsLoaded: true,
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              "ceph-mon": applicationInfoFactory.build(),
            },
            model: modelWatcherModelInfoFactory.build({
              "controller-uuid": "controller123",
              name: "enterprise",
              owner: "kirk@external",
            }),
          }),
        },
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should display the correct window title", () => {
    renderComponent(<EntityDetails />, { path, url, state });
    expect(document.title).toEqual("Model: enterprise | Juju Dashboard");
  });

  it("should show a spinner if waiting on model list data", () => {
    state.juju.modelsLoaded = false;
    state.juju.modelWatcherData = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should show a spinner if waiting on model data", () => {
    state.juju.modelWatcherData = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should show a not found message if the model does not exist", () => {
    state.juju.models = {};
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND })
    ).toBeInTheDocument();
  });

  it("lists the correct tabs", () => {
    renderComponent(<EntityDetails />, { path, url, state });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsLogsMachines$/
    );
  });

  it("lists the correct tabs for kubernetes", () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: "enterprise",
          owner: "kirk@external",
          type: "kubernetes",
        }),
      }),
    };
    renderComponent(<EntityDetails />, { path, url, state });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsLogs$/
    );
  });

  it("clicking the tabs changes the visible section", async () => {
    renderComponent(<EntityDetails />, { path, url, state });
    const viewSelector = screen.getByTestId("view-selector");
    const sections = [
      {
        text: "Applications",
        query: "apps",
      },
      {
        text: "Integrations",
        query: "integrations",
      },
      {
        text: "Logs",
        query: "logs",
      },
      {
        text: "Machines",
        query: "machines",
      },
    ];
    sections.forEach((section) => {
      const scrollIntoView = jest.fn();
      fireEvent.click(within(viewSelector).getByText(section.text), {
        target: {
          scrollIntoView,
        },
      });
      expect(scrollIntoView.mock.calls[0]).toEqual([
        {
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        },
      ]);
      expect(window.location.search).toEqual(`?activeView=${section.query}`);
    });
  });

  it("shows the supplied child", async () => {
    const children = "Hello I am a child!";
    renderComponent(<EntityDetails />, {
      path,
      url,
      routeChildren: <Route path="" element={children} />,
      state,
    });
    expect(await screen.findByText(children)).toBeInTheDocument();
  });

  it("shows the CLI in juju 2.9", async () => {
    renderComponent(<EntityDetails />, { path, url, state });
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).toBeInTheDocument();
    });
  });

  it("shows the CLI in juju higher than 2.9", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: "enterprise",
          owner: "kirk@external",
          version: "3.0.7",
          "controller-uuid": "controller123",
        }),
      }),
    };
    renderComponent(<EntityDetails />, { path, url, state });
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).toBeInTheDocument();
    });
  });

  it("does not show the webCLI in juju 2.8", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: "enterprise",
          owner: "kirk@external",
          version: "2.8.7",
        }),
      }),
    };
    renderComponent(<EntityDetails />, { path, url, state });
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
    });
  });

  it("passes the controller details to the webCLI", () => {
    const cliComponent = jest
      .spyOn(WebCLIModule, "default")
      .mockImplementation(jest.fn());
    renderComponent(<EntityDetails />, { path, url, state });
    expect(cliComponent.mock.calls[0][0]).toMatchObject({
      controllerWSHost: "example.com:17070",
      credentials: {
        password: "verysecure123",
        user: "user-kirk@external",
      },
      modelUUID: "abc123",
      protocol: "wss",
    });
    cliComponent.mockReset();
  });

  it("gives the header a class when the header should be a single column", async () => {
    renderComponent(<EntityDetails />, {
      path: "/models/:userName/:modelName/app/:appName",
      url: "/models/eggman@external/group-test/app/etcd",
      state,
    });
    await waitFor(() => {
      expect(document.querySelector(".entity-details__header")).toHaveClass(
        "entity-details__header--single-col"
      );
    });
  });

  it("gives the content the correct class for the model", () => {
    renderComponent(<EntityDetails />, { path, url, state });
    expect(
      document.querySelector(".entity-details__model")
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
      document.querySelector(".entity-details__machine")
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
      document.querySelector(".p-notification--negative")
    ).toHaveTextContent(Label.MODEL_WATCHER_TIMEOUT);
  });

  it("should show watcher model custom error", () => {
    renderComponent(<EntityDetails modelWatcherError="custom error" />, {
      path,
      url,
      state,
    });
    expect(
      document.querySelector(".p-notification--negative")
    ).toHaveTextContent(`${Label.MODEL_WATCHER_ERROR} custom error`);
  });

  it("should refresh page when pressing pressing Refresh button within error notification", async () => {
    // Copy of window.location is required in order to mock only its "reload"
    // method and set window.location back to default value at the end.
    const location: Location = window.location;
    // @ts-ignore
    delete window.location;
    window.location = {
      ...location,
      reload: jest.fn(),
    };

    renderComponent(<EntityDetails modelWatcherError="timeout" />, {
      path,
      url,
      state,
    });
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(window.location.reload).toHaveBeenCalledTimes(1);

    window.location = location;
  });

  it("should navigate correctly when pressing Action Logs tab under Juju", () => {
    state.general.config = configFactory.build({
      isJuju: true,
    });
    renderComponent(<EntityDetails />, { path, url, state });
    const viewSelector = screen.getByTestId("view-selector");
    const scrollIntoView = jest.fn();
    fireEvent.click(within(viewSelector).getByText("Action Logs"), {
      target: {
        scrollIntoView,
      },
    });
    expect(scrollIntoView.mock.calls[0]).toEqual([
      {
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      },
    ]);
    expect(window.location.search).toEqual("?activeView=logs");
  });
});
