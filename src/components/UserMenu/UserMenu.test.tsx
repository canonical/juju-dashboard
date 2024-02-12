import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import reactHotToast, { Toaster } from "react-hot-toast";

import { thunks as appThunks } from "store/app";
import type { RootState } from "store/store";
import * as dashboardStore from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import UserMenu, { Label } from "./UserMenu";

describe("User Menu", () => {
  let state: RootState;
  const consoleError = console.error;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
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
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.error = consoleError;
    act(() => reactHotToast.remove());
  });

  it("is inactive by default", () => {
    renderComponent(<UserMenu />, { state });
    expect(document.querySelector(".user-menu")).not.toHaveClass("is-active");
  });

  it("can open the menu", async () => {
    renderComponent(<UserMenu />, { state });
    await userEvent.click(screen.getByRole("button", { name: "eggman" }));
    expect(document.querySelector(".user-menu")).toHaveClass("is-active");
  });

  it("displays current logged in user", () => {
    renderComponent(<UserMenu />, { state });
    expect(screen.getByRole("button", { name: "eggman" })).toBeInTheDocument();
  });

  it("should logout", async () => {
    jest
      .spyOn(appThunks, "logOut")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "logOut", catch: jest.fn() }),
      );
    const mockUseAppDispatch = jest.fn().mockReturnValue({
      then: jest.fn().mockReturnValue({ catch: jest.fn() }),
    });
    jest
      .spyOn(dashboardStore, "useAppDispatch")
      .mockReturnValue(mockUseAppDispatch);

    renderComponent(<UserMenu />, { state });
    await userEvent.click(screen.getByRole("link", { name: "Log out" }));
    expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    expect(mockUseAppDispatch.mock.calls[0][0]).toMatchObject({
      type: "logOut",
    });
  });

  it("should show error when trying to logout and refresh page", async () => {
    const location = window.location;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: jest.fn() },
    });

    jest
      .spyOn(appThunks, "logOut")
      .mockImplementation(jest.fn().mockReturnValue({ type: "logOut" }));
    jest
      .spyOn(dashboardStore, "useAppDispatch")
      .mockImplementation(
        jest
          .fn()
          .mockReturnValue((action: unknown) =>
            action instanceof Object &&
            "type" in action &&
            action.type === "logOut"
              ? Promise.reject(new Error("Error while dispatching logOut!"))
              : null,
          ),
      );

    renderComponent(
      <>
        <UserMenu />
        <Toaster />
      </>,
      { state },
    );
    await userEvent.click(screen.getByRole("link", { name: "Log out" }));
    expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      Label.LOGOUT_ERROR,
      new Error("Error while dispatching logOut!"),
    );
    const logoutErrorNotification = screen.getByText(
      new RegExp(Label.LOGOUT_ERROR),
    );
    expect(logoutErrorNotification).toBeInTheDocument();
    expect(logoutErrorNotification.childElementCount).toBe(1);
    const refreshButton = logoutErrorNotification.children[0];
    expect(refreshButton).toHaveTextContent("refreshing");
    await userEvent.click(refreshButton);
    expect(window.location.reload).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, "location", {
      value: location,
    });
  });
});
