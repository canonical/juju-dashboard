import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import TestRoute from "components/Routes/TestRoute";
import dataDump from "testing/complete-redux-store-dump";

import ModelDetails from "./ModelDetails";

jest.mock("components/Terminal/Terminal", () => {
  const Terminal = () => <div className="terminal"></div>;
  return Terminal;
});

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

const mockStore = configureStore([]);

describe("ModelDetail Container", () => {
  it("renders the details pane", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Topology").length).toBe(1);
    expect(wrapper.find("MainTable").length).toBe(4);
  });

  it("renders the details pane for models shared-with-me", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/space-man@external/frontend-ci"]}
        >
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MainTable").length).toBe(4);
  });

  it("renders the machine details section", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/spaceman@external/mymodel"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find("MainTable")
        .at(2)
        .hasClass("model-details__machines")
    ).toBe(true);
  });

  it("subordinate rows render correct amount", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/sub-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".subordinate").length).toEqual(2);
  });

  it("renders the terminal", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/test1"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Terminal").length).toBe(1);
  });
});
