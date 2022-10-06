import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";

import Breadcrumb from "./Breadcrumb";

const mockStore = configureStore([]);

describe("Breadcrumb", () => {
  it("displays correctly on model details", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/group-test"]}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<Breadcrumb />}
            />
          </Routes>
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
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName"
              element={<Breadcrumb />}
            />
          </Routes>
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
            "/models/eggman@external/group-test/app/logstash/unit/logstash-0",
          ]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName/unit/:unitId"
              element={<Breadcrumb />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='breadcrumb-items']").text()).toStrictEqual(
      "group-testApplicationslogstashlogstash-0"
    );
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
    expect(
      wrapper.find("[data-test='breadcrumb-section']").text()
    ).toStrictEqual("Applications");
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
          <Routes>
            <Route
              path="/models/:userName/:modelName/machine/:machineId"
              element={<Breadcrumb />}
            />
          </Routes>
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
