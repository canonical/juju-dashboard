import { screen } from "@testing-library/react";
import { NavLink } from "react-router";

import { renderComponent } from "testing/utils";

import SecondaryNavigation from "./SecondaryNavigation";

describe("SecondaryNavigation", () => {
  it("displays title", () => {
    renderComponent(
      <SecondaryNavigation
        title="Settings nav"
        items={[
          {
            items: [
              {
                component: NavLink,
                to: "/settings",
                label: "Settings item",
              },
            ],
          },
        ]}
      />,
    );
    expect(
      document.querySelector(".secondary-navigation__title"),
    ).toHaveTextContent("Settings nav");
  });

  it("displays nav items", () => {
    renderComponent(
      <SecondaryNavigation
        title="Settings nav"
        items={[
          {
            items: [
              {
                component: NavLink,
                to: "/settings",
                label: "Settings item",
              },
            ],
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Settings item" }),
    ).toBeInTheDocument();
  });
});
