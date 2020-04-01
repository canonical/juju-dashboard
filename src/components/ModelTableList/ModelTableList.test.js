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

  it("displays all data from redux store when grouping by...", () => {
    const store = mockStore(dataDump);
    const user = "user-activedev@external";
    const tables = [
      ["status", "StatusGroup"],
      ["owner", "OwnerGroup"],
      ["cloud", "CloudGroup"],
    ];
    tables.forEach((table) => {
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <ModelTableList groupedBy={table[0]} />
          </Provider>
        </MemoryRouter>
      );
      const Group = wrapper.find(table[1]);
      expect(Group.length).toBe(1);
      expect(Group.prop("activeUser")).toBe(user);
      tables.forEach((otherTable) => {
        if (otherTable[0] !== table[0]) {
          expect(wrapper.find(otherTable[1]).length).toBe(0);
        }
      });
    });
  });

  it("passes the filters to the group components", () => {
    const store = mockStore(dataDump);
    const tables = [
      { groupedBy: "status", component: "StatusGroup" },
      { groupedBy: "status", component: "StatusGroup" },
      { groupedBy: "status", component: "StatusGroup" },
    ];
    const filters = ["cloud:aws"];
    tables.forEach((table) => {
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <ModelTableList groupedBy={table.groupedBy} filters={filters} />
          </Provider>
        </MemoryRouter>
      );
      expect(wrapper.find(table.component).prop("filters")).toBe(filters);
    });
  });
});
