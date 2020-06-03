import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
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
      wrapper.find("MainTable").at(2).hasClass("model-details__machines")
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

  it("clicking an application row filters the results", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/activedev@external/sub-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__units tbody tr").length).toBe(4);
    wrapper
      .find('.model-details__apps tr[data-app="easyrsa"]')
      .simulate("click");
    const units = wrapper.find(".model-details__units tbody tr");
    expect(units.length).toBe(1);
    expect(units.hasClass("is-selected"));
    expect(units.find("td").first().text()).toBe("easyrsa/0");
    const machines = wrapper.find(".model-details__machines tbody tr");
    expect(machines.length).toBe(1);
    expect(machines.find("td").first().text()).toBe("1. bionic35.229.83.62");
    expect(wrapper.find(".model-details__relations tbody tr").length).toBe(0);
  });

  it("clicking an application row filters the results (subordinates)", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/activedev@external/sub-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__units tbody tr").length).toBe(4);
    wrapper
      .find('.model-details__apps tr[data-app="telegraf"]')
      .simulate("click");
    const units = wrapper.find(".model-details__units tbody tr");
    expect(units.length).toBe(3);
    expect(units.first().find("td").at(0).text()).toBe("ubuntu/0");
    expect(units.at(1).find("td").first().text()).toBe("nrpe/0");
    expect(units.at(2).find("td").first().text()).toBe("telegraf/0");
    const machines = wrapper.find(".model-details__machines tbody tr");
    expect(machines.length).toBe(1);
    expect(machines.find("td").first().text()).toBe("0. bionic35.243.128.238");
    const relations = wrapper.find(".model-details__relations tbody tr");
    expect(relations.length).toBe(1);
    expect(relations.find("td").first().text()).toBe("ubuntu:juju-info");
  });

  it("clicking an application row filters the results (missing subordinates)", () => {
    // This is for when an application has subordinates related to it but not
    // all units have those subordinates for whatever reason.
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/spaceman@external/hadoopspark"]}
        >
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details__units tbody tr").length).toBe(12);
    wrapper
      .find('.model-details__apps tr[data-app="rsyslog-forwarder-ha"]')
      .simulate("click");
    const units = wrapper.find(".model-details__units tbody tr");
    expect(units.length).toBe(3);
    expect(units.first().find("td").at(0).text()).toBe("slave/1");
    expect(units.at(1).find("td").first().text()).toBe("ganglia-node/0");
    expect(units.at(2).find("td").first().text()).toBe(
      "rsyslog-forwarder-ha/0"
    );
    const machines = wrapper.find(".model-details__machines tbody tr");
    expect(machines.length).toBe(1);
    expect(machines.find("td").first().text()).toBe("0. xenial35.227.34.90");
    const relations = wrapper.find(".model-details__relations tbody tr");
    expect(relations.length).toBe(4);
    expect(relations.first().find("td").first().text()).toBe(
      "rsyslog:aggregator"
    );
    expect(relations.at(1).find("td").first().text()).toBe(
      "namenode:juju-info"
    );
    expect(relations.at(2).find("td").first().text()).toBe("slave:juju-info");
    expect(relations.at(3).find("td").first().text()).toBe(
      "resourcemanager:juju-info"
    );
  });

  it("view filters hide and show tables", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/spaceman@external/hadoopspark"]}
        >
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MainTable").length).toBe(4);
    wrapper.find("[data-test='apps'] button").simulate("click");
    expect(wrapper.find("MainTable").length).toBe(1);
    expect(wrapper.find("table.model-details__apps").length).toBe(1);
    wrapper.find("[data-test='apps'] button").simulate("click");
    expect(wrapper.find("MainTable").length).toBe(4);
    wrapper.find("[data-test='machines'] button").simulate("click");
    expect(wrapper.find("table.model-details__machines").length).toBe(1);
    wrapper.find("[data-test='relations'] button").simulate("click");
    expect(wrapper.find("table.model-details__relations").length).toBe(1);
    expect(wrapper.find("MainTable").length).toBe(2);
  });

  it("app names link to charm store pages", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/spaceman@external/hadoopspark"]}
        >
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    const appsFirstRowLink = wrapper
      .find(".model-details__apps tr [data-test='app-link']")
      .at(1);
    expect(appsFirstRowLink.prop("href")).toEqual(
      "https://www.jaas.ai/u/activedev/failtester/precise/7"
    );
  });

  it("supports local charms", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/admin/local-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find(".model-details__apps tr[data-app='cockroachdb']").length
    ).toBe(1);
  });

  it("displays the correct scale value", () => {
    const store = mockStore(dataDump);
    const testApp = "kibana";
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/new-search-aggregate"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    const applicationRow = wrapper.find(`tr[data-app="${testApp}"]`);
    expect(applicationRow.find("td[data-test-column='scale']").text()).toBe(
      "1"
    );
    // Filtering the tables shouldn't effect the scale count
    applicationRow.simulate("click");
    expect(applicationRow.find("td[data-test-column='scale']").text()).toBe(
      "1"
    );
  });
});
