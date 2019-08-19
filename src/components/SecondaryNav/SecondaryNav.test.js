import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";

import SecondaryNav from "./SecondaryNav";

describe("Secondary Nav", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <Router>
        <SecondaryNav />
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
