import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

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

import ConfigPanel, { Label } from "./ConfigPanel";

const mockStore = configureStore([]);

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
  const URL = `/models/eggman@external/hadoopspark?${params.toString()}`;
  let getApplicationConfigSpy: jest.SpyInstance;

  beforeEach(() => {
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
          })
        )
      );
    window.history.pushState({}, "", URL);
  });

  it("displays a message if the app has no config", async () => {
    jest.spyOn(apiModule, "getApplicationConfig").mockImplementation(() => {
      return Promise.resolve(applicationGetFactory.build({ config: {} }));
    });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
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
          })
        )
      );
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    expect(
      within(await screen.findByTestId("name")).getByRole("textbox")
    ).toBeInTheDocument();
    expect(
      within(await screen.findByTestId("age")).getByRole("spinbutton")
    ).toBeInTheDocument();
    expect(
      within(await screen.findByTestId("confirm")).getAllByRole("radio")
    ).toHaveLength(2);
  });

  it("highlights changed fields before save", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    const wrapper = await screen.findByTestId("email");
    const input = within(wrapper).getByRole("textbox");
    await userEvent.type(input, "new value");
    expect(input).toHaveTextContent("new value");
    expect(wrapper).toHaveClass("config-input--changed");
  });

  it("can reset all fields", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    const email = within(await screen.findByTestId("email")).getByRole(
      "textbox"
    );
    const name = within(await screen.findByTestId("name")).getByRole("textbox");
    await userEvent.type(email, "eggman@example.com");
    await userEvent.type(name, "not eggman");
    expect(email).toHaveTextContent("eggman@example.com");
    expect(name).toHaveTextContent("not eggman");
    await userEvent.click(
      screen.getByRole("button", { name: Label.RESET_BUTTON })
    );
    expect(email).toHaveTextContent("");
    expect(name).toHaveTextContent("eggman");
  });

  it("displays a confirmation when clicking outside and there are unsaved changes", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.click(document.body);
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("closes when clicking outside and there are no unsaved changes", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.click(document.body);
    expect(
      within(screen.getByRole("dialog", { name: "" })).queryByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).not.toBeInTheDocument();
    expect(window.location.search).toBeFalsy();
  });

  it("displays a confirmation when cancelling and there are unsaved changes", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("can confirm the cancel confirmation", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CONFIRM_BUTTON })
    );
    expect(window.location.search).toBeFalsy();
  });

  it("can cancel the cancel confirmation", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).toBeInTheDocument();
    expect(window.location.search).toBe(`?${params.toString()}`);
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CANCEL_BUTTON })
    );
    expect(window.location.search).toBe(`?${params.toString()}`);
  });

  it("closes when cancelling and there are no unsaved changes", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.click(
      await screen.findByRole("button", { name: Label.CANCEL_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).queryByRole("heading", {
        name: Label.CANCEL_CONFIRM,
      })
    ).not.toBeInTheDocument();
    expect(window.location.search).toBeFalsy();
  });

  it("displays a confirmation before saving", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.SAVE_CONFIRM,
      })
    ).toBeInTheDocument();
  });

  it("can cancel the save confirmation", async () => {
    const setApplicationConfigSpy = jest.spyOn(
      apiModule,
      "setApplicationConfig"
    );
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON })
    );
    expect(
      within(screen.getByRole("dialog", { name: "" })).getByRole("heading", {
        name: Label.SAVE_CONFIRM,
      })
    ).toBeInTheDocument();
    await userEvent.click(
      within(screen.getByRole("dialog", { name: "" })).getByRole("button", {
        name: Label.SAVE_CONFIRM_CANCEL_BUTTON,
      })
    );
    expect(screen.queryByRole("dialog", { name: "" })).not.toBeInTheDocument();
    expect(setApplicationConfigSpy).not.toHaveBeenCalled();
  });

  it("can save changes", async () => {
    const setApplicationConfigSpy = jest
      .spyOn(apiModule, "setApplicationConfig")
      .mockImplementation(() => Promise.resolve({ results: [] }));
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON })
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON })
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
      state
    );
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(2);
  });

  it("displays save errors", async () => {
    jest.spyOn(apiModule, "setApplicationConfig").mockImplementation(() =>
      Promise.resolve({
        results: [{ error: { code: "1", message: "That's not a name" } }],
      })
    );
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ConfigPanel />}
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
    await userEvent.type(
      within(await screen.findByTestId("email")).getByRole("textbox"),
      "eggman@example.com"
    );
    await userEvent.type(
      within(await screen.findByTestId("name")).getByRole("textbox"),
      "noteggman"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_BUTTON })
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON })
    );
    expect(screen.getByText("That's not a name")).toBeInTheDocument();
    expect(getApplicationConfigSpy).toHaveBeenCalledTimes(1);
  });
});
