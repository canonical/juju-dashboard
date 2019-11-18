import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import dataDump from "testing/complete-redux-store-dump";

import LogIn from "./LogIn";

const mockStore = configureStore([]);

describe("LogIn", () => {
  it("renders a login UI if the user is not logged in", () => {
    const store = mockStore({
      root: {}
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>I should not be rendered</LogIn>
      </Provider>
    );
    expect(wrapper.find(".p-button--positive").text()).toBe(
      "Log in to view your models"
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders it's children if the user is logged in", () => {
    const store = mockStore({
      root: dataDump.root
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>Hello world!</LogIn>
      </Provider>
    );
    expect(wrapper.find("LogIn").text()).toBe("Hello world!");
    expect(wrapper).toMatchSnapshot();
  });
});
