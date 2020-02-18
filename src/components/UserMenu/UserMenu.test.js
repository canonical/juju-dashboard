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

    const user = ".user-menu";
    const userOptionsToggle = ".user-menu__header";

    expect(wrapper.find(user).hasClass("is-expanded")).toEqual(false);
    wrapper.find(userOptionsToggle).simulate("click");
    expect(wrapper.find(user).hasClass("is-expanded")).toEqual(true);
    wrapper.find(userOptionsToggle).simulate("click");
    expect(wrapper.find(user).hasClass("is-expanded")).toEqual(false);
  });
});
