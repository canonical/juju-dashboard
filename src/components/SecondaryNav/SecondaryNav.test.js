import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import SecondaryNav from "./SecondaryNav";

describe("Secondary Nav", () => {
  beforeAll(() => {
    /* eslint-disable-next-line no-unused-vars */
    var windowLocation = global.window.location;
  });

  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <Router>
        <SecondaryNav />
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
        <SecondaryNav />
      </Router>
    );
    expect(
      wrapper.find(".p-list__item:last-child").hasClass("is-selected")
    ).toStrictEqual(true);
  });

  afterAll(() => {
    global.window.location = windowLocation;
  });
});
