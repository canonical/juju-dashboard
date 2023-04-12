import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Banner, { Label } from "./Banner";

describe("Banner", () => {
  it("should display banner text", () => {
    render(
      <Banner variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByText("Banner text")).toBeInTheDocument();
  });

  it("should appear if active", () => {
    render(
      <Banner data-testid="banner" variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByTestId("banner")).toHaveAttribute("data-active", "true");
  });

  it("should not appear if not active", () => {
    render(
      <Banner data-testid="banner" variant="positive" isActive={false}>
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByTestId("banner")).toHaveAttribute(
      "data-active",
      "false"
    );
  });

  it("should as cautionary if variant prop is set", () => {
    render(
      <Banner data-testid="banner" isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByTestId("banner")).toHaveAttribute(
      "data-variant",
      "caution"
    );
  });

  it("should close if close button is pressed", async () => {
    render(
      <Banner data-testid="banner" isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByTestId("banner")).toHaveAttribute("data-active", "true");
    await userEvent.click(screen.getByRole("button", { name: Label.CLOSE }));
    expect(screen.getByTestId("banner")).toHaveAttribute(
      "data-active",
      "false"
    );
  });

  it("should return if variant changes after close button is pressed", async () => {
    const { rerender } = render(
      <Banner data-testid="banner" isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    await userEvent.click(screen.getByRole("button", { name: Label.CLOSE }));
    expect(screen.getByTestId("banner")).toHaveAttribute(
      "data-active",
      "false"
    );
    rerender(
      <Banner data-testid="banner" isActive={true} variant="positive">
        <p>Banner text</p>
      </Banner>
    );
    expect(screen.getByTestId("banner")).toHaveAttribute("data-active", "true");
  });
});
