import React from "react";
import { mount } from "enzyme";

import TableSet from "./TableSet";

describe("TableSet", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(<TableSet />);
    expect(wrapper).toMatchSnapshot();
  });
});
