import { render, screen } from "@testing-library/react";

import Aside from "./Aside";

const ASIDE_TEST_ID = "aside";

describe("Aside", () => {
  it("should display children", () => {
    const ASIDE_CONTENT_TEST_ID = "aside-content";
    render(
      <Aside>
        <p data-testid={ASIDE_CONTENT_TEST_ID}>Aside content</p>
      </Aside>,
    );
    expect(screen.getByTestId(ASIDE_CONTENT_TEST_ID)).toBeInTheDocument();
  });

  it("should display without width or pinned status", () => {
    render(
      <Aside data-testid={ASIDE_TEST_ID}>
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId(ASIDE_TEST_ID);
    expect(aside).toHaveClass("l-aside");
    expect(aside).not.toHaveClass(".is-narrow");
    expect(aside).not.toHaveClass(".is-wide");
    expect(aside).not.toHaveClass(".is-pinned");
  });

  it("should display correct narrow width", () => {
    render(
      <Aside data-testid={ASIDE_TEST_ID} width="narrow">
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId(ASIDE_TEST_ID);
    expect(aside).toHaveClass("is-narrow");
  });

  it("should display correct wide width", () => {
    render(
      <Aside data-testid={ASIDE_TEST_ID} width="wide">
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId(ASIDE_TEST_ID);
    expect(aside).toHaveClass("is-wide");
  });

  it("should display correct pinned status", () => {
    render(
      <Aside data-testid={ASIDE_TEST_ID} pinned={true}>
        <p>Aside content</p>
      </Aside>,
    );
    const aside = screen.getByTestId(ASIDE_TEST_ID);
    expect(aside).toHaveClass("is-pinned");
  });
});
