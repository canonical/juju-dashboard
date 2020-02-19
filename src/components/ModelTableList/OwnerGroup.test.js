import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

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
        modelStatuses: {}
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <OwnerGroup />
      </Provider>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(0);
  });

  it("displays model data grouped by owner from the redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <OwnerGroup />
        </Provider>
      </MemoryRouter>
    );
    const tables = wrapper.find("MainTable");
    expect(tables.length).toBe(5);
    expect(tables.get(0).props.rows.length).toEqual(5);
    expect(tables.get(1).props.rows.length).toEqual(6);
    expect(tables.get(2).props.rows.length).toEqual(1);
    expect(tables.get(3).props.rows.length).toEqual(3);
    expect(tables.get(4).props.rows.length).toEqual(2);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <OwnerGroup filters={["cloud:aws"]} />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody TableRow").length).toBe(2);
  });
});
