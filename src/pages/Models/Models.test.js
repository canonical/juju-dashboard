import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
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
      "17 models: 2 blocked, 4 alerts, 11 running"
    );
  });

  it("displays correct grouping view", () => {
    global.window = { location: { pathname: "/models?groupedby=owner" } };
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Models />
        </Router>
      </Provider>
    );
    expect(
      wrapper.find(".p-model-group-toggle__button.is-selected").text()
    ).toBe("status");
    wrapper.find("button[value='owner']").simulate("click", {
      target: { value: "owner" }
    });
    wrapper.update();
    expect(
      wrapper.find(".p-model-group-toggle__button.is-selected").text()
    ).toBe("owner");
    expect(global.window.location.search).toEqual("?groupedby=owner");
    expect(wrapper.find(".owners-group"));
  });
});
