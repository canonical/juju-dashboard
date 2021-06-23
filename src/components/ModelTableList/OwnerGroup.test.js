import { MemoryRouter, Route } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";

import OwnerGroup from "./OwnerGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("OwnerGroup", () => {
  it("by default, renders no tables with no data", () => {
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
            <OwnerGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(0);
  });

  it("displays model data grouped by owner from the redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <OwnerGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(4);
    expect(tables.get(0).props.rows.length).toEqual(8);
    expect(tables.get(1).props.rows.length).toEqual(2);
    expect(tables.get(2).props.rows.length).toEqual(5);
    expect(tables.get(3).props.rows.length).toEqual(1);
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
            <OwnerGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody TableRow").length).toBe(3);
  });

  it("model access buttons are present in owners group", () => {
    const store = mockStore(dataDump);
    const filters = {
      cloud: ["aws"],
    };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <OwnerGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const firstContentRow = wrapper.find(".owners-group tr").at(1);
    const modelAccessButton = firstContentRow.find(".model-access");
    expect(modelAccessButton.length).toBe(2);
    expect(firstContentRow.find(".sm-screen-access-cell").exists()).toBe(true);
    expect(firstContentRow.find(".lrg-screen-access-cell").exists()).toBe(true);
  });
});
