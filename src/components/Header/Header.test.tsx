import { render, screen } from "@testing-library/react";

import Header from "./Header";

describe("Header", () => {
  it("renders supplied children", () => {
    render(
      <Header>
        <div data-testid="child"></div>
      </Header>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
