import React from "react";
import { shallow } from "enzyme";

import Button from "./Button";

describe("Button", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Button />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should display the children of button", () => {
    const wrapper = shallow(<Button>Button text</Button>);
    console.log(wrapper.find("button").text());
    expect(wrapper.find("button").text()).toStrictEqual("Button text");
  });
});
