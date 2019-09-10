import React from "react";
import { shallow } from "enzyme";
import Models from "./Models";

describe("Models page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Models />);
    expect(wrapper).toMatchSnapshot();
  });
});
