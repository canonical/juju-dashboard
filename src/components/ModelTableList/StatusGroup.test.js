import { MemoryRouter, Route } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";

import StatusGroup from "./StatusGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("StatusGroup", () => {
  it("by default, renders no tables when there is no data", () => {
    const store = mockStore({
      root: {},
      juju: {
        models: {},
        modelData: {},
        modelInfo: {},
        modelStatuses: {},
      },
    });
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <StatusGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(0);
  });

  it("displays model data grouped by status from the redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <StatusGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(3);
    expect(tables.get(0).props.rows.length).toEqual(4);
    expect(tables.get(1).props.rows.length).toEqual(7);
    expect(tables.get(2).props.rows.length).toEqual(5);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(dataDump);
    const filters = {
      cloud: ["aws"],
    };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <StatusGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody TableRow").length).toBe(3);
  });

  it("displays the provider type icon", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <StatusGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const logo = wrapper
      .find("MainTable")
      .find('[data-test="provider-logo"]')
      .first();
    expect(logo.prop("src")).toContain("gce");
  });
});
