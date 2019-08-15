import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import PrimaryNav from "./PrimaryNav";

describe("Primary Nav", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <Router>
        <PrimaryNav />
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
