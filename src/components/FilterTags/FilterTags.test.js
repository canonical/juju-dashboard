import React from "react";
import { shallow } from "enzyme";

import FilterTags from "./FilterTags";

describe("FilterTags", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<FilterTags />);
    expect(wrapper.find(".p-filter-tags")).toMatchSnapshot();
  });

  it("displays the filter panel when input focused", () => {
    const wrapper = shallow(<FilterTags />);
    const input = ".p-filter-tags__input";
    const panel = ".p-filter-panel";
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(false);
    wrapper.find(input).simulate("focus");
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(true);
  });
});
