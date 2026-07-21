import { render, screen } from "@testing-library/react";

import SkeletonPlaceholder from "./SkeletonPlaceholder";

describe("SkeletonPlaceholder", () => {
  it("renders", () => {
    render(
      <SkeletonPlaceholder delay={0}>Placeholder text</SkeletonPlaceholder>,
    );
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
