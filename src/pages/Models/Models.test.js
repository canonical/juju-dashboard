import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter, Router } from "react-router";
import dataDump from "testing/complete-redux-store-dump";
import { createMemoryHistory } from "history";

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
      "18 models: 6 blocked, 5 alerts, 7 running"
    );
  });

  it("displays correct grouping view", () => {
    const history = createMemoryHistory();
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <Models />
        </Router>
      </Provider>
    );
    expect(
      wrapper.find(".p-model-group-toggle__button.is-selected").text()
    ).toBe("status");
    wrapper.find("button[value='owner']").simulate("click", {
      target: { value: "owner" },
    });
    expect(
      wrapper.find(".p-model-group-toggle__button.is-selected").text()
    ).toBe("owner");
    const searchParams = new URLSearchParams(history.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(wrapper.find(".owners-group"));
  });
});
