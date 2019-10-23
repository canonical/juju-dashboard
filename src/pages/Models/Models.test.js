import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import Models from "./Models";

const mockStore = configureStore([]);

describe("Models page", () => {
  it("renders without crashing", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Models />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Header"));
    expect(wrapper.find("TableList"));
  });

  it("has a header which shows the model counts", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Models />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".models__count").text()).toBe(
      "8 models: 0 blocked, 2 alerts, 6 running"
    );
  });
});
