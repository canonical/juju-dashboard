import React from "react";
import { shallow } from "enzyme";
import Usage from "./Usage";

describe("Usage page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Usage />);
    expect(wrapper).toMatchSnapshot();
  });
});
