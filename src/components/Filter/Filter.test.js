import React from "react";
import { shallow } from "enzyme";

import Filter from "./Filter";

describe("Filter", () => {
  it("renders without crashing and matches snapshot", () => {
    const filters = ["foo", "bar", "baz", "foobar"];
    const wrapper = shallow(<Filter label="Filter:" filters={filters} />);
    expect(wrapper).toMatchSnapshot();
  });
});
