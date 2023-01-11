import cloneDeep from "clone-deep";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { rootStateFactory } from "testing/factories/root";

import ControllersIndex from "./ControllersIndex";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  it("renders a blank page if no data", () => {
    const store = mockStore(
      rootStateFactory.build({
        juju: {},
        general: {
          config: {},
        },
        ui: {
          userMenuActive: false,
        },
      })
    );
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
    const store = mockStore(dataDump);
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
    const clonedData = cloneDeep(dataDump);
    const store = mockStore(clonedData);
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
    const clonedData = cloneDeep(dataDump);
    const store = mockStore(clonedData);
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
});
