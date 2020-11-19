import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

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
      <Provider store={store}>
        <StatusGroup />
      </Provider>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(0);
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
    expect(tables.get(0).props.rows.length).toEqual(4);
    expect(tables.get(1).props.rows.length).toEqual(7);
    expect(tables.get(2).props.rows.length).toEqual(5);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={["cloud:aws"]} />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody TableRow").length).toBe(3);
  });
});
