import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
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
      juju: jujuStateFactory.build(
        {},
        {
          transient: {
            models: [
              {
                name: "test-model",
                uuid: "816d67b1-4942-4420-8be2-07df30f7a1ce",
                owner: "user-kirk@external",
                type: "iaas",
                applications: {
                  "mysql-k8s": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "mysql-k8s",
                    exposed: false,
                    "charm-url": "ch:amd64/focal/mysql-k8s-2",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "unset",
                      message: "",
                      version: "",
                    },
                    "workload-version": "",
                    "unit-count": 3,
                  },
                  mysql2: {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "mysql2",
                    exposed: false,
                    "charm-url": "ch:amd64/jammy/mysql-k8s-31",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "unset",
                      message: "",
                      version: "",
                    },
                    "workload-version": "8.0.31-0ubuntu0.22.04.1",
                    "unit-count": 1,
                  },
                  db2: {
                    "unit-count": 2,
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "db2",
                    exposed: false,
                    "charm-url": "ch:amd64/focal/postgresql-k8s-41",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "active",
                      message: "",
                      since: "2023-01-26T06:41:05.303171453Z",
                      version: "",
                    },
                    "workload-version": "",
                  },
                  db1: {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "db1",
                    exposed: false,
                    "charm-url": "ch:amd64/focal/postgresql-k8s-20",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "unset",
                      message: "",
                      version: "",
                    },
                    "workload-version": "",
                    "unit-count": 1,
                  },
                  "jupyter-controller": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "jupyter-controller",
                    exposed: false,
                    "charm-url": "cs:~notebook-charmers/jupyter-controller-17",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "unset",
                      message: "",
                      version: "",
                    },
                    "workload-version": "",
                    "unit-count": 1,
                  },
                  "jupyter-ui": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "jupyter-ui",
                    exposed: false,
                    "charm-url": "cs:~notebook-charmers/jupyter-ui-17",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "unset",
                      message: "",
                      version: "",
                    },
                    "workload-version": "",
                    "unit-count": 1,
                  },
                  redis1: {
                    "unit-count": 1,
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    name: "redis1",
                    exposed: false,
                    "charm-url": "ch:amd64/focal/redis-k8s-23",
                    "owner-tag": "",
                    life: "alive",
                    "min-units": 0,
                    constraints: {
                      arch: "amd64",
                    },
                    subordinate: false,
                    status: {
                      current: "active",
                      message: "",
                      since: "2023-02-14T16:17:34.424231728Z",
                      version: "",
                    },
                    "workload-version": "7.0.4",
                  },
                },
                charms: {
                  "ch:amd64/focal/mysql-k8s-2": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "ch:amd64/focal/mysql-k8s-2",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                    config: {},
                  },
                  "ch:amd64/jammy/mysql-k8s-31": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "ch:amd64/jammy/mysql-k8s-31",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                    config: {},
                  },
                  "ch:amd64/focal/postgresql-k8s-20": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "ch:amd64/focal/postgresql-k8s-20",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                  },
                  "ch:amd64/focal/postgresql-k8s-41": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "ch:amd64/focal/postgresql-k8s-41",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                  },
                  "ch:amd64/focal/redis-k8s-23": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "ch:amd64/focal/redis-k8s-23",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                    config: {},
                  },
                  "cs:~notebook-charmers/jupyter-controller-17": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "cs:~notebook-charmers/jupyter-controller-17",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                    config: {},
                  },
                  "cs:~notebook-charmers/jupyter-ui-17": {
                    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
                    "charm-url": "cs:~notebook-charmers/jupyter-ui-17",
                    "charm-version": "",
                    life: "alive",
                    profile: null,
                    config: {},
                  },
                },
              },
            ],
          },
        }
      ),
    });
  });

  function renderComponent({
    applications,
    filterQuery = "",
  }: {
    applications: boolean;
    filterQuery?: string;
  }) {
    if (!applications) {
      storeData.juju.modelWatcherData = {};
    }
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-kirk@external/test-model"]}
        >
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
    renderComponent({ applications: true, filterQuery: "db" });
    const checkbox = screen.getByTestId("select-app-db1");
    checkbox.click();
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeDisabled();
  });

  it("enable the run action button when all applications are selected", () => {
    renderComponent({ applications: true, filterQuery: "db" });
    const checkbox = screen.getByTestId("select-all-apps");
    act(() => checkbox.click());
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeDisabled();
  });
});
