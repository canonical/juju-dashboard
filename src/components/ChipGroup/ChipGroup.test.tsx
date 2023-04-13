import { render, screen } from "@testing-library/react";

import ChipGroup from "./ChipGroup";

describe("Chip Group", () => {
  it("should show correct chip counts", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 3,
    };
    render(<ChipGroup chips={fakeChips} descriptor="units" />);
    expect(screen.getByText("1 foo")).toHaveClass("is-foo");
    expect(screen.getByText("2 bar")).toHaveClass("is-bar");
    expect(screen.getByText("3 baz")).toHaveClass("is-baz");
  });

  it("should not show chips with zero count", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 0,
    };
    render(<ChipGroup chips={fakeChips} descriptor="units" />);
    expect(document.querySelector(".is-baz")).not.toBeInTheDocument();
  });

  it("should display the correct count and descriptor", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 0,
    };
    render(<ChipGroup chips={fakeChips} descriptor="units" />);
    expect(screen.getByText("3 Units")).toHaveClass("chip-group__descriptor");
  });

  it("should not display the descriptor when null", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 0,
    };
    render(<ChipGroup chips={fakeChips} descriptor={null} />);
    expect(
      document.querySelector(".chip-group__descriptor")
    ).not.toBeInTheDocument();
  });
});
