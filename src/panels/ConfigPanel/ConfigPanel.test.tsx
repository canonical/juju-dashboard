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
} from "testing/factories/juju/ApplicationV15";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import ConfigPanel, { Label } from "./ConfigPanel";

const mockStore = configureStore([]);

jest.mock("juju/api", () => ({
  getApplicationConfig: jest.fn(),
}));

describe("ConfigPanel", () => {
  let state: RootState;

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
  });

  it("displays a message if the app has no config", async () => {
    jest.spyOn(apiModule, "getApplicationConfig").mockImplementation(() => {
      return Promise.resolve(applicationGetFactory.build({ config: {} }));
    });
    const params = new URLSearchParams({
      entity: "easyrsa",
      charm: "cs:easyrsa",
      modelUUID: "abc123",
      panel: "config",
    });
    window.history.pushState(
      {},
      "",
      `/models/eggman@external/hadoopspark?${params.toString()}`
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
    // Use findBy to wait for the async events to finish
    await screen.findByText(Label.NONE);
    expect(document.querySelector(".config-panel__message")).toMatchSnapshot();
  });

  it("highlights changed fields before save", async () => {
    jest.spyOn(apiModule, "getApplicationConfig").mockImplementation(() => {
      return Promise.resolve(
        applicationGetFactory.build({
          config: {
            "custom-registry-ca": configFactory.build(),
          },
        })
      );
    });
    const params = new URLSearchParams({
      entity: "easyrsa",
      charm: "cs:easyrsa",
      modelUUID: "abc123",
      panel: "config",
    });
    window.history.pushState(
      {},
      "",
      `/models/eggman@external/hadoopspark?${params.toString()}`
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

    const wrapper = await screen.findByTestId("custom-registry-ca");
    const input = within(wrapper).getByRole("textbox");
    await userEvent.type(input, "new value");
    expect(input).toHaveTextContent("new value");
    expect(wrapper).toHaveClass("config-input--changed");
  });
});
