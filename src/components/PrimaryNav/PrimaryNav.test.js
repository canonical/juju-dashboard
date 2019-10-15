import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import PrimaryNav from "./PrimaryNav";

describe("Primary Nav", () => {
  let windowLocation = {};
  beforeEach(() => {
    windowLocation = global.window.location;
  });

  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <Router>
        <PrimaryNav />
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("toggles external nav menu", () => {
    const wrapper = mount(
      <Router>
        <PrimaryNav />
      </Router>
    );
    wrapper.find(".p-primary-nav__toggle").simulate("click");
    expect(wrapper.find(".p-primary-nav").hasClass("ext-nav-open")).toEqual(
      true
    );
    wrapper.find(".p-primary-nav__toggle").simulate("click");
    expect(wrapper.find(".p-primary-nav").hasClass("ext-nav-open")).toEqual(
      false
    );
  });

  it("applies is-selected state correctly", () => {
    delete global.window.location;
    global.window = Object.create(window);
    global.window.location = {
      pathname: "/logs"
    };
    const wrapper = mount(
      <Router>
        <PrimaryNav />
      </Router>
    );
    expect(
      wrapper
        .find(".is-internal .p-list__item:last-child")
        .hasClass("is-selected")
    ).toStrictEqual(true);
  });

  afterEach(() => {
    global.window.location = windowLocation;
  });
});
