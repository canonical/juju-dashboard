import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import TableList from "./TableList";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("TableList", () => {
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
        <TableList />
      </Provider>
    );
    expect(wrapper.find("th")).toMatchSnapshot();
    // Should be empty
    expect(wrapper.find("tbody")).toMatchSnapshot();
  });

  it("displays all data from redux store", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <TableList />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(TableList)).toMatchSnapshot();
  });
});
