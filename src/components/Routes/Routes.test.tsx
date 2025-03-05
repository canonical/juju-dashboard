import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { AdvancedSearchTestId } from "pages/AdvancedSearch";
import { ControllersIndexTestId } from "pages/ControllersIndex/index";
import { EntityDetailsTestId } from "pages/EntityDetails";
import { LogsTestId } from "pages/Logs/index";
import { ModelsIndexTestId } from "pages/ModelsIndex/index";
import { PermissionsTestId } from "pages/Permissions";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { changeURL } from "testing/utils";
import urls from "urls";

import Routes from "./Routes";

const mockStore = configureStore<RootState, unknown>([]);

describe("Routes", () => {
  let state: RootState;

  beforeEach(() => {
    changeURL("/");
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
    });
  });

  it("handles models", async () => {
    state.juju.modelsLoaded = true;
    const store = mockStore(state);
    changeURL(urls.models.index);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      await screen.findByTestId(ModelsIndexTestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("handles model details", async () => {
    const store = mockStore(state);
    changeURL(urls.model.index({ userName: "eggman", modelName: "model1" }));
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      await screen.findByTestId(EntityDetailsTestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("handles controllers", async () => {
    const store = mockStore(state);
    changeURL(urls.controllers);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      await screen.findByTestId(ControllersIndexTestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("displays audit logs for JAAS", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const store = mockStore(state);
    changeURL(urls.logs);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(await screen.findByTestId(LogsTestId.COMPONENT)).toBeInTheDocument();
  });

  it("does not display audit logs for local Juju controllers", async () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    const store = mockStore(state);
    changeURL(urls.logs);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(screen.queryByTestId(LogsTestId.COMPONENT)).not.toBeInTheDocument();
  });

  it("displays cross model queries for JAAS", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const store = mockStore(state);
    changeURL(urls.search);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      await screen.findByTestId(AdvancedSearchTestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("does not display cross model queries for local Juju controllers", async () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    const store = mockStore(state);
    changeURL(urls.search);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      screen.queryByTestId(AdvancedSearchTestId.COMPONENT),
    ).not.toBeInTheDocument();
  });

  it("displays permissions for JAAS", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    const store = mockStore(state);
    changeURL(urls.permissions);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      await screen.findByTestId(PermissionsTestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("does not display permissions for local Juju controllers", async () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    const store = mockStore(state);
    changeURL(urls.permissions);
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(
      screen.queryByTestId(PermissionsTestId.COMPONENT),
    ).not.toBeInTheDocument();
  });
});
