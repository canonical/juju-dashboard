import React from "react";
import { shallow } from "enzyme";

import FilterTags from "./FilterTags";

describe("FilterTags", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<FilterTags />);
    expect(wrapper).toMatchSnapshot();
  });
});
