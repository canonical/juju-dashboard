import cloneDeep from "clone-deep";
import { mount } from "enzyme";
import { MemoryRouter, Route } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";

import ControllersIndex from "./ControllersIndex";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  it("renders a blank page if no data", () => {
    const store = mockStore({
      juju: {},
      root: {
        config: {},
      },
      ui: {
        userMenuActive: false,
      },
    });
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(0);
  });
  it("renders the correct number of rows", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(2);
  });
  it("counts models, machines, apps, and units", () => {
    const clonedData = cloneDeep(dataDump);
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ControllersIndex />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").get(0)).toMatchSnapshot();
  });
  it("shows 'Register new controller' panel", () => {
    const clonedData = cloneDeep(dataDump);
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <MemoryRouter
            initialEntries={["/controllers?panel=register-controller"]}
          >
            <QueryParamProvider ReactRouterRoute={Route}>
              <ControllersIndex />
            </QueryParamProvider>
          </MemoryRouter>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(".p-panel.register-controller").length).toBe(1);
  });
});
