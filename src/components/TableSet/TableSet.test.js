import React from "react";
import { mount } from "enzyme";

import TableSet from "./TableSet";

describe("tableSet", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(<TableSet />);
    expect(wrapper).toMatchInlineSnapshot();
  });
});
