import configureStore from "redux-mock-store";
import TestRoute from "components/Routes/TestRoute";
import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";

import Breadcrumb from "./Breadcrumb";

const mockStore = configureStore([]);

describe("Breadcrumb", () => {
  it("displays correctly on model details", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/group-test"]}>
          <TestRoute path="/models/:userName/:modelName?">
            <Breadcrumb />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='breadcrumb-application']").length).toBe(0);
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
  });

  it("displays correctly on application details", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/eggman@external/group-test/app/easyrsa"]}
        >
          <TestRoute path="/models/:userName/:modelName?/app/:appName?">
            <Breadcrumb />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='breadcrumb-items']").text()).toStrictEqual(
      "group-testApplicationseasyrsa"
    );
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
    expect(
      wrapper.find("[data-test='breadcrumb-section']").text()
    ).toStrictEqual("Applications");
    expect(
      wrapper.find("[data-test='breadcrumb-applications']").text()
    ).toStrictEqual("easyrsa");
  });

  it("displays correctly on unit details", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/eggman@external/group-test/unit/logstash-0",
          ]}
        >
          <TestRoute path="/models/:userName/:modelName?/unit/:unitId?">
            <Breadcrumb />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='breadcrumb-items']").text()).toStrictEqual(
      "group-testUnitslogstash-0"
    );
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
    expect(
      wrapper.find("[data-test='breadcrumb-section']").text()
    ).toStrictEqual("Units");
    expect(wrapper.find("[data-test='breadcrumb-units']").text()).toStrictEqual(
      "logstash-0"
    );
  });

  it("displays correctly on machine details", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/eggman@external/group-test/machine/0"]}
        >
          <TestRoute path="/models/:userName/:modelName?/machine/:machineId?">
            <Breadcrumb />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='breadcrumb-items']").text()).toStrictEqual(
      "group-testMachines0"
    );
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
    expect(
      wrapper.find("[data-test='breadcrumb-section']").text()
    ).toStrictEqual("Machines");
    expect(
      wrapper.find("[data-test='breadcrumb-machines']").text()
    ).toStrictEqual("0");
  });
});
