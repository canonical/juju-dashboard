import React from "react";
import { shallow } from "enzyme";

import Button from "./Button";

describe("Button", () => {
  it("should display button text", () => {
    const wrapper = shallow(<Button>Button text</Button>);
    expect(wrapper.find("button").text()).toStrictEqual("Button text");
  });
});
