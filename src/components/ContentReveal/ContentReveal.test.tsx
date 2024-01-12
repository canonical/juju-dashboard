import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContentReveal from "./ContentReveal";

describe("Content Reveal", () => {
  it("should show children as content", () => {
    render(
      <ContentReveal title="Foo bar">
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(screen.getByText("Banner text")).toBeInTheDocument();
  });

  it("should show correct title if only text", () => {
    render(
      <ContentReveal title="Foo bar">
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(screen.getByText("Foo bar")).toHaveClass("content-reveal__title");
  });

  it("should show correct title if only text and JSX", () => {
    const title = <div data-testid="jsx-title">JSX Title</div>;
    render(
      <ContentReveal title={title}>
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(screen.getByTestId("jsx-title")).toBeInTheDocument();
  });

  it("should toggle when clicked", async () => {
    render(
      <ContentReveal title="Foo bar">
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await userEvent.click(screen.getByRole("button"));
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    await userEvent.click(screen.getByRole("button"));
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("should toggle with keyboard", async () => {
    render(
      <ContentReveal title="Foo bar">
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: " ",
      code: "Space",
    });
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    fireEvent.keyDown(screen.getByRole("button"), {
      key: " ",
      code: "Space",
    });
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("should open by default if set", () => {
    render(
      <ContentReveal title="Foo bar" openByDefault={true}>
        <p>Banner text</p>
      </ContentReveal>,
    );
    expect(document.querySelector(".content-reveal__content")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });
});
