import React from "react";
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
      juju: {}
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
    expect(wrapper.find("tbody tr").length).toBe(6);
  });
});

describe("Controllers overview panel", () => {
  it("displays the machines count", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(".overview__machines strong").text()).toBe(
      "56 machines"
    );
  });
  it("displays the applications count", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(".overview__applications strong").text()).toBe(
      "59 applications"
    );
  });
  it("displays the units count", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(".overview__units strong").text()).toBe("58 units");
  });
});
