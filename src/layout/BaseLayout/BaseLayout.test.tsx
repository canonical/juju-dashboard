import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import BaseLayout, { Label } from "./BaseLayout";

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
      { state }
    );
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state }
    );
    const main = screen.getByTestId("main-children");
    expect(within(main).getByText("foo")).toBeInTheDocument();
  });

  it("should collapse the sidebar on entity details pages", () => {
    state.ui.sideNavCollapsed = true;
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      {
        state,
        url: "/models/pizza@external/hadoopspark?activeView=machines",
        path: "/models/:userName/:modelName",
      }
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-sidenav-initially-collapsed",
      "true"
    );
  });

  it("should not collapse the sidebar when not on entity details pages", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" }
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-sidenav-initially-collapsed",
      "false"
    );
  });

  it("should include mobile navigation bar", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" }
    );
    expect(document.querySelector(".l-navigation-bar")).toBeInTheDocument();
  });

  it("can toggle the mobile navigation bar", async () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" }
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "true"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.MOBILE_MENU_OPEN_BUTTON })
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "false"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.MOBILE_MENU_CLOSE_BUTTON })
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "true"
    );
  });

  it("displays a message if the dashboard is offline", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" }
    );
    fireEvent.offline(window);
    expect(screen.getByText(Label.OFFLINE)).toBeInTheDocument();
  });

  it("displays a message if the dashboard comes back on line", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" }
    );
    fireEvent.online(window);
    expect(
      screen.getByText(/Your dashboard is now back online/)
    ).toBeInTheDocument();
  });
});
