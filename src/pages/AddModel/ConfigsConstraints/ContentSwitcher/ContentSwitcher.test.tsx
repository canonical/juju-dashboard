import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import ContentSwitcher from "./ContentSwitcher";

const onModeChange = vi.fn();

const defaultProps = {
  showPrimary: true,
  docsLabel: "Learn about configuration",
  docsLink: "https://juju.is/docs",
  name: "input-mode",
  primaryContent: <div>Primary content</div>,
  secondaryContent: <div>Secondary content</div>,
  onModeChange,
  title: "Configuration (optional)",
};

describe("ContentSwitcher", () => {
  beforeEach(() => {
    onModeChange.mockClear();
  });

  it("renders properly", () => {
    renderComponent(<ContentSwitcher {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Configuration (optional)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Learn about configuration" }),
    ).toHaveAttribute("href", "https://juju.is/docs");
    expect(screen.getByLabelText("List")).toBeInTheDocument();
    expect(screen.getByLabelText("YAML")).toBeInTheDocument();
    expect(screen.getByLabelText("List")).toBeChecked();
  });

  it("checks the List radio and shows primary content when showPrimary is true", () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary />);

    expect(screen.getByLabelText("List")).toBeChecked();
    expect(screen.getByLabelText("YAML")).not.toBeChecked();
    expect(screen.getByText("Primary content")).toBeInTheDocument();
    expect(screen.queryByText("Secondary content")).not.toBeInTheDocument();
  });

  it("checks the YAML radio and shows secondary content when showPrimary is false", () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary={false} />);

    expect(screen.getByLabelText("YAML")).toBeChecked();
    expect(screen.getByLabelText("List")).not.toBeChecked();
    expect(screen.getByText("Secondary content")).toBeInTheDocument();
    expect(screen.queryByText("Primary content")).not.toBeInTheDocument();
  });

  it("calls onModeChange(false) when YAML radio is clicked", async () => {
    renderComponent(<ContentSwitcher {...defaultProps} />);

    await userEvent.click(screen.getByLabelText("YAML"));

    expect(onModeChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("calls onModeChange(true) when List radio is clicked", async () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary={false} />);

    await userEvent.click(screen.getByLabelText("List"));

    expect(onModeChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});
