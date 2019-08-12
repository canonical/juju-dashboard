import React from "react";
import { shallow } from "enzyme";

import ErrorBoundary from "./ErrorBoundary";

describe("Error Boundary", () => {
  const wrapper = shallow(<ErrorBoundary />);
  wrapper.setState({
    hasError: true
  });
  it("renders without crashing and matches snapshot", () => {
    expect(wrapper).toMatchSnapshot();
  });
});
