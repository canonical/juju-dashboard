import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

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

const mockStore = configureStore([]);

type Props = {
  children?: ReactNode;
  type?: string;
  onApplicationsFilter?: (query: string) => void;
};

describe("Entity Details Container", () => {
  let state: RootState;
  function renderComponent({
    props,
    storeState = state,
    path = "/models/kirk@external/enterprise",
    urlPattern = "/models/:userName/:modelName",
  }: {
    props?: Props;
    storeState?: RootState;
    path?: string;
    urlPattern?: string;
  } = {}) {
    const store = mockStore(storeState);

    window.history.pushState({}, "", path);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={urlPattern} element={<EntityDetails />}>
              {props?.children}
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  }

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
    renderComponent();
    expect(document.title).toEqual("Model: enterprise | Juju Dashboard");
  });

  it("should show a spinner if waiting on model list data", () => {
    state.juju.modelsLoaded = false;
    state.juju.modelWatcherData = {};
    renderComponent({
      storeState: state,
    });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should show a spinner if waiting on model data", () => {
    state.juju.modelWatcherData = {};
    renderComponent({
      storeState: state,
    });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should show a not found message if the model does not exist", () => {
    state.juju.models = {};
    renderComponent({
      storeState: state,
    });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND })
    ).toBeInTheDocument();
  });

  it("lists the correct tabs", () => {
    renderComponent({ props: { type: "model" } });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsAction LogsMachines$/
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
    renderComponent({
      props: { type: "model" },
      storeState: state,
    });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsAction Logs$/
    );
  });

  it("clicking the tabs changes the visible section", () => {
    renderComponent({ props: { type: "model" } });
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
        text: "Action Logs",
        query: "action-logs",
      },
      {
        text: "Machines",
        query: "machines",
      },
    ];
    sections.forEach(async (section) => {
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

  it("shows the supplied child", () => {
    const children = "Hello I am a child!";
    renderComponent({
      props: { children: <Route path="" element={children} /> },
    });
    expect(screen.getByText(children)).toBeInTheDocument();
  });

  it("shows the CLI in juju 2.9", async () => {
    renderComponent();
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
    renderComponent();
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
    renderComponent({
      storeState: state,
    });
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
    });
  });

  it("gives the content a class when the webCLI is shown", async () => {
    renderComponent();
    await waitFor(() => {
      expect(document.querySelector(".l-content")).toHaveClass(
        "l-content--has-webcli"
      );
    });
  });

  it("passes the controller details to the webCLI", async () => {
    const cliComponent = jest
      .spyOn(WebCLIModule, "default")
      .mockImplementation(jest.fn());
    renderComponent();
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

  it("gives the header a class when the header shouldbe a single column", async () => {
    renderComponent({
      path: "/models/eggman@external/group-test/app/etcd",
      urlPattern: "/models/:userName/:modelName/app/:appName",
    });
    await waitFor(() => {
      expect(document.querySelector(".entity-details__header")).toHaveClass(
        "entity-details__header--single-col"
      );
    });
  });

  it("shows the search & filter box in the apps tab", async () => {
    renderComponent({
      path: "/models/eggman@external/group-test",
      urlPattern: "/models/:userName/:modelName",
    });
    await waitFor(() => {
      expect(screen.getByTestId("filter-applications")).toBeInTheDocument();
    });
  });

  it("does not the search & filter box for subsections", async () => {
    renderComponent({
      path: "/models/eggman@external/group-test/app/etcd",
      urlPattern: "/models/:userName/:modelName/app/:appName",
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("filter-applications")
      ).not.toBeInTheDocument();
    });
  });

  it("does not the search & filter box for non-apps tabs", async () => {
    renderComponent({
      path: "/models/eggman@external/group-test?activeView=integrations",
      urlPattern: "/models/:userName/:modelName",
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("filter-applications")
      ).not.toBeInTheDocument();
    });
  });

  it("searches when the 'enter' key is pressed", async () => {
    renderComponent();
    expect(window.location.search).toEqual("");
    await userEvent.type(screen.getByRole("searchbox"), "what{Enter}");
    expect(window.location.search).toEqual("?filterQuery=what");
  });

  it("does not search when other keys are pressed", async () => {
    renderComponent();
    expect(window.location.search).toEqual("");
    await userEvent.type(screen.getByRole("searchbox"), "what{Shift}");
    expect(window.location.search).toEqual("");
  });

  it("gives the content the correct class for the model", async () => {
    renderComponent();
    expect(
      document.querySelector(".entity-details__model")
    ).toBeInTheDocument();
  });

  it("gives the content the correct class for an app", async () => {
    renderComponent({
      path: urls.model.app.index({
        userName: "kirk@external",
        modelName: "enterprise",
        appName: "etcd",
      }),
      urlPattern: urls.model.app.index(null),
    });
    expect(document.querySelector(".entity-details__app")).toBeInTheDocument();
  });

  it("gives the content the correct class for a machine", async () => {
    renderComponent({
      path: urls.model.machine({
        userName: "kirk@external",
        modelName: "enterprise",
        machineId: "1",
      }),
      urlPattern: urls.model.machine(null),
    });
    expect(
      document.querySelector(".entity-details__machine")
    ).toBeInTheDocument();
  });

  it("gives the content the correct class for a unit", async () => {
    renderComponent({
      path: urls.model.unit({
        userName: "kirk@external",
        modelName: "enterprise",
        appName: "etcd",
        unitId: "etcd-0",
      }),
      urlPattern: urls.model.unit(null),
    });
    expect(document.querySelector(".entity-details__unit")).toBeInTheDocument();
  });
});
