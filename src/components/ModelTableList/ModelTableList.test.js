import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ModelTableList from "./ModelTableList";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("ModelTableList", () => {
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
        <ModelTableList />
      </Provider>
    );
    expect(wrapper.find("th")).toMatchSnapshot();
    // Should be empty
    expect(wrapper.find("tbody")).toMatchSnapshot();
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
    expect(wrapper.find(ModelTableList)).toMatchSnapshot();
  });
});
