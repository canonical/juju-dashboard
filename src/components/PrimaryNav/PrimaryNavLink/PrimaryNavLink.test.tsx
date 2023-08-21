import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import PrimaryNavLink, { TestId } from "./PrimaryNavLink";

describe("PrimayNavLink", () => {
  const to = "/models";
  const iconName = "models";
  const title = "Models";

  it("should render successfully", () => {
    renderComponent(
      <PrimaryNavLink to={to} iconName={iconName} title={title} />
    );
    expect(document.querySelector(".p-icon--models")).toBeVisible();
    expect(document.querySelector(".hide-collapsed")).toHaveTextContent(
      "Models"
    );
  });

  it("should navigate to url after pressing the button", async () => {
    renderComponent(
      <PrimaryNavLink to={to} iconName={iconName} title={title} />
    );
    await userEvent.click(screen.getByTestId(TestId.PRIMARY_NAV_LINK));
    expect(window.location.pathname).toBe("/models");
  });
});
