import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { Label } from "components/ShareCard/ShareCard";
import { actions as appActions } from "store/app";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  controllerFactory,
} from "testing/factories/juju/juju";

import ShareModel from "./ShareModel";

const mockStore = configureStore([]);

describe("Share Model Panel", () => {
  let state: RootState;

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
            }),
          }),
        },
      }),
    });
  });

  it("should show panel", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: "Sharing with:" })
    ).toBeInTheDocument();
  });

  it("displays domain suggestions", async () => {
    state.juju.modelData.def456 = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        users: [
          modelUserInfoFactory.build({ user: "other@model2" }),
          modelUserInfoFactory.build({ user: "other2@anothermodel2" }),
        ],
      }),
    });
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    expect(
      screen.getByRole("button", { name: "@external" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "@domain" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "@model2" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "@anothermodel2" })
    ).toBeInTheDocument();
  });

  it("can insert a domain", async () => {
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman"
    );
    await userEvent.click(screen.getByRole("button", { name: "@external" }));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      "eggman@external"
    );
  });

  it("can replace a domain", async () => {
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman@otherdomain"
    );
    await userEvent.click(screen.getByRole("button", { name: "@external" }));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      "eggman@external"
    );
  });

  it("should show small screen view toggles", async () => {
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
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

  it("can remove a user", async () => {
    const updatePermissionsSpy = jest.spyOn(appActions, "updatePermissions");
    const store = mockStore(state);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ShareModel />}
            />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: Label.REMOVE,
      })
    );
    expect(updatePermissionsSpy).toHaveBeenCalledWith({
      action: "revoke",
      modelUUID: "84e872ff-9171-46be-829b-70f0ffake18d",
      permissionFrom: "read",
      permissionTo: undefined,
      user: "spaceman@domain",
      wsControllerURL: "wss://jimm.jujucharms.com/api",
    });
  });
});
