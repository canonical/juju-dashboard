import { fireEvent, screen, within } from "@testing-library/react";
import { NavLink } from "react-router";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import BaseLayout from "./BaseLayout";
import { Label } from "./types";

describe("Base Layout", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders with a sidebar", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state },
    );
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state },
    );
    const main = screen.getByTestId("main-children");
    expect(within(main).getByText("foo")).toBeInTheDocument();
  });

  it("displays a message if the dashboard is offline", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" },
    );
    fireEvent.offline(window);
    expect(screen.getByText(Label.OFFLINE)).toBeInTheDocument();
  });

  it("displays a message if the dashboard comes back online", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" },
    );
    fireEvent.online(window);
    expect(
      screen.getByText(/Your dashboard is now back online/),
    ).toBeInTheDocument();
  });

  it("renders without secondary nav", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
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
      <BaseLayout
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
      </BaseLayout>,
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
      <BaseLayout loading>
        <p>children</p>
      </BaseLayout>,
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
