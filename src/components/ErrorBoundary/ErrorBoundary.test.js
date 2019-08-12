import React from "react";
import { shallow } from "enzyme";

import ErrorBoundary from "./ErrorBoundary";

describe("Error Boundary", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<ErrorBoundary />);
    wrapper.setState({
      hasError: true
    });
    expect(wrapper).toMatchSnapshot();
  });
});
