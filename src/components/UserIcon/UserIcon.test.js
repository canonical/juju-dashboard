import React from "react";
import { shallow } from "enzyme";

import UserIcon from "./UserIcon";

describe("User Icon", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<UserIcon />);
    expect(wrapper).toMatchSnapshot();
  });
});
