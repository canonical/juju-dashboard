import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import AppNavigation from "./AppNavigation";

it("displays children", () => {
  const children = "Test content";
  renderComponent(<AppNavigation>{children}</AppNavigation>);
  expect(screen.getByText(children)).toBeInTheDocument();
});

it("displays as collapsed", () => {
  renderComponent(<AppNavigation collapsed />);
  expect(document.querySelector(".l-navigation")).toHaveClass("is-collapsed");
});

it("displays as pinned", () => {
  renderComponent(<AppNavigation pinned />);
  expect(document.querySelector(".l-navigation")).toHaveClass("is-pinned");
});
