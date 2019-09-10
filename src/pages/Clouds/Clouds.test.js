import React from "react";
import { shallow } from "enzyme";
import Clouds from "./Clouds";

describe("Clouds page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Clouds />);
    expect(wrapper).toMatchSnapshot();
  });
});
