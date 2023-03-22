import { render, screen } from "@testing-library/react";

import ScrollOnRender from "./ScrollOnRender";

describe("ScrollOnRender", () => {
  it("renders the provided children", () => {
    render(<ScrollOnRender>kids</ScrollOnRender>);
    expect(screen.getByText("kids")).toBeInTheDocument();
  });
});
