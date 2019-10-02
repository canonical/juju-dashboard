import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";

import IsLoggedIn from "./IsLoggedIn";

const mockStore = configureStore([]);

describe("IsLoggedIn", () => {
  it("renders a login UI if the user is not logged in", () => {
    const store = mockStore({
      root: {}
    });
    const wrapper = mount(
      <Provider store={store}>
        <IsLoggedIn>I should not be rendered</IsLoggedIn>
      </Provider>
    );
    expect(wrapper.find("IsLoggedIn").text()).toBe("Please log in");
    expect(wrapper).toMatchSnapshot();
  });

  it("renders it's children if the user is logged in", () => {
    const store = mockStore({
      root: {
        controllerConnection: {},
        bakery: {}
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <IsLoggedIn>Hello world!</IsLoggedIn>
      </Provider>
    );
    expect(wrapper.find("IsLoggedIn").text()).toBe("Hello world!");
    expect(wrapper).toMatchSnapshot();
  });
});
