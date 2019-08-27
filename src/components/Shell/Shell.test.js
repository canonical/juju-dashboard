import React from "react";
import { shallow } from "enzyme";

import Shell from "./Shell";

describe("Shell", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Shell />);
    expect(wrapper).toMatchSnapshot();
  });
});
