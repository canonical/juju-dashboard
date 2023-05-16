import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import UserMenu from "./UserMenu";

describe("User Menu", () => {
  let state: RootState;

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
  });

  it("is inactive by default", () => {
    renderComponent(<UserMenu />, { state });
    expect(document.querySelector(".user-menu")).not.toHaveClass("is-active");
  });

  it("is active when userMenuActive in redux store is true", () => {
    state.ui.userMenuActive = true;
    renderComponent(<UserMenu />, { state });

    expect(document.querySelector(".user-menu")).toHaveClass("is-active");
  });

  it("displays current logged in user", () => {
    renderComponent(<UserMenu />, { state });
    expect(screen.getByText("eggman")).toHaveClass("user-menu__name");
  });

  it("Test dispatch function is fired", async () => {
    const { store } = renderComponent(<UserMenu />, { state });
    await userEvent.click(screen.getByRole("button"));
    const actions = store.getActions();
    const expectedPayload = { payload: true, type: "ui/userMenuActive" };
    expect(actions).toEqual([expectedPayload]);
  });
});
