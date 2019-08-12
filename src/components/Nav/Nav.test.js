import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import Nav from "./Nav";

describe("Nav", () => {
  const wrapper = mount(
    <Router>
      <Nav />
    </Router>
  );
  it("renders without crashing and matches snapshot", () => {
    expect(wrapper).toMatchSnapshot();
  });
});
