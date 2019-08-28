import React from "react";
import { shallow, mount } from "enzyme";

import Filter from "./Filter";

describe("Filter", () => {
  const filters = ["foo", "bar", "baz", "foobar"];
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Filter label="Filter:" filters={filters} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("displays correct number of filters", () => {
    const wrapper = mount(<Filter label="Filter:" filters={filters} />);
    expect(wrapper.find(".p-button--filter")).toHaveLength(4);
  });
});
