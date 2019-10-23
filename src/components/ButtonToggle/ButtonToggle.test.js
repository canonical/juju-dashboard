import React from "react";
import { shallow } from "enzyme";

import ButtonToggle from "./ButtonToggle";

describe("Button toggle", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<ButtonToggle />);
    expect(wrapper.find(".p-button-toggle")).toMatchSnapshot();
  });
});
