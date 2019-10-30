import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import dataDump from "testing/complete-redux-store-dump";

import UserIcon from "./UserIcon";

const mockStore = configureStore([]);
describe("User Icon", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserIcon />
        </Router>
      </Provider>
    );
    expect(wrapper.find(".user-icon")).toMatchSnapshot();
  });

  it("toggles drop-down panel", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserIcon />
        </Router>
      </Provider>
    );

    const userIconPanel = ".user-icon__panel";
    const userIconPanelToggle = ".p-icon--user";

    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(false);
    wrapper.find(userIconPanelToggle).simulate("click");
    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(true);
    wrapper.find(userIconPanelToggle).simulate("click");
    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(false);
  });
});
