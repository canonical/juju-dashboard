import { render, screen } from "@testing-library/react";

import NestedFields from "./NestedFields";

it("should display the children", () => {
  render(
    <NestedFields>
      <p>Content</p>
    </NestedFields>,
  );
  expect(screen.getByText("Content")).toBeInTheDocument();
});
