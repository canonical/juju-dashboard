import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as apiModule from "juju/api";
import type { RootState } from "store/store";
import {
  applicationGetFactory,
  configFactory,
} from "testing/factories/juju/Application";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import ConfigPanel, { Label } from "./ConfigPanel";

jest.mock("juju/api", () => ({
  getApplicationConfig: jest.fn(),
  setApplicationConfig: jest.fn(),
}));

describe("ConfigPanel", () => {
  let state: RootState;
  const params = new URLSearchParams({
    entity: "easyrsa",
    charm: "cs:easyrsa",
    modelUUID: "abc123",
    panel: "config",
  });
  const url = `/models/eggman@external/hadoopspark?${params.toString()}`;
  const path = "/models/:userName/:modelName";
  let getApplicationConfigSpy: jest.SpyInstance;
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
    jest.resetModules();
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
            }),
          }),
        },
      }),
    });
    getApplicationConfigSpy = jest
      .spyOn(apiModule, "getApplicationConfig")
      .mockImplementation(() =>
        Promise.resolve(
          applicationGetFactory.build({
            config: {
              email: configFactory.build({ default: "" }),
              name: configFactory.build({ default: "eggman" }),
            },
          }),
        ),
      );
  });

  afterEach(() => {
    console.error = consoleError;
    jest.restoreAllMocks();
  });

  it("displays a message if the app has no config", async () => {
    jest.spyOn(apiModule, "getApplicationConfig").mockImplementation(() => {
      return Promise.resolve(applicationGetFactory.build({ config: {} }));
    });
    renderComponent(<ConfigPanel />, { state, path, url });
    // Use findBy to wait for the async events to finish
    await screen.findByText(Label.NONE);
    expect(document.querySelector(".config-panel__message")).toMatchSnapshot();
  });

  it("can display boolean, number and text fields", async () => {
    getApplicationConfigSpy = jest
      .spyOn(apiModule, "getApplicationConfig")
      .mockImplementation(() =>
        Promise.resolve(
          applicationGetFactory.build({
            config: {
              name: configFactory.build({ type: "string" }),
              age: configFactory.build({ type: "int" }),
              confirm: configFactory.build({ type: "boolean" }),
            },
          }),
        ),
      );
    renderComponent(<ConfigPanel />, { state, path, url });
    expect(
      within(await screen.findByTestId("name")).getByRole("textbox"),
    ).toBeInTheDocument();
    expect(
      within(await screen.findByTestId("age")).getByRole("spinbutton"),
    ).toBeInTheDocument();
    expect(
      within(await screen.findByTestId("confirm")).getAllByRole("radio"),
    ).toHaveLength(2);
  });

  it("highlights changed fields before save", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    const wrapper = await screen.findByTestId("email");
    const input = within(wrapper).getByRole("textbox");
    await userEvent.type(input, "new value");
    expect(input).toHaveTextContent("new value");
    expect(wrapper).toHaveClass("config-input--changed");
  });

  it("can reset all fields", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    const email = within(await screen.findByTestId("email")).getByRole(
      "textbox",
    );
    const name = within(await screen.findByTestId("name")).getByRole("textbox");
    await userEvent.type(email, "eggman@example.com");
    await userEvent.type(name, "not eggman");
    expect(email).toHaveTextContent("eggman@example.com");
    expect(name).toHaveTextContent("not eggman");
    await userEvent.click(
      screen.getByRole("button", { name: Label.RESET_BUTTON }),
    );
    expect(email).toHaveTextContent("");
    expect(name).toHaveTextContent("eggman");
  });

  it("displays a confirmation when clicking outside and there are unsaved changes", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.click(document.body);
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.CANCEL_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("closes when clicking outside and there are no unsaved changes", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.click(document.body);
    expect(
      within(screen.getByRole("dialog", { name: "" })).queryByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBeFalsy();
  });

  it("displays a confirmation when cancelling and there are unsaved changes", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.CANCEL_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("can confirm the cancel confirmation", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.CANCEL_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(window.location.search).toBeFalsy();
  });

  it("can cancel the cancel confirmation", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.CANCEL_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CANCEL_BUTTON }),
    );
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("closes when cancelling and there are no unsaved changes", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.click(
      await screen.findByRole("button", { name: Label.CANCEL_BUTTON }),
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).queryByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      }),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBeFalsy();
  });

  it("displays a confirmation before saving", async () => {
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON }),
    );
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.SAVE_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.SAVE_CONFIRM,
      }),
    ).toBeInTheDocument();
  });

  it("can cancel the save confirmation", async () => {
    const setApplicationConfigSpy = jest.spyOn(
      apiModule,
      "setApplicationConfig",
    );
    renderComponent(<ConfigPanel />, { state, path, url });
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON }),
    );
    expect(
      within(
        screen.getByRole("dialog", {
          name: Label.SAVE_CONFIRM,
        }),
      ).getByRole("heading", {
        name: Label.SAVE_CONFIRM,
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(
        screen.getByRole("dialog", {
          name: Label.SAVE_CONFIRM,
        }),
      ).getByRole("button", {
        name: Label.SAVE_CONFIRM_CANCEL_BUTTON,
      }),
    );
    expect(screen.queryByRole("dialog", { name: "" })).not.toBeInTheDocument();
    expect(setApplicationConfigSpy).not.toHaveBeenCalled();
  });

  it("can save changes", async () => {
    const setApplicationConfigSpy = jest
      .spyOn(apiModule, "setApplicationConfig")
      .mockImplementation(() => Promise.resolve({ results: [] }));
    renderComponent(<ConfigPanel />, { state, path, url });
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(setApplicationConfigSpy).toHaveBeenCalledWith(
      "abc123",
      "easyrsa",
      {
        email: configFactory.build({
          name: "email",
          default: "",
          newValue: "eggman@example.com",
        }),
        name: configFactory.build({
          name: "name",
          default: "eggman",
          newValue: "noteggman",
        }),
      },
      state,
    );
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(2);
  });

  it("displays save errors", async () => {
    jest.spyOn(apiModule, "setApplicationConfig").mockImplementation(() =>
      Promise.resolve({
        results: [{ error: { code: "1", message: "That's not a name" } }],
      }),
    );
    renderComponent(<ConfigPanel />, { state, path, url });
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(screen.getByText("That's not a name")).toBeInTheDocument();
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
  });

  it("should display error when trying to get config and refetch config data", async () => {
    jest
      .spyOn(apiModule, "getApplicationConfig")
      .mockImplementation(
        jest
          .fn()
          .mockRejectedValue(
            new Error("Error while calling getApplicationConfig"),
          ),
      );
    renderComponent(<ConfigPanel />, { state, path, url });
    expect(apiModule.getApplicationConfig).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        Label.GET_CONFIG_ERROR,
        new Error("Error while calling getApplicationConfig"),
      );
    });
    const configErrorNotification = screen.getByText(Label.GET_CONFIG_ERROR, {
      exact: false,
    });
    expect(configErrorNotification).toBeInTheDocument();
    expect(configErrorNotification.childElementCount).toBe(1);
    const refetchButton = configErrorNotification.children[0];
    expect(refetchButton).toHaveTextContent("refetch");
    await userEvent.click(refetchButton);
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(2);
  });

  it("should display error when trying to save", async () => {
    jest.spyOn(apiModule, "getApplicationConfig").mockImplementationOnce(
      jest.fn().mockResolvedValue(
        applicationGetFactory.build({
          config: {
            email: configFactory.build({ default: "" }),
            name: configFactory.build({ default: "eggman" }),
          },
        }),
      ),
    );
    const setApplicationConfigSpy = jest
      .spyOn(apiModule, "setApplicationConfig")
      .mockImplementation(() =>
        Promise.reject(new Error("Error while trying to save")),
      );
    renderComponent(<ConfigPanel />, { state, path, url });
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com",
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(setApplicationConfigSpy).toHaveBeenCalledWith(
      "abc123",
      "easyrsa",
      {
        email: configFactory.build({
          name: "email",
          default: "",
          newValue: "eggman@example.com",
        }),
        name: configFactory.build({
          name: "name",
          default: "eggman",
          newValue: "noteggman",
        }),
      },
      state,
    );
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        Label.SUBMIT_TO_JUJU_ERROR,
        new Error("Error while trying to save"),
      ),
    );
    expect(
      screen.getByText(Label.SUBMIT_TO_JUJU_ERROR, { exact: false }),
    ).toBeInTheDocument();
  });
});
