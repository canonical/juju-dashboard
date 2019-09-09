import React from "react";
import { shallow } from "enzyme";

import Layout from "./Layout";

describe("Layout", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders with a sidebar", () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper.find(".l-side")).toHaveLength(1);
  });

  it("renders without a sidebar if false bool is passed", () => {
    const wrapper = shallow(<Layout sidebar={false} />);
    expect(wrapper.find(".l-side")).toHaveLength(0);
  });

  it("should display the children", () => {
    const wrapper = shallow(<Layout>content</Layout>);
    expect(wrapper.find("#main-content").html()).toStrictEqual(
      `<main id="main-content">content</main>`
    );
  });
});
