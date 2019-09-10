import React from "react";
import { shallow } from "enzyme";
import Controllers from "./Controllers";

describe("Controllers page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Controllers />);
    expect(wrapper).toMatchSnapshot();
  });
});
