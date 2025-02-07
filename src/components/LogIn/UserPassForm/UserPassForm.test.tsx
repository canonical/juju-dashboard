import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import * as dashboardStore from "store/store";
import { generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import UserPassForm from "./UserPassForm";

describe("UserPassForm", () => {
  it("should log in", async () => {
    // Mock the result of the thunk to be a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    vi.spyOn(appThunks, "connectAndStartPolling").mockImplementation(
      vi.fn().mockReturnValue({
        type: "connectAndStartPolling",
        catch: vi.fn(),
      }),
    );
    const mockUseAppDispatch = vi.fn().mockReturnValue({
      then: vi.fn().mockReturnValue({ catch: vi.fn() }),
    });
    vi.spyOn(dashboardStore, "useAppDispatch").mockReturnValue(
      mockUseAppDispatch,
    );
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build(),
    });
    renderComponent(<UserPassForm />, { state });
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman",
    );
    await userEvent.type(screen.getByLabelText("Password"), "verysecure123");
    await userEvent.click(screen.getByRole("button"));
    const storeAction = generalActions.storeUserPass({
      wsControllerURL: "wss://controller.example.com",
      credential: { user: "eggman", password: "verysecure123" },
    });
    expect(mockUseAppDispatch.mock.calls[0][0]).toMatchObject({
      type: "general/cleanupLoginErrors",
    });
    expect(mockUseAppDispatch.mock.calls[1][0]).toMatchObject(storeAction);
    expect(mockUseAppDispatch.mock.calls[2][0]).toMatchObject({
      type: "connectAndStartPolling",
    });
  });
});
