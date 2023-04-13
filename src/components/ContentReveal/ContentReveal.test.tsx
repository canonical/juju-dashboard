import { render, screen } from "@testing-library/react";

import ContentReveal from "./ContentReveal";

describe("Content Reveal", () => {
  it("should show children as content", () => {
    render(
      <ContentReveal title="Foo bar" openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(screen.getByText("Banner text")).toBeInTheDocument();
  });

  it("should show correct title if only text", () => {
    render(
      <ContentReveal title="Foo bar" openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(screen.getByText("Foo bar")).toHaveClass("content-reveal__title");
  });

  it("should show correct title if only text and JSX", () => {
    const title = <div data-testid="jsx-title">JSX Title</div>;
    render(
      <ContentReveal title={title} openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(screen.getByTestId("jsx-title")).toBeInTheDocument();
  });

  it("should open by default if set", () => {
    render(
      <ContentReveal title="Foo bar" openByDefault={true}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
  });
});
