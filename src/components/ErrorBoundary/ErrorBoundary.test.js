import React from "react";
import ErrorBoundary from "./ErrorBoundary";

import { shallow } from "enzyme";

describe("Error Boundary", () => {
  it("generates a error message when an error is caught", () => {
    const wrapper = shallow(<ErrorBoundary />);
    wrapper.setState({
      hasError: true
    });
    expect(wrapper.text()).toEqual(
      "Error: Something has gone wrong. If this issue persists, please raise an issue on GitHub."
    );
  });
});
