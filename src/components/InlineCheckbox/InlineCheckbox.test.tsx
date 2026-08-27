import { render } from "@testing-library/react";

import InlineCheckbox from "./InlineCheckbox";

describe("InlineCheckbox", () => {
  it("renders with label", async ({ expect }) => {
    const result = render(<InlineCheckbox label="some label" />);
    await expect(result.findByLabelText("some label")).resolves.toHaveRole(
      "checkbox",
    );
  });

  it("has indeterminate state", async ({ expect }) => {
    const result = render(<InlineCheckbox label="some label" indeterminate />);
    await expect(result.findByRole("checkbox")).resolves.toBePartiallyChecked();
  });

  it("has checked state", async ({ expect }) => {
    const result = render(
      <InlineCheckbox label="some label" checked readOnly />,
    );
    await expect(result.findByRole("checkbox")).resolves.toBeChecked();
  });

  it("rerenders with states", async ({ expect }) => {
    const result = render(
      <InlineCheckbox label="some label" checked readOnly />,
    );
    await expect(result.findByRole("checkbox")).resolves.toBeChecked();
    result.rerender(
      <InlineCheckbox label="some label" indeterminate checked={false} />,
    );
    await expect(result.findByRole("checkbox")).resolves.toBePartiallyChecked();
  });
});
