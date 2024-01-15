import { render, screen } from "@testing-library/react";

import Aside from "./Aside";

describe("Aside", () => {
  it("should display children", () => {
    render(
      <Aside>
        <p data-testid="aside-content">Aside content</p>
      </Aside>,
    );
    expect(screen.getByTestId("aside-content")).toBeInTheDocument();
  });

  it("should display without width or pinned status", () => {
    render(
      <Aside data-testid="aside">
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("l-aside");
    expect(aside).not.toHaveClass(".is-narrow");
    expect(aside).not.toHaveClass(".is-wide");
    expect(aside).not.toHaveClass(".is-pinned");
  });

  it("should display correct narrow width", () => {
    render(
      <Aside data-testid="aside" width="narrow">
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("is-narrow");
  });

  it("should display correct wide width", () => {
    render(
      <Aside data-testid="aside" width="wide">
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("is-wide");
  });

  it("should display correct pinned status", () => {
    render(
      <Aside data-testid="aside" pinned={true}>
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("is-pinned");
  });
});
