import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import ContentSwitcher from "./ContentSwitcher";
import { InputMode, type Props } from "./types";

describe("ContentSwitcher", () => {
  const onModeChange = vi.fn();
  let defaultProps: Props;
  beforeEach(() => {
    onModeChange.mockClear();
    defaultProps = {
      showPrimary: true,
      docsLabel: "Learn about configuration",
      docsLink: "https://juju.is/docs",
      primaryContent: <div>Primary content</div>,
      secondaryContent: <div>Secondary content</div>,
      onModeChange,
      title: "Configuration (optional)",
    };
  });

  it("renders properly", () => {
    renderComponent(<ContentSwitcher {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Configuration (optional)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Learn about configuration" }),
    ).toHaveAttribute("href", "https://juju.is/docs");
    expect(
      screen.getByRole("radio", { name: InputMode.LIST }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: InputMode.YAML }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: InputMode.LIST })).toBeChecked();
  });

  it("checks the List radio and shows primary content when showPrimary is true", () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary />);

    expect(screen.getByRole("radio", { name: InputMode.LIST })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: InputMode.YAML }),
    ).not.toBeChecked();
    expect(screen.getByText("Primary content")).toBeInTheDocument();
    expect(screen.queryByText("Secondary content")).not.toBeInTheDocument();
  });

  it("checks the YAML radio and shows secondary content when showPrimary is false", () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary={false} />);

    expect(screen.getByRole("radio", { name: InputMode.YAML })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: InputMode.LIST }),
    ).not.toBeChecked();
    expect(screen.getByText("Secondary content")).toBeInTheDocument();
    expect(screen.queryByText("Primary content")).not.toBeInTheDocument();
  });

  it("calls onModeChange(false) when YAML radio is clicked", async () => {
    renderComponent(<ContentSwitcher {...defaultProps} />);
    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));
    expect(onModeChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("calls onModeChange(true) when List radio is clicked", async () => {
    renderComponent(<ContentSwitcher {...defaultProps} showPrimary={false} />);
    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));
    expect(onModeChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});
