import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import dataDump from "testing/complete-redux-store-dump";

import UserMenu from "./UserMenu";

const mockStore = configureStore([]);
describe("User Icon", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    expect(wrapper.find(".user-menu")).toMatchSnapshot();
  });

  it("toggles drop-down panel", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );

    const userMenu = ".user-menu";
    const userMenuToggle = ".user-menu__header";

    expect(wrapper.find(userMenu).hasClass("is-active")).toEqual(false);
    wrapper.find(userMenuToggle).simulate("click");
    expect(wrapper.find(userMenu).hasClass("is-active")).toEqual(true);
    wrapper.find(userMenuToggle).simulate("click");
    expect(wrapper.find(userMenu).hasClass("is-active")).toEqual(false);
  });

  it("displays current logged in user", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    const username = ".user-menu__name";
    expect(wrapper.find(username).text()).toEqual("activedev");
  });
});
