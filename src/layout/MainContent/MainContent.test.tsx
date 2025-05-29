import { screen } from "@testing-library/react";
import { NavLink } from "react-router";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import MainContent from "./MainContent";

describe("MainContent", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders without secondary nav", () => {
    renderComponent(
      <MainContent>
        <p>foo</p>
      </MainContent>,
      { state },
    );
    expect(document.querySelector(".l-main__content")).not.toHaveClass(
      "l-main__content--has-secondary-nav",
    );
    expect(
      document.querySelector(".secondary-navigation"),
    ).not.toBeInTheDocument();
  });

  it("renders with secondary nav", () => {
    renderComponent(
      <MainContent
        secondaryNav={{
          title: "Second menu",
          items: [
            {
              items: [
                {
                  component: NavLink,
                  to: "/settings",
                  label: "Settings",
                },
              ],
            },
          ],
        }}
      >
        <p>foo</p>
      </MainContent>,
      { state },
    );
    expect(document.querySelector(".l-main__content")).toHaveClass(
      "l-main__content--has-secondary-nav",
    );
    expect(document.querySelector(".secondary-navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("can display a loading state", () => {
    renderComponent(
      <MainContent loading>
        <p>children</p>
      </MainContent>,
      { state },
    );
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
    expect(screen.queryByText("children")).not.toBeInTheDocument();
    expect(
      document.querySelector(".secondary-navigation"),
    ).not.toBeInTheDocument();
  });
});
