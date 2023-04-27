import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { getCharmsFromApplications } from "juju/api";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import {
  applicationOfferStatusFactory,
  remoteApplicationStatusFactory,
} from "testing/factories/juju/ClientV6";
import {
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";

import ApplicationsTab from "./ApplicationsTab";

const mockStore = configureStore([]);

// mock getCharmsFromApplications
jest.mock("juju/api", () => {
  return {
    getCharmsFromApplications: jest.fn().mockReturnValue(() => ({
      data: [],
      loading: false,
    })),
  };
});

describe("ApplicationsTab", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
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
      state.juju.modelWatcherData = {};
    }
    if (selectedApps && applications) {
      state.juju.selectedApplications = [charmApplicationFactory.build()];
    }
    const store = mockStore(state);
    window.history.pushState({}, "", "/models/test@external/test-model");
    const { rerender } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ApplicationsTab filterQuery={filterQuery} />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    return { store, rerender };
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
    expect(screen.queryAllByText(/db1/i)).toHaveLength(2);
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

  it("can select individual apps", async () => {
    const { store } = renderComponent({
      applications: true,
      filterQuery: "db",
    });
    await userEvent.click(screen.getByTestId("select-app-db1"));
    const actions = store.getActions();
    const db1 = state.juju.modelWatcherData?.test123.applications.db1;
    expect(db1).toBeTruthy();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: db1 ? [db1] : [],
    });
    expect(
      actions.find((action) => action.type === expectedAction.type)
    ).toMatchObject(expectedAction);
  });

  it("checks selected apps", async () => {
    if (state.juju.modelWatcherData?.test123.applications.db1) {
      state.juju.selectedApplications = [
        state.juju.modelWatcherData?.test123.applications.db1,
      ];
    }
    renderComponent({ applications: true, filterQuery: "db" });
    expect(screen.getByTestId("select-app-db1")).toBeChecked();
  });

  it("can select all apps", async () => {
    const { store } = renderComponent({
      applications: true,
      filterQuery: "db",
    });
    await userEvent.click(screen.getByTestId("select-all-apps"));
    const actions = store.getActions();
    const apps = state.juju.modelWatcherData?.test123.applications;
    expect(apps).toBeTruthy();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: Object.values(apps ?? {}),
    });
    const action = actions.find(
      (action) => action.type === expectedAction.type
    );
    expect(action.payload.selectedApplications).toHaveLength(
      expectedAction.payload.selectedApplications.length
    );
    expect(action.payload.selectedApplications).toEqual(
      expect.arrayContaining(expectedAction.payload.selectedApplications)
    );
  });

  it("can deselect all apps", async () => {
    const apps = state.juju.modelWatcherData?.test123.applications;
    if (apps) {
      state.juju.selectedApplications = Object.values(apps);
    }
    const { store } = renderComponent({
      applications: true,
      filterQuery: "db",
    });
    await userEvent.click(screen.getByTestId("select-all-apps"));
    expect(screen.getByTestId("select-all-apps")).toBeChecked();
    await userEvent.click(screen.getByTestId("select-all-apps"));
    const actions = store.getActions();
    expect(apps).toBeTruthy();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: Object.values(apps ?? {}),
    });
    const selectActions = actions.filter(
      (action) => action.type === expectedAction.type
    );
    expect(
      selectActions[selectActions.length - 1].payload.selectedApplications
    ).toHaveLength(0);
    expect(
      selectActions[selectActions.length - 1].payload.selectedApplications
    ).toStrictEqual([]);
  });

  it("checks the select all input when all the apps are selected", async () => {
    renderComponent({
      applications: true,
      filterQuery: "db",
    });
    expect(screen.getByTestId("select-all-apps")).not.toBeChecked();
    await userEvent.click(screen.getByTestId("select-all-apps"));
    const apps = state.juju.modelWatcherData?.test123.applications;
    expect(apps).toBeTruthy();
    if (apps) {
      Object.keys(apps).forEach(async (app) => {
        await userEvent.click(screen.getByTestId(`select-app-${app}`));
      });
    }
    expect(screen.getByTestId("select-all-apps")).toBeChecked();
  });

  it("unchecks the select all input when one of the apps is deselected", async () => {
    const apps = state.juju.modelWatcherData?.test123.applications;
    if (apps) {
      state.juju.selectedApplications = Object.values(apps);
    }
    renderComponent({ applications: true, filterQuery: "db" });
    await userEvent.click(screen.getByTestId("select-all-apps"));
    expect(screen.getByTestId("select-all-apps")).toBeChecked();
    await userEvent.click(screen.getByTestId("select-app-db1"));
    expect(screen.getByTestId("select-all-apps")).not.toBeChecked();
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

  it("opens the choose-charm panel when clicking the run action button", async () => {
    renderComponent({
      applications: true,
      filterQuery: "db",
      selectedApps: true,
    });
    expect(window.location.search).toEqual("");
    await userEvent.click(screen.getByRole("button", { name: /run action/i }));
    expect(window.location.search).toEqual("?panel=choose-charm");
    expect(getCharmsFromApplications).toHaveBeenCalled();
  });

  it("can show the offers table", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        offers: {
          db: applicationOfferStatusFactory.build(),
        },
      }),
    };
    renderComponent({ applications: true });
    expect(
      document.querySelector(".entity-details__offers")
    ).toBeInTheDocument();
  });

  it("can show the remote apps table", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        "remote-applications": {
          mysql: remoteApplicationStatusFactory.build(),
        },
      }),
    };
    renderComponent({ applications: true });
    expect(
      document.querySelector(".entity-details__remote-apps")
    ).toBeInTheDocument();
  });
});
