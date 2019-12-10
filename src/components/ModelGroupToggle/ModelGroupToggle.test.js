import React from "react";
import { shallow } from "enzyme";

import ModelGroupToggle from "./ModelGroupToggle";

describe("Model group toggle", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<ModelGroupToggle />);
    expect(wrapper.find(".p-model-group-toggle")).toMatchSnapshot();
  });
});
