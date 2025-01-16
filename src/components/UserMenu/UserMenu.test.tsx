import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { thunks as appThunks } from "store/app";
import type { RootState } from "store/store";
import * as dashboardStore from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import UserMenu from "./UserMenu";

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
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    console.error = consoleError;
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
    vi.spyOn(appThunks, "logOut").mockImplementation(
      vi.fn().mockReturnValue({ type: "logOut", catch: vi.fn() }),
    );
    const mockUseAppDispatch = vi.fn().mockReturnValue({
      then: vi.fn().mockReturnValue({ catch: vi.fn() }),
    });
    vi.spyOn(dashboardStore, "useAppDispatch").mockReturnValue(
      mockUseAppDispatch,
    );

    renderComponent(<UserMenu />, { state });
    await userEvent.click(screen.getByRole("link", { name: "Log out" }));
    expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    expect(mockUseAppDispatch.mock.calls[0][0]).toMatchObject({
      type: "logOut",
    });
  });
});
