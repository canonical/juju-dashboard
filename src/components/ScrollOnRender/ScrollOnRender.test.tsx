import { render, screen } from "@testing-library/react";

import ScrollOnRender from "./ScrollOnRender";

describe("ScrollOnRender", () => {
  it("renders the provided children", () => {
    render(<ScrollOnRender>kids</ScrollOnRender>);
    expect(screen.getByText("kids")).toBeInTheDocument();
  });

  it("shouldn't scroll into view if no scroll area is provided", () => {
    render(<ScrollOnRender>kids</ScrollOnRender>);
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("shouldn't scroll into view if scroll area is null", () => {
    render(<ScrollOnRender scrollArea={null}>kids</ScrollOnRender>);
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("should scroll into view if scroll area is provided", () => {
    render(
      <ScrollOnRender scrollArea={document.createElement("div")}>
        kids
      </ScrollOnRender>,
    );
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });
  });
});
