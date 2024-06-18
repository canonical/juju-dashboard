import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import ContentRevealTitle from "./ContentRevealTitle";

describe("ContentRevealTitle", () => {
  it("should display correct info for single offer and no chip group", () => {
    renderComponent(
      <ContentRevealTitle count={1} subject="Offer" chips={null} />,
    );
    expect(screen.getByText("1 Offer")).toBeInTheDocument();
    expect(document.querySelector(".chip-group")).not.toBeInTheDocument();
  });

  it("should display correct info for multiple local applications and no chip group", () => {
    renderComponent(
      <ContentRevealTitle count={3} subject="Local application" chips={null} />,
    );
    expect(screen.getByText("3 Local applications")).toBeInTheDocument();
    expect(document.querySelector(".chip-group")).not.toBeInTheDocument();
  });

  it("should display correct info for single remote application and chip group", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 3,
    };
    renderComponent(
      <ContentRevealTitle
        count={1}
        subject="Remote application"
        chips={fakeChips}
      />,
    );
    expect(screen.getByText("1 Remote application")).toBeInTheDocument();
    expect(document.querySelector(".chip-group")).toBeInTheDocument();
    expect(screen.getByText("1 foo")).toHaveClass("is-foo");
    expect(screen.getByText("2 bar")).toHaveClass("is-bar");
    expect(screen.getByText("3 baz")).toHaveClass("is-baz");
  });
});
