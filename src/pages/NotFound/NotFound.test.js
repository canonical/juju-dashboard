import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import { Routes } from "components/Routes/Routes";

const mockStore = configureStore([]);

describe("NotFound page", () => {
  it("should display when unknown route is accessed", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/foobar11"]}>
          <Routes />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NotFound").length).toBe(1);
    // Ensure only one route is rendered
    expect(wrapper.find("main").length).toBe(1);
  });
});
