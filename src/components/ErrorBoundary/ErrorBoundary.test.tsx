import { render } from "@testing-library/react";

import ErrorBoundary from "./ErrorBoundary";

function ChildComponent() {
  const error = new Error("Oh noes!");
  error.stack = "Stack trace output";
  throw error;
  // eslint-disable-next-line no-unreachable
  return null;
}

describe("Error Boundary", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // jest does not catch the error thrown in the component so this cleans up
    // the console output.
    consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders without crashing and matches snapshot", () => {
    const { container } = render(
      <ErrorBoundary>
        <ChildComponent />
      </ErrorBoundary>,
    );
    expect(container).toMatchSnapshot();
  });
});
