import { render, screen } from "@testing-library/react";

import LoadingSpinner, { TestId } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should display the spinner", async () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId(TestId.LOADING)).toBeInTheDocument();
  });
});
