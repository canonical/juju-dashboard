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
    expect(wrapper.find("[data-test='breadcrumb-model']").text()).toStrictEqual(
      "group-test"
    );
    expect(
      wrapper.find("[data-test='breadcrumb-section']").text()
    ).toStrictEqual("Applications");
    expect(
      wrapper.find("[data-test='breadcrumb-application']").text()
    ).toStrictEqual("easyrsa");
  });
});
