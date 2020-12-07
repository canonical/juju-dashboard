import { mount } from "enzyme";

import ErrorBoundary from "./ErrorBoundary";

function ChildComponent() {
  return null;
}

describe("Error Boundary", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = mount(
      <ErrorBoundary>
        <ChildComponent />
      </ErrorBoundary>
    );
    const error = new Error("Oh noes!");
    wrapper.find(ChildComponent).simulateError(error);
    expect(wrapper).toMatchSnapshot();
  });
});
