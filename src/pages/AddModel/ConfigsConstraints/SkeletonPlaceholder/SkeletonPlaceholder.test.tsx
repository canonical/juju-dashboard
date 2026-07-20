import { render, screen } from "@testing-library/react";

import SkeletonPlaceholder from "./SkeletonPlaceholder";

describe("SkeletonPlaceholder", () => {
  beforeEach(() => {
    vi.spyOn(Math, "floor").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders", () => {
    render(<SkeletonPlaceholder>Placeholder text</SkeletonPlaceholder>);
    expect(screen.getByTestId("placeholder")).toBeInTheDocument();
  });

  it("does not return placeholder styling if loading is false", () => {
    render(
      <SkeletonPlaceholder loading={false}>
        Placeholder text
      </SkeletonPlaceholder>,
    );
    expect(screen.queryByTestId("placeholder")).not.toBeInTheDocument();
  });
});
