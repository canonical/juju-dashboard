import React from "react";
import { shallow } from "enzyme";

import Layout from "./Layout";

describe("Layout", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders without a sidebar", () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper.find(".l-side")).toHaveLength(0);
  });

  it("renders with a sidebar if sidebar prop is passed", () => {
    const wrapper = shallow(<Layout sidebar />);
    expect(wrapper.find(".l-side")).toHaveLength(1);
  });
});
