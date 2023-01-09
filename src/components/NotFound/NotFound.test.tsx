import { render, screen } from "@testing-library/react";

import NotFound from "./NotFound";

describe("NotFound", () => {
  it("should display correct text", () => {
    render(
      <NotFound message="Wut?">
        <p>This thing cannot be found</p>
      </NotFound>
    );
    expect(screen.getByRole("heading", { name: "Wut?" })).toBeInTheDocument();
    expect(screen.getByText("This thing cannot be found")).toBeInTheDocument();
  });
});
