import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import dataDump from "testing/complete-redux-store-dump";

import LogIn from "./LogIn";

const mockStore = configureStore([]);

describe("LogIn", () => {
  it("renders a 'connecting' message while connecting", () => {
    const store = mockStore({
      root: {}
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(wrapper.find(".p-button--neutral").text()).toBe("Connecting...");
    expect(wrapper.find("LogIn main").text()).toBe("App content");
    expect(wrapper).toMatchSnapshot();
  });

  it("renders a login UI if the user is not logged in", () => {
    const store = mockStore({
      root: {
        visitURL: "I am a url"
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(wrapper.find(".p-button--positive").text()).toBe(
      "Log in to the dashboard"
    );
    expect(wrapper.find("LogIn main").text()).toBe("App content");
    expect(wrapper).toMatchSnapshot();
  });
});
