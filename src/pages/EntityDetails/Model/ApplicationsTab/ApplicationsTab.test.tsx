import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import ApplicationsTab from "./ApplicationsTab";

const mockStore = configureStore([]);

// mock getCharmsFromApplications
jest.mock("juju/api", () => {
  return {
    getCharmsFromApplications: () => ({
      data: [],
      loading: false,
    }),
  };
});

describe("ApplicationsTab", () => {
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
        models: {
          test123: {
            name: "test-model",
            uuid: "test123",
            ownerTag: "test@external",
            type: "iaas",
          },
        },
        modelWatcherData: {
          test123: modelWatcherModelDataFactory.build({
            applications: {
              mysql1: charmApplicationFactory.build({
                name: "mysql1",
              }),
              mysql2: charmApplicationFactory.build({
                name: "mysql2",
              }),
              db2: charmApplicationFactory.build({
                name: "db2",
              }),
              db1: charmApplicationFactory.build({
                name: "db1",
              }),
              "jupyter-controller": charmApplicationFactory.build({
                name: "jupyter-controller",
              }),
              "jupyter-ui": charmApplicationFactory.build({
                name: "jupyter-ui",
              }),
              redis1: charmApplicationFactory.build({
                name: "redis1",
              }),
            },
            charms: {
              "ch:amd64/focal/postgresql-k8s-20": {
                "model-uuid": "test123",
                "charm-url": "ch:amd64/focal/postgresql-k8s-20",
                "charm-version": "",
                life: "alive",
                profile: null,
              },
            },
          }),
        },
      }),
    });
  });

  function renderComponent({
    applications,
    filterQuery = "",
    selectedApps,
  }: {
    applications: boolean;
    filterQuery?: string;
    selectedApps?: boolean;
  }) {
    if (!applications) {
      storeData.juju.modelWatcherData = {};
    }
    if (selectedApps && applications) {
      storeData.juju.selectedApplications = [charmApplicationFactory.build()];
    }
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/test@external/test-model"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<ApplicationsTab filterQuery={filterQuery} />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  it("displays a message when there are no applications", () => {
    renderComponent({ applications: false });
    expect(
      screen.queryByText(
        /There are no applications associated with this model/i
      )
    ).toBeInTheDocument();
  });

  it("shows the applications table when there are applications", () => {
    renderComponent({ applications: true });
    expect(
      screen.queryByText(
        /There are no applications associated with this model/i
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/db1/i)).toBeInTheDocument();
  });

  it("shows all the application by default", () => {
    renderComponent({ applications: true });
    expect(screen.queryAllByRole("row")).toHaveLength(8);
  });

  it("doesn't show the select column when there is no search", () => {
    renderComponent({ applications: true });
    // first column not to be a checkbox
    expect(
      screen.queryAllByRole("columnheader")[0].querySelector("input")
    ).not.toBeInTheDocument();
  });

  it("shows the select column when there is a search", () => {
    renderComponent({ applications: true, filterQuery: "db" });
    // first column to be a checkbox
    expect(
      screen.queryAllByRole("columnheader")[0].querySelector("input")
    ).toBeInTheDocument();
  });

  it("doesn't show the run action button when there is no search", () => {
    renderComponent({ applications: true });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeInTheDocument();
  });

  it("shows the run action button when there is a search", () => {
    renderComponent({ applications: true, filterQuery: "db" });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).toBeInTheDocument();
  });

  it("disable the run action button when there are no applications selected", () => {
    renderComponent({ applications: true, filterQuery: "db" });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).toBeDisabled();
  });

  it("enable the run action button when there is at least one application selected", () => {
    renderComponent({
      applications: true,
      filterQuery: "db",
      selectedApps: true,
    });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeDisabled();
  });
});
