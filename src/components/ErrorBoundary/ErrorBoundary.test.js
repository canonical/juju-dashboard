import React from "react";
import { mount } from "enzyme";

import ErrorBoundary from "./ErrorBoundary";

function ChildComponent() {
  return null;
}

describe("error Boundary", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <ErrorBoundary>
        <ChildComponent />
      </ErrorBoundary>
    );
    const error = new Error("Oh noes!");
    wrapper.find(ChildComponent).simulateError(error);
    expect(wrapper).toMatchInlineSnapshot();
  });
});
