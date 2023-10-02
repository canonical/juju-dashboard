import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
import reactHotToast from "react-hot-toast";

import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import * as dashboardStore from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import LogIn, { ErrorResponse, Label } from "./LogIn";

describe("LogIn", () => {
  afterEach(() => {
    act(() => reactHotToast.remove());
    jest.restoreAllMocks();
  });

  it("renders a 'connecting' message while connecting", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          identityProviderAvailable: true,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(
      within(screen.getByRole("button")).getByText("Connecting...")
    ).toBeInTheDocument();
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
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
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(document.querySelector(".login")).not.toBeInTheDocument();
  });

  it("renders an IdentityProvider login UI if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: ["I am a url"],
        config: configFactory.build({
          identityProviderAvailable: true,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(screen.getByRole("link")).toHaveTextContent(
      "Log in to the dashboard"
    );
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders a UserPass login UI if the user is not logged in", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          identityProviderAvailable: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(screen.getByRole("button")).toHaveTextContent(
      "Log in to the dashboard"
    );
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders a login error if one exists", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        loginErrors: {
          "wss://controller.example.com": "Controller rejected request",
        },
        config: configFactory.build({
          identityProviderAvailable: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    const error = screen.getByText("Controller rejected request");
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass("error-message");
  });

  it("renders invalid username login errors", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        loginErrors: {
          "wss://controller.example.com": ErrorResponse.INVALID_TAG,
        },
        config: configFactory.build({
          identityProviderAvailable: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(screen.getByText(Label.INVALID_NAME)).toBeInTheDocument();
  });

  it("renders invalid field errors", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        loginErrors: {
          "wss://controller.example.com": ErrorResponse.INVALID_FIELD,
        },
        config: configFactory.build({
          identityProviderAvailable: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    expect(screen.getByText(Label.INVALID_FIELD)).toBeInTheDocument();
  });

  it("logs in", async () => {
    // Mock the result of the thunk to be a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest
          .fn()
          .mockReturnValue({ type: "connectAndStartPolling", catch: jest.fn() })
      );
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          identityProviderAvailable: false,
        }),
      }),
    });
    const { store } = renderComponent(<LogIn>App content</LogIn>, { state });
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman"
    );
    await userEvent.type(screen.getByLabelText("Password"), "verysecure123");
    await userEvent.click(screen.getByRole("button"));
    const actions = store.getActions();
    const storeAction = generalActions.storeUserPass({
      wsControllerURL: "wss://controller.example.com",
      credential: { user: "eggman", password: "verysecure123" },
    });
    expect(
      actions.find((action) => action.type === storeAction.type)
    ).toStrictEqual(storeAction);
    expect(
      actions.find(
        (action) => action.type === generalActions.cleanupLoginErrors().type
      )
    ).toBeTruthy();
    expect(
      actions.find((action) => action.type === "connectAndStartPolling")
    ).toBeTruthy();
  });

  it("displays the JAAS logo under JAAS", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        visitURLs: ["I am a url"],
        config: configFactory.build({
          isJuju: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    const logo = screen.getByAltText(Label.JAAS_LOGO);
    expect(logo).toHaveAttribute("src", "jaas-logo-black-on-white.svg");
  });

  it("displays the Juju logo under Juju", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          isJuju: true,
          identityProviderAvailable: false,
        }),
      }),
    });
    renderComponent(<LogIn>App content</LogIn>, { state });
    const logo = screen.getByAltText(Label.JUJU_LOGO);
    expect(logo).toHaveAttribute("src", "juju-logo-black-on-white.svg");
  });

  it("displays authentication request notifications", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          identityProviderAvailable: true,
        }),
        visitURLs: ["/log-in"],
      }),
    });
    renderComponent(
      <>
        <Toaster />
        <LogIn>App content</LogIn>
      </>,
      { state }
    );
    const card = await screen.findByTestId("toast-card");
    expect(
      await within(card).findByText("Controller authentication required")
    ).toBeInTheDocument();
    expect(
      await within(card).findByRole("link", { name: "Authenticate" })
    ).toBeInTheDocument();
  });

  it("should remove the authentication request when clicking the authenticate button", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          isJuju: true,
          identityProviderAvailable: false,
        }),
        visitURLs: ["/log-in"],
      }),
    });
    const { result } = renderComponent(
      <>
        <Toaster />
        <LogIn>App content</LogIn>
      </>,
      { state }
    );
    const card = await screen.findByTestId("toast-card");
    expect(card).toBeInTheDocument();
    await userEvent.click(
      await within(card).findByRole("link", { name: "Authenticate" })
    );
    result.rerender(
      <>
        <Toaster />
        <LogIn>App content</LogIn>
      </>
    );
    expect(screen.queryByTestId("toast-card")).not.toBeInTheDocument();
  });

  it("should display console error when trying to log in", async () => {
    const consoleError = console.error;
    console.error = jest.fn();
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" })
      );
    jest
      .spyOn(dashboardStore, "useAppDispatch")
      .mockImplementation(
        jest
          .fn()
          .mockReturnValue((action: unknown) =>
            action instanceof Object &&
            "type" in action &&
            action.type === "connectAndStartPolling"
              ? Promise.reject(
                  new Error("Error while dispatching connectAndStartPolling!")
                )
              : null
          )
      );

    renderComponent(<LogIn>App content</LogIn>);
    await userEvent.click(screen.getByRole("button"));
    expect(console.error).toHaveBeenCalledWith(
      Label.POLLING_ERROR,
      new Error("Error while dispatching connectAndStartPolling!")
    );

    console.error = consoleError;
  });
});
