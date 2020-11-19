import React from "react";
import cloneDeep from "clone-deep";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Controllers from "./Controllers";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  it("renders a blank page if no data", () => {
    const store = mockStore({
      juju: {},
      root: {
        config: {},
      },
    });
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(0);
  });

  it("renders the correct number of rows", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(2);
  });

  it("counts models, machines, apps, and units", () => {
    const clonedData = cloneDeep(dataDump);
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").get(0)).toMatchSnapshot();
  });
});
