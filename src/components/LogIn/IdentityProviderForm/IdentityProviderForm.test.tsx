import { screen, within } from "@testing-library/react";

import { generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import IdentityProviderForm from "./IdentityProviderForm";

describe("IdentityProviderForm", () => {
  it("should render a 'connecting' message if the user is logged in", () => {
    renderComponent(<IdentityProviderForm userIsLoggedIn={true} />);
    expect(
      within(screen.getByRole("button")).getByText("Connecting..."),
    ).toBeInTheDocument();
  });

  it("should render a 'connecting' message if the user is not logged in and there is no visitURLs", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: null,
      }),
    });
    renderComponent(<IdentityProviderForm userIsLoggedIn={false} />, { state });
    expect(
      within(screen.getByRole("button")).getByText("Connecting..."),
    ).toBeInTheDocument();
  });

  it("should render a login message if the user is not logged in and there is visitURLs", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: ["I am a url"],
      }),
    });
    renderComponent(<IdentityProviderForm userIsLoggedIn={false} />, { state });
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toBeInTheDocument();
  });
});
