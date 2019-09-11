import React from "react";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import TableList from "./TableList";

import dataDump from "../../testing/complete-redux-store-dump";

const newHistory = createBrowserHistory();

const mockStore = configureStore([]);

describe("TableList", () => {
  it("by default, renders with all table headers and no data", () => {
    const store = mockStore({
      juju: {
        models: {},
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
      <Router history={newHistory}>
        <Provider store={store}>
          <TableList />
        </Provider>
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
