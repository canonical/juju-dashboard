import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import TestRoute from "components/Routes/TestRoute";

import Topology from "./Topology";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Topology", () => {
  it("renders as expected", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <Topology />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Topology").length).toBe(1);
  });

  it("renders the expanded topology on click", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/activedev@external/group-test"]}
        >
          <TestRoute path="/models/*">
            <Topology
              modelData={
                dataDump.juju.modelData["e1e81a64-3385-4779-8643-05e3d5ed4523"]
              }
              data-test="topology"
            />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".topology[data-fullscreen='true']").length).toBe(0);
    wrapper.find("[data-test='icon--fullscreen']").simulate("click");
    expect(wrapper.find(".topology[data-fullscreen='true']").length).toBe(1);
  });
});
