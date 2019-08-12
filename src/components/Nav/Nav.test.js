import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import Nav from "./Nav";

describe("Nav", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <Router>
        <Nav />
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
