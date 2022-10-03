import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter5Adapter } from "use-query-params/adapters/react-router-5";

import CloudGroup from "./CloudGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("CloudGroup", () => {
  it("by default, renders no tables with no data", () => {
    const store = mockStore({
      root: {
        config: {
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        },
      },
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
          <QueryParamProvider adapter={ReactRouter5Adapter}>
            <CloudGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(0);
  });

  it("displays model data grouped by cloud from the redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter5Adapter}>
            <CloudGroup />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(2);
    expect(tables.get(0).props.rows.length).toEqual(13);
    expect(tables.get(1).props.rows.length).toEqual(3);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(dataDump);
    const filters = {
      cloud: ["aws"],
    };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter5Adapter}>
            <CloudGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(1);
    expect(tables.get(0).props.rows.length).toBe(3);
  });

  it("model access buttons are present in cloud group", () => {
    const store = mockStore(dataDump);
    const filters = {
      cloud: ["aws"],
    };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter5Adapter}>
            <CloudGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const firstContentRow = wrapper.find(".cloud-group tr").at(1);
    const modelAccessButton = firstContentRow.find(".model-access");
    expect(modelAccessButton.length).toBe(2);
    expect(firstContentRow.find(".sm-screen-access-cell").exists()).toBe(true);
    expect(firstContentRow.find(".lrg-screen-access-cell").exists()).toBe(true);
  });
});
