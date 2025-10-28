import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Banner from "./Banner";
import { Label } from "./types";

const TEST_ID = "banner";

describe("Banner", () => {
  it("should display banner text", () => {
    render(
      <Banner variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByText("Banner text")).toBeInTheDocument();
  });

  it("should appear if active", () => {
    render(
      <Banner data-testid={TEST_ID} variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "true");
  });

  it("should not appear if not active", () => {
    render(
      <Banner data-testid={TEST_ID} variant="positive" isActive={false}>
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "false");
  });

  it("should as cautionary if variant prop is set", () => {
    render(
      <Banner data-testid={TEST_ID} isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute(
      "data-variant",
      "caution",
    );
  });

  it("should close if close button is pressed", async () => {
    render(
      <Banner data-testid={TEST_ID} isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "true");
    await userEvent.click(screen.getByRole("button", { name: Label.CLOSE }));
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "false");
  });

  it("should return if variant changes after close button is pressed", async () => {
    const { rerender } = render(
      <Banner data-testid={TEST_ID} isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.CLOSE }));
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "false");
    rerender(
      <Banner data-testid={TEST_ID} isActive={true} variant="positive">
        <p>Banner text</p>
      </Banner>,
    );
    expect(screen.getByTestId(TEST_ID)).toHaveAttribute("data-active", "true");
  });
});
