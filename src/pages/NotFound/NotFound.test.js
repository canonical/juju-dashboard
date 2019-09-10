import React from "react";
import { shallow } from "enzyme";
import NotFound from "./NotFound";

describe("NotFound page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<NotFound />);
    expect(wrapper).toMatchSnapshot();
  });
});
