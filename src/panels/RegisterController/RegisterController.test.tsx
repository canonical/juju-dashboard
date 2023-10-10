import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { thunks as appThunks } from "store/app";
import * as dashboardStore from "store/store";
import { renderComponent } from "testing/utils";

import RegisterController, { Label, STORAGE_KEY } from "./RegisterController";

describe("RegisterController", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
    console.error = consoleError;
  });

  it("can register a controller", async () => {
    // Mock the result of the thunk to be a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" })
      );
    jest.spyOn(dashboardStore, "useAppDispatch").mockImplementation(
      jest.fn().mockReturnValue((action: unknown) => {
        if (
          action instanceof Object &&
          "type" in action &&
          action.type === "connectAndStartPolling"
        ) {
          store.dispatch(appThunks.connectAndStartPolling() as any);
          return Promise.resolve({ catch: jest.fn() });
        }
        return null;
      })
    );
    const { store } = renderComponent(<RegisterController />);
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Name",
      }),
      "controller1"
    );
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Host",
      }),
      "1.2.3.4:567"
    );
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Username",
      }),
      "eggman@external"
    );
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "The SSL certificate, if any, has been accepted. *",
      })
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "")).toStrictEqual([
      [
        "wss://1.2.3.4:567/api",
        {
          password: "",
          user: "eggman@external",
        },
        null,
        true,
      ],
    ]);
    expect(
      store
        .getActions()
        .find((action) => action.type === "connectAndStartPolling")
    ).toBeTruthy();
  });

  it("clears and disables the username and password if external auth is set", async () => {
    renderComponent(<RegisterController />);
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Username",
      }),
      "eggman@external"
    );
    await userEvent.type(screen.getByLabelText("Password"), "verysecure123");
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      "eggman@external"
    );
    expect(screen.getByLabelText("Password")).toHaveValue("verysecure123");
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "This controller uses an external identity provider.",
      })
    );
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Username" })).toBeDisabled();
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toBeDisabled();
  });

  it("requires the certificate warning to be checked", async () => {
    renderComponent(<RegisterController />);
    expect(screen.getByRole("button", { name: Label.SUBMIT })).toBeDisabled();
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "The SSL certificate, if any, has been accepted. *",
      })
    );
    expect(
      screen.getByRole("button", { name: Label.SUBMIT })
    ).not.toBeDisabled();
  });

  it("should show console error when dispatching connectAndStartPolling", async () => {
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" })
      );
    jest.spyOn(dashboardStore, "useAppDispatch").mockImplementation(
      jest.fn().mockReturnValue((action: unknown) => {
        if (
          action instanceof Object &&
          "type" in action &&
          action.type === "connectAndStartPolling"
        ) {
          return Promise.reject(
            new Error("Error while trying to dispatch connectAndStartPolling!")
          );
        }
        return null;
      })
    );
    renderComponent(<RegisterController />);
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Name",
      }),
      "controller1"
    );
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Host",
      }),
      "1.2.3.4:567"
    );
    await userEvent.type(
      screen.getByRole("textbox", {
        name: "Username",
      }),
      "eggman@external"
    );
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "The SSL certificate, if any, has been accepted. *",
      })
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(appThunks.connectAndStartPolling).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        Label.POLLING_ERROR,
        new Error("Error while trying to dispatch connectAndStartPolling!")
      )
    );
  });
});
