import React from "react";
import { shallow } from "enzyme";

import Loading from "./Loading";

describe("Loading", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Loading />);
    expect(wrapper).toMatchSnapshot();
  });
});
