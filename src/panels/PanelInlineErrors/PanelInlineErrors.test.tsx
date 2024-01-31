import { render, screen } from "@testing-library/react";

import PanelInlineErrors from "./PanelInlineErrors";

describe("PanelInlineErrors", () => {
  it("should render inline errors", () => {
    render(<PanelInlineErrors inlineErrors={["Error 1", "Error 2"]} />);
    expect(screen.getByText(/Error 1/)).toBeInTheDocument();
    expect(screen.getByText(/Error 2/)).toBeInTheDocument();
  });
});
