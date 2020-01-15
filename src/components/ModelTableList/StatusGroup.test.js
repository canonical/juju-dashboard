import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import StatusGroup from "./StatusGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("StatusGroup", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(".status-group")).toMatchSnapshot();
  });
  it("by default, renders with all table headers and no data", () => {
    const store = mockStore({
      root: {},
      juju: {
        models: {},
        modelData: {},
        modelInfo: {},
        modelStatuses: {}
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <StatusGroup />
      </Provider>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(3);
    expect(tables.get(0).props.rows).toEqual([]);
    expect(tables.get(1).props.rows).toEqual([]);
    expect(tables.get(2).props.rows).toEqual([]);
  });

  it("displays model data grouped by status from the redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup />
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(3);
    expect(tables.get(0).props.rows.length).toEqual(2);
    expect(tables.get(1).props.rows.length).toEqual(4);
    expect(tables.get(2).props.rows.length).toEqual(11);
  });
});
