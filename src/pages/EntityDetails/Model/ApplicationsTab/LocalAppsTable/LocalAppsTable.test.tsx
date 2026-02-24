import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { applicationStatusFactory } from "testing/factories/juju/ClientV8";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import { modelDataFactory } from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";

import LocalAppsTable from "./LocalAppsTable";
import { Label, TestId } from "./types";

describe("LocalAppsTable", () => {
  let state: RootState;
  const path = "/models/:qualifier/:modelName";
  const url = "/models/test@external/test-model";
  const searchURL = `${url}?filterQuery=db`;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          test123: {
            name: "test-model",
            uuid: "test123",
            qualifier: "test@external",
            type: "iaas",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          },
        },
        modelData: {
          test123: modelDataFactory.build({
            applications: {
              mysql1: applicationStatusFactory.build(),
              mysql2: applicationStatusFactory.build(),
              db2: applicationStatusFactory.build(),
              db1: applicationStatusFactory.build(),
              "jupyter-controller": applicationStatusFactory.build(),
              "jupyter-ui": applicationStatusFactory.build(),
              redis1: applicationStatusFactory.build(),
            },
            info: modelInfoFactory.build({
              uuid: "test123",
              name: "test-model",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
          }),
        },
      }),
    });
  });

  it("displays a message when there are no applications", () => {
    renderComponent(<LocalAppsTable applications={{}} />, { path, url, state });
    expect(screen.queryByText(Label.NONE)).toBeInTheDocument();
  });

  it("displays a message when there are no search results", () => {
    renderComponent(<LocalAppsTable applications={{}} />, {
      path,
      url: `${url}?filterQuery=nothing-matches-this`,
      state,
    });
    expect(screen.queryByText(Label.NONE_SEARCH)).toBeInTheDocument();
  });

  it("shows all the application by default", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      { path, url, state },
    );
    expect(screen.queryAllByRole("row")).toHaveLength(8);
  });

  it("doesn't show the select column when there is no search", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      { path, url, state },
    );
    // first column not to be a checkbox
    expect(
      screen.queryAllByRole("columnheader")[0].querySelector("input"),
    ).not.toBeInTheDocument();
  });

  it("shows the select column when there is a search", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    // first column to be a checkbox
    expect(
      screen.queryAllByRole("columnheader")[0].querySelector("input"),
    ).toBeInTheDocument();
  });

  it("does not show the select column when the user only has read permissions", () => {
    state.juju.modelData.test123.info = modelInfoFactory.build({
      uuid: "test123",
      name: "test-model",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    // The first column should not have a checkbox.
    expect(
      screen.queryAllByRole("columnheader")[0].querySelector("input"),
    ).not.toBeInTheDocument();
  });

  it("can select individual apps", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        store,
      },
    );
    await userEvent.click(screen.getByTestId("select-app-db1"));
    const db1 = state.juju.modelData?.test123.applications.db1;
    expect(db1).toBeTruthy();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: db1 ? { db1 } : {},
    });
    expect(
      actions.find((action) => action.type === expectedAction.type),
    ).toMatchObject(expectedAction);
  });

  it("checks selected apps", async () => {
    if (state.juju.modelData?.test123.applications.db1) {
      state.juju.selectedApplications = {
        db1: state.juju.modelData?.test123.applications.db1,
      };
    }
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(screen.getByTestId("select-app-db1")).toBeChecked();
  });

  it("can select all apps", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        store,
      },
    );
    await userEvent.click(screen.getByTestId(TestId.SELECT_ALL));
    const apps = state.juju.modelData?.test123.applications;
    expect(apps).toBeTruthy();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: apps,
    });
    const action = actions.find(
      (dispatchedAction) => dispatchedAction.type === expectedAction.type,
    ) as typeof expectedAction;
    expect(Object.keys(action.payload.selectedApplications)).toHaveLength(
      Object.keys(expectedAction.payload.selectedApplications).length,
    );
    expect(action.payload.selectedApplications).toStrictEqual(
      expectedAction.payload.selectedApplications,
    );
  });

  it("can deselect all apps", async () => {
    const apps = state.juju.modelData?.test123.applications ?? {};
    state.juju.selectedApplications = apps;
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        store,
      },
    );
    expect(screen.getByTestId(TestId.SELECT_ALL)).toBeChecked();
    await userEvent.click(screen.getByTestId(TestId.SELECT_ALL));
    expect(screen.getByTestId(TestId.SELECT_ALL)).not.toBeChecked();
    const expectedAction = jujuActions.updateSelectedApplications({
      selectedApplications: apps,
    });
    const selectActions = actions.filter(
      (action) => action.type === expectedAction.type,
    ) as (typeof expectedAction)[];
    expect(
      Object.keys(
        selectActions[selectActions.length - 1].payload.selectedApplications,
      ),
    ).toHaveLength(0);
    expect(
      selectActions[selectActions.length - 1].payload.selectedApplications,
    ).toStrictEqual({});
  });

  it("checks the select all input when all the apps are selected", async () => {
    const apps = state.juju.modelData?.test123.applications;
    if (apps) {
      state.juju.selectedApplications = apps;
    }
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(screen.getByTestId(TestId.SELECT_ALL)).toBeChecked();
  });

  it("unchecks the select all input when one of the apps is deselected", async () => {
    const apps = state.juju.modelData?.test123.applications;
    if (apps) {
      state.juju.selectedApplications = { ...apps };
    }
    delete state.juju.selectedApplications[
      Object.keys(state.juju.selectedApplications)[0]
    ];
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(screen.getByTestId(TestId.SELECT_ALL)).not.toBeChecked();
  });

  it("doesn't show the run action button when there is no search", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      { path, url, state },
    );
    expect(
      screen.queryByRole("button", { name: /run action/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the run action button when there is a search", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(
      screen.queryByRole("button", { name: /run action/i }),
    ).toBeInTheDocument();
  });

  it("does not show the run action button when the user only has read permissions", () => {
    state.juju.modelData.test123.info = modelInfoFactory.build({
      uuid: "test123",
      name: "test-model",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(
      screen.queryByRole("button", { name: /run action/i }),
    ).not.toBeInTheDocument();
  });

  it("disables the run action button when there are no applications selected", () => {
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(
      screen.queryByRole("button", { name: /run action/i }),
    ).toHaveAttribute("aria-disabled");
  });

  it("enables the run action button when there is at least one application selected", () => {
    state.juju.selectedApplications = {
      app1: applicationStatusFactory.build(),
    };
    renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(
      screen.queryByRole("button", { name: /run action/i }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("opens the choose-charm panel when clicking the run action button", async () => {
    state.juju.selectedApplications = {
      app1: applicationStatusFactory.build(),
    };
    const { router } = renderComponent(
      <LocalAppsTable
        applications={state.juju.modelData?.test123.applications}
      />,
      {
        path,
        url: searchURL,
        state,
      },
    );
    expect(router.state.location.search).toEqual("?filterQuery=db");
    await userEvent.click(screen.getByRole("button", { name: /run action/i }));
    expect(router.state.location.search).toEqual(
      "?filterQuery=db&panel=select-charms-and-actions",
    );
  });
});
