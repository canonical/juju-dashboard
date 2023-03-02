import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import type { RootState } from "store/store";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import ControllersIndex from "./ControllersIndex";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders a blank page if no data", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("renders the correct number of rows", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
          controllerFactory.build({ path: "admin/jaas2", uuid: "456" }),
        ],
      },
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("counts models, machines, apps, and units", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
          controllerFactory.build({ path: "admin/jaas2", uuid: "456" }),
        ],
      },
      models: {},
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row")[1]).toMatchSnapshot();
  });

  it("shows 'Register new controller' panel", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/controllers?panel=register-controller"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ControllersIndex />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      document.querySelector(".p-panel.register-controller")
    ).toBeInTheDocument();
  });

  it("Indicates if a controller has an update available", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            path: "admin/jaas",
            uuid: "123",
            version: "2.8.0",
          }),
          controllerFactory.build({
            path: "admin/jaas2",
            uuid: "456",
            version: "9.99.0",
          }),
          controllerFactory.build({
            path: "admin/jaas3",
            uuid: "789",
            version: "9.99.0",
          }),
        ],
      },
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("update-available")).toHaveLength(1);
  });
});
