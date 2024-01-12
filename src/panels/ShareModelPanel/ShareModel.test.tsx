import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import reactHotToast, { Toaster } from "react-hot-toast";

import { Label as ShareCardLabel } from "components/ShareCard/ShareCard";
import { actions as appActions } from "store/app";
import type { RootState } from "store/store";
import * as storeModule from "store/store";
import { rootStateFactory } from "testing/factories";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ShareModel, { Label } from "./ShareModel";

describe("Share Model Panel", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/eggman@external/hadoopspark";

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        controllers: {
          "wss://jimm.jujucharms.com/api": [
            controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
          ],
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "controller-uuid": "123",
              name: "hadoopspark",
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
              ],
              uuid: "abc123",
            }),
          }),
        },
      }),
    });
  });

  afterEach(() => {
    // Guarantees that Toaster state does not persist throughout renders.
    act(() => reactHotToast.remove());
    jest.restoreAllMocks();
  });

  it("should show panel", () => {
    renderComponent(<ShareModel />, { state, url, path });
    expect(
      screen.getByRole("heading", { name: "Sharing with:" }),
    ).toBeInTheDocument();
  });

  it("displays domain suggestions", async () => {
    state.juju.modelData.def456 = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        users: [
          modelUserInfoFactory.build({ user: "eggman@external" }),
          modelUserInfoFactory.build({ user: "another@external" }),
          modelUserInfoFactory.build({ user: "other@model2" }),
          modelUserInfoFactory.build({ user: "other2@anothermodel2" }),
        ],
      }),
    });
    renderComponent(<ShareModel />, { state, url, path });
    expect(
      screen.getByRole("button", { name: "@external" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "@domain" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "@model2" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "@anothermodel2" }),
    ).toBeInTheDocument();
  });

  it("can insert a domain", async () => {
    renderComponent(<ShareModel />, { state, url, path });
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman",
    );
    await userEvent.click(screen.getByRole("button", { name: "@external" }));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      "eggman@external",
    );
  });

  it("can replace a domain", async () => {
    renderComponent(<ShareModel />, { state, url, path });
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman@otherdomain",
    );
    await userEvent.click(screen.getByRole("button", { name: "@external" }));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      "eggman@external",
    );
  });

  it("should show small screen view toggles", async () => {
    renderComponent(<ShareModel />, { state, url, path });
    const addNewUserButton = screen.getByRole("button", {
      name: "Add new user",
    });
    expect(addNewUserButton).toBeInTheDocument();
    await userEvent.click(addNewUserButton);
    const backToCardsButton = screen.getByRole("button", {
      name: "Back",
    });
    expect(backToCardsButton).toBeInTheDocument();
  });

  it("shows a warning if trying to add an existing user", async () => {
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman@external",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_BUTTON }),
    );
    expect(
      await screen.findByText(/already has access to this model/),
    ).toBeInTheDocument();
  });

  it("handles errors when adding a user", async () => {
    jest
      .spyOn(storeModule, "usePromiseDispatch")
      .mockReturnValue(
        jest.fn().mockImplementation(() => Promise.reject(new Error())),
      );
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "another@external",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_BUTTON }),
    );
    expect(
      await screen.findByText(/Unable to update model permissions/),
    ).toBeInTheDocument();
  });

  it("catches errors when adding a user", async () => {
    jest
      .spyOn(storeModule, "usePromiseDispatch")
      .mockReturnValue(jest.fn().mockRejectedValue("Uh oh!"));
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "another@external",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_BUTTON }),
    );
    expect(await screen.findByText(/Uh oh!/)).toBeInTheDocument();
  });

  it("handles error responses when adding a user", async () => {
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(
      jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [{ error: { message: "This is an error" } }],
        }),
      ),
    );
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "another@external",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_BUTTON }),
    );
    expect(await screen.findByText(/This is an error/)).toBeInTheDocument();
  });

  it("can add a user", async () => {
    const dispatch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(dispatch);
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "another@external",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_BUTTON }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      appActions.updatePermissions({
        action: "grant",
        modelUUID: "abc123",
        permissionTo: "read",
        user: "another@external",
        wsControllerURL: "wss://jimm.jujucharms.com/api",
      }),
    );
    expect(
      await screen.findByText(/now has access to this model/),
    ).toBeInTheDocument();
  });

  it("can remove a user", async () => {
    const updatePermissionsSpy = jest.spyOn(appActions, "updatePermissions");
    renderComponent(<ShareModel />, { state, url, path });
    await userEvent.click(
      screen.getByRole("button", {
        name: ShareCardLabel.REMOVE,
      }),
    );
    expect(updatePermissionsSpy).toHaveBeenCalledWith({
      action: "revoke",
      modelUUID: "abc123",
      permissionFrom: "read",
      permissionTo: undefined,
      user: "spaceman@domain",
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
  });

  it("can undo removing a user", async () => {
    const updatePermissionsSpy = jest.spyOn(appActions, "updatePermissions");
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: ShareCardLabel.REMOVE,
      }),
    );
    await userEvent.click(
      screen.getAllByRole("button", {
        name: "Undo",
      })[0],
    );
    expect(updatePermissionsSpy).toHaveBeenCalledWith({
      action: "grant",
      modelUUID: "abc123",
      permissionFrom: undefined,
      permissionTo: "admin",
      user: "spaceman@domain",
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
  });

  it("can change permissions", async () => {
    const updatePermissionsSpy = jest.spyOn(appActions, "updatePermissions");
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "write");
    expect(updatePermissionsSpy).toHaveBeenCalledWith({
      action: "grant",
      modelUUID: "abc123",
      permissionFrom: "admin",
      permissionTo: "write",
      user: "spaceman@domain",
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
    expect(document.querySelector(".toast-card__message")?.textContent).toBe(
      "Permissions for spaceman@domain have been changed to write.",
    );
  });

  it("can handle errors when changing permissions", async () => {
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(
      jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [{ error: { message: "No no no no no" } }],
        }),
      ),
    );
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "write");
    expect(document.querySelector(".toast-card__message")?.textContent).toBe(
      "No no no no no",
    );
  });

  it("ignores greater access errors when updating permissions", async () => {
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(
      jest.fn().mockImplementation(() =>
        Promise.resolve({
          results: [
            { error: { message: "user already has admin access or greater" } },
          ],
        }),
      ),
    );
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "write");
    expect(document.querySelector(".toast-card__message")?.textContent).toBe(
      "Permissions for spaceman@domain have been changed to write.",
    );
  });

  it("can show and hide the mobile add form", async () => {
    renderComponent(
      <>
        <ShareModel />
        <Toaster />
      </>,
      { state, url, path },
    );
    // Check the initial state.
    expect(document.querySelector(".l-aside")).toHaveAttribute(
      "data-mobile-show-add-user",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: Label.BACK_BUTTON }),
    ).not.toBeInTheDocument();
    // Show the form and check it exists
    await userEvent.click(
      screen.getByRole("button", { name: Label.SHOW_ADD_FORM }),
    );
    expect(document.querySelector(".l-aside")).toHaveAttribute(
      "data-mobile-show-add-user",
      "true",
    );
    // Click 'back' and it should return to the initial state.
    expect(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    );
    expect(document.querySelector(".l-aside")).toHaveAttribute(
      "data-mobile-show-add-user",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: Label.BACK_BUTTON }),
    ).not.toBeInTheDocument();
  });
});
