import React from "react";
import { BrowserRouter as Router, MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";

import PrimaryNav from "./PrimaryNav";

const mockStore = configureStore([]);
describe("Primary Nav", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <PrimaryNav />
        </Router>
      </Provider>
    );
    expect(wrapper.find(".p-primary-nav")).toMatchSnapshot();
  });

  it("toggles external nav menu", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <PrimaryNav />
        </Router>
      </Provider>
    );

    const primaryNav = ".p-primary-nav";
    const primaryNavToggle = ".p-primary-nav__toggle";

    expect(wrapper.find(primaryNav).hasClass("ext-nav-open")).toEqual(false);
    wrapper.find(primaryNavToggle).simulate("click");
    expect(wrapper.find(primaryNav).hasClass("ext-nav-open")).toEqual(true);
    wrapper.find(primaryNavToggle).simulate("click");
    expect(wrapper.find(primaryNav).hasClass("ext-nav-open")).toEqual(false);
  });

  it("applies is-selected state correctly", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/controllers"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("a.is-selected").text()).toStrictEqual("Controllers");
  });

  it("displays correct number of blocked models", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".entity-count").text()).toStrictEqual("6");
  });
});
