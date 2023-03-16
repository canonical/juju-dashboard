import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";

import EntityDetails, { Label } from "./EntityDetails";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path={urlPattern}
                element={
                  <EntityDetails
                    type={props?.type}
                    onApplicationsFilter={props?.onApplicationsFilter}
                  >
                    {props?.children}
                  </EntityDetails>
                }
              />
            </Routes>
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
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
              name: "enterprise",
              owner: "kirk@external",
            }),
          }),
        },
      }),
    });
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
    renderComponent({ props: { children } });
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
});
