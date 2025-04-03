import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { IdentityProviderFormTestId } from "./IdentityProviderForm";
import LogIn from "./LogIn";
import { OIDCFormTestId } from "./OIDCForm";
import { ErrorResponse, Label } from "./types";

describe("LogIn", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not display the login form if the user is logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        controllerConnections: {
          "wss://controller.example.com": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
    });
    renderComponent(<LogIn />, {
      state,
      path: "*",
      routeChildren: [{ path: "", element: <>App content</> }],
    });
    expect(document.querySelector(".login")).not.toBeInTheDocument();
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders an IdentityProvider login UI if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: ["I am a url"],
        config: configFactory.build({
          isJuju: true,
          identityProviderURL: "/candid",
        }),
      }),
    });
    renderComponent(<LogIn />, { state });
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toHaveAttribute("data-testid", IdentityProviderFormTestId.CANDID_LOGIN);
    expect(
      screen.queryByRole("textbox", { name: "Username" }),
    ).not.toBeInTheDocument();
  });

  it("renders an OIDC login UI if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({ isJuju: false }),
      }),
    });
    renderComponent(<LogIn />, { state });
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toHaveAttribute("data-testid", OIDCFormTestId.OIDC_LOGIN);
    expect(
      screen.queryByRole("textbox", { name: "Username" }),
    ).not.toBeInTheDocument();
  });

  it("renders a UserPass login UI if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({ isJuju: true }),
      }),
    });
    renderComponent(<LogIn />, { state });
    expect(screen.getByRole("button")).toHaveTextContent(
      Label.LOGIN_TO_DASHBOARD,
    );
    expect(
      screen.getByRole("textbox", { name: "Username" }),
    ).toBeInTheDocument();
  });

  it("renders a login error if one exists", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        login: {
          errors: {
            "wss://controller.example.com": "Controller rejected request",
          },
        },
      }),
    });
    renderComponent(<LogIn />, { state });
    const error = screen.getByText("Controller rejected request");
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass("error-message");
  });

  it("renders invalid username login errors", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        login: {
          errors: { "wss://controller.example.com": ErrorResponse.INVALID_TAG },
        },
        config: configFactory.build(),
      }),
    });
    renderComponent(<LogIn />, { state });
    expect(screen.getByText(Label.INVALID_NAME)).toBeInTheDocument();
  });

  it("renders invalid field errors", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        login: {
          errors: {
            "wss://controller.example.com": ErrorResponse.INVALID_FIELD,
          },
        },
      }),
    });
    renderComponent(<LogIn />, { state });
    expect(screen.getByText(Label.INVALID_FIELD)).toBeInTheDocument();
  });

  it("displays authentication request notifications", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build(),
        visitURLs: ["http://example.com/log-in"],
      }),
    });
    renderComponent(<LogIn />, { state });
    const card = await screen.findByTestId("toast-card");
    expect(
      await within(card).findByText("Controller authentication required"),
    ).toBeInTheDocument();
    expect(
      await within(card).findByRole("link", { name: "Authenticate" }),
    ).toBeInTheDocument();
  });

  it("should remove the authentication request when clicking the authenticate button", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          isJuju: true,
        }),
        visitURLs: ["http://example.com/log-in"],
      }),
    });
    renderComponent(<LogIn />, { state });
    const card = await screen.findByTestId("toast-card");
    expect(card).toBeInTheDocument();
    await userEvent.click(
      await within(card).findByRole("link", { name: "Authenticate" }),
      { pointerEventsCheck: 0 },
    );
    expect(screen.queryByTestId("toast-card")).not.toBeInTheDocument();
  });
});
