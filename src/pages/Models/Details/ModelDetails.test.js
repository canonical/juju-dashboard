import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { QueryParamProvider } from "use-query-params";
import { MemoryRouter, Route } from "react-router";
import TestRoute from "components/Routes/TestRoute";
import dataDump from "testing/complete-redux-store-dump";

import ModelDetails from "./ModelDetails";

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
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Topology").length).toBe(1);
    expect(wrapper.find(".model-details__main table").length).toBe(2);
  });

  it("renders the details pane for models shared-with-me", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__main table").length).toBe(4);
  });

  it("renders the machine details section", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/mymodel"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find(".model-details__main table")
        .at(2)
        .hasClass("model-details__machines")
    ).toBe(true);
  });

  it("subordinate rows render correct amount", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/sub-test"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__main .subordinate").length).toEqual(2);
  });

  it("view toggles hide and show tables", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__main table").length).toBe(4);
    wrapper.find("ButtonGroup button[value='units']").simulate("click");
    expect(wrapper.find(".model-details__main table").length).toBe(1);
    expect(
      wrapper.find(".model-details__main table.model-details__units").length
    ).toBe(1);

    wrapper.find("ButtonGroup button[value='machines']").simulate("click");
    expect(wrapper.find(".model-details__main table").length).toBe(1);
    expect(
      wrapper.find(".model-details__main table.model-details__machines").length
    ).toBe(1);

    wrapper.find("ButtonGroup button[value='relations']").simulate("click");
    expect(wrapper.find(".model-details__main table").length).toBe(1);
    expect(
      wrapper.find(".model-details__main table.model-details__relations").length
    ).toBe(1);

    wrapper.find("ButtonGroup button[value='status']").simulate("click");
    expect(wrapper.find(".model-details__main table").length).toBe(4);
  });

  it("supports local charms", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/local-test"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find(".model-details__apps tr[data-app='cockroachdb']").length
    ).toBe(1);
    expect(
      wrapper
        .find(
          ".model-details__apps tr[data-app='cockroachdb'] td[data-test-column='store']"
        )
        .text()
    ).toBe("Local");
  });

  it("displays the correct scale value", () => {
    const store = mockStore(dataDump);
    const testApp = "client";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const applicationRow = wrapper.find(`tr[data-app="${testApp}"]`);
    expect(applicationRow.find("td[data-test-column='scale']").text()).toBe(
      "1"
    );
  });

  it("displays correct side panel when app row is clicked", () => {
    const store = mockStore(dataDump);
    const testApp = "kibana";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/new-search-aggregate"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".slide-panel.apps-panel").length).toBe(0);
    const applicationRow = wrapper.find(`tr[data-app="${testApp}"]`);
    applicationRow.simulate("click");
    expect(wrapper.find(".slide-panel.apps-panel").length).toBe(1);
    expect(
      wrapper.find(".slide-panel.apps-panel .panel-header .entity-name").text()
    ).toBe("kibana");
  });

  it("displays correct side panel when machine row is clicked", () => {
    const store = mockStore(dataDump);
    const testMachine = "1";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".slide-panel.machines-panel").length).toBe(0);
    const machineRow = wrapper.find(
      `.model-details__main tr[data-machine="${testMachine}"]`
    );
    machineRow.simulate("click");
    expect(wrapper.find(".slide-panel.machines-panel").length).toBe(1);
    expect(
      wrapper
        .find(".slide-panel.machines-panel .panel-header .entity-name")
        .text()
    ).toBe("Machine '1' - xenial");
  });

  it("displays correct side panel when unit row is clicked", () => {
    const store = mockStore(dataDump);
    const testUnit = "client/0";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".slide-panel.units-panel").length).toBe(0);
    const unitRow = wrapper.find(`tr[data-unit="${testUnit}"]`);
    unitRow.simulate("click");
    expect(wrapper.find(".slide-panel.units-panel").length).toBe(1);
    expect(
      wrapper.find(".slide-panel.units-panel .panel-header .entity-name").text()
    ).toBe("client/0");
  });

  it("should display the correct window title", () => {
    const store = mockStore(dataDump);
    mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/new-search-aggregate"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Model: new-search-aggregate | Juju Dashboard");
  });

  it("should a message if a model has no relations", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/canonical-kubernetes?activeView=relations"]}
        >
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <ModelDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const noRelationsMsg = wrapper.find("[data-testid='no-relations-msg']");
    expect(noRelationsMsg.length).toBe(1);
  });
});
