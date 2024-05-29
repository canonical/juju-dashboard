import { screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import IdentityProviderForm from "./IdentityProviderForm";

describe("IdentityProviderForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a 'connecting' message while connecting a logged in user", () => {
    renderComponent(<IdentityProviderForm userIsLoggedIn={true} />);
    expect(
      within(screen.getByRole("button")).getByText("Connecting..."),
    ).toBeInTheDocument();
  });

  it("renders a 'connecting' message while connecting a logged in user", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          identityProviderAvailable: true,
        }),
      }),
    });
    renderComponent(<IdentityProviderForm userIsLoggedIn={false} />, { state });
    expect(
      within(screen.getByRole("button")).getByText("Connecting..."),
    ).toBeInTheDocument();
  });

  it("renders a login message if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: ["I am a url"],
        config: configFactory.build({
          identityProviderAvailable: true,
        }),
      }),
    });
    renderComponent(<IdentityProviderForm userIsLoggedIn={false} />, { state });
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toBeInTheDocument();
  });
});
