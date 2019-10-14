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
      wrapper.find(".p-list__item:last-child").hasClass("is-selected")
    ).toStrictEqual(true);
  });

  afterEach(() => {
    global.window.location = windowLocation;
  });
});
