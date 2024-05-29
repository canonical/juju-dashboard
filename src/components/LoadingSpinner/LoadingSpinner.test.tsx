import { render, screen } from "@testing-library/react";

import LoadingSpinner from "./LoadingSpinner";
import { TestId } from "./types";

describe("LoadingSpinner", () => {
  it("should display the spinner", async () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId(TestId.LOADING)).toBeInTheDocument();
  });
});
