import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ModelTableList from "./ModelTableList";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("ModelTableList", () => {
  it("by default, renders the status table", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList />
        </Provider>
      </MemoryRouter>
    );
    const statusGroup = wrapper.find("StatusGroup");
    expect(statusGroup.length).toBe(1);
    expect(statusGroup.prop("activeUser")).toBe("user-activedev@external");
    expect(wrapper.find("OwnerGroup").length).toBe(0);
  });

  it("displays all data from redux store when grouping by status", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList groupedBy="status" />
        </Provider>
      </MemoryRouter>
    );
    const statusGroup = wrapper.find("StatusGroup");
    expect(statusGroup.length).toBe(1);
    expect(statusGroup.prop("activeUser")).toBe("user-activedev@external");
    expect(wrapper.find("OwnerGroup").length).toBe(0);
  });

  it("displays all data from redux store when grouping by owner", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList groupedBy="owner" />
        </Provider>
      </MemoryRouter>
    );
    const ownerGroup = wrapper.find("OwnerGroup");
    expect(ownerGroup.length).toBe(1);
    expect(ownerGroup.prop("activeUser")).toBe("user-activedev@external");
    expect(wrapper.find("StatusGroup").length).toBe(0);
  });
});
