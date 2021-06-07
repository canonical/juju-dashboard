import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WS from "jest-websocket-mock";
import cloneDeep from "clone-deep";

import { waitForComponentToPaint } from "testing/utils";
import dataDump from "testing/complete-redux-store-dump";

import WebCLI from "./WebCLI";

const mockStore = configureStore([]);

describe("WebCLI", () => {
  const originalError = console.error;

  afterEach(() => {
    // Reset the console.error to the original console.error in case
    // it was cobbered in a test.
    console.error = originalError;
  });

  /*
    Due to the setTimeout in the webCLI message buffer there doesn't appear
    to be a way to avoid all react `act` warnings in the tests that test
    the message handling.

    This method clobers the console.error for those tests so that we don't have
    to see the errors in the console.
  */
  const clobberConsoleError = () => {
    console.error = jest.fn();
  };

  async function generateComponent(
    props = {
      controllerWSHost: "jimm.jujucharms.com:443",
      modelUUID: "abc123",
    },
    customDataDump
  ) {
    const store = mockStore(customDataDump || dataDump);

    const wrapper = mount(
      <Provider store={store}>
        <WebCLI {...props} />
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  it("renders correctly", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("WebCLI")).toMatchSnapshot();
  });

  it("shows the help in the output when the ? is clicked", async () => {
    const wrapper = await generateComponent();
    wrapper.find(".webcli__input-help i").simulate("click");
    await waitForComponentToPaint(wrapper);
    return new Promise((resolve) => setTimeout(resolve)).then(() => {
      act(() => {
        wrapper.update();
      });
      expect(
        wrapper
          .find(".webcli__output-content code")
          .prop("dangerouslySetInnerHTML")["__html"]
      ).toBe(
        `Welcome to the Juju Web CLI - see the <a href="https://juju.is/docs/webcli" class="p-link--inverted" target="_blank">full documentation here</a>.`
      );
    });
  });

  it("calls to refresh the model on command submission", async () => {
    const mockRefreshModel = jest.fn();
    new WS("ws://localhost:1234/model/abc123/commands", {
      jsonProtocol: true,
    });
    const wrapper = await generateComponent({
      protocol: "ws",
      controllerWSHost: "localhost:1234",
      modelUUID: "abc123",
      credentials: {
        user: "spaceman",
        password: "somelongpassword",
      },
      refreshModel: mockRefreshModel,
    });
    wrapper.find(".webcli__input-input").instance().value = "status --color";
    wrapper.find("form").simulate("submit", { preventDefault: () => {} });
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(mockRefreshModel).toHaveBeenCalled();
        act(() => {
          WS.clean();
        });
        resolve();
      }, 600); // the timeout is 500ms in the app
    });
  });

  it("trims the command being submitted", async () => {
    const server = new WS("ws://localhost:1234/model/abc123/commands", {
      jsonProtocol: true,
    });
    const wrapper = await generateComponent({
      protocol: "ws",
      controllerWSHost: "localhost:1234",
      modelUUID: "abc123",
      credentials: {
        user: "spaceman",
        password: "somelongpassword",
      },
    });
    return new Promise(async (resolve) => {
      await server.connected;
      wrapper.find(".webcli__input-input").instance().value =
        "      status       ";
      wrapper.find("form").simulate("submit", { preventDefault: () => {} });
      await waitForComponentToPaint(wrapper);
      await expect(server).toReceiveMessage({
        user: "spaceman",
        credentials: "somelongpassword",
        commands: ["status"],
      });
      setTimeout(() => {
        act(() => {
          WS.clean();
        });
        resolve();
      });
    });
  });

  it("supports macaroon based authentication", async () => {
    const clonedDataDump = cloneDeep(dataDump);
    clonedDataDump.root.controllerConnections["ws://localhost:1234/api"] = {
      info: { user: { identity: "user-eggman@external" } },
    };
    clonedDataDump.root.bakery.storage.get = (key) => {
      const macaroons = { "ws://localhost:1234": "WyJtYWMiLCAiYXJvb24iXQo=" };
      return macaroons[key];
    };

    const server = new WS("ws://localhost:1234/model/abc123/commands", {
      jsonProtocol: true,
    });
    const wrapper = await generateComponent(
      {
        protocol: "ws",
        controllerWSHost: "localhost:1234",
        modelUUID: "abc123",
      },
      clonedDataDump
    );
    return new Promise(async (resolve) => {
      await server.connected;
      wrapper.find(".webcli__input-input").instance().value =
        "      status       ";
      wrapper.find("form").simulate("submit", { preventDefault: () => {} });
      await waitForComponentToPaint(wrapper);
      await expect(server).toReceiveMessage({
        user: "eggman@external",
        macaroons: [["mac", "aroon"]],
        commands: ["status"],
      });
      setTimeout(() => {
        act(() => {
          WS.clean();
        });
        resolve();
      });
    });
  });

  describe("WebCLI Output", () => {
    it("displays messages recieved over the websocket", async () => {
      clobberConsoleError();
      // ..until it receives a 'done' message.
      const server = new WS("ws://localhost:1234/model/abc123/commands", {
        jsonProtocol: true,
      });
      const wrapper = await generateComponent({
        protocol: "ws",
        controllerWSHost: "localhost:1234",
        modelUUID: "abc123",
        credentials: {
          user: "spaceman",
          password: "somelongpassword",
        },
      });
      return new Promise(async (resolve) => {
        await act(async () => {
          await server.connected;
          wrapper.find(".webcli__input-input").instance().value =
            "status --color";
          wrapper.find("form").simulate("submit", { preventDefault: () => {} });
          await expect(server).toReceiveMessage({
            user: "spaceman",
            credentials: "somelongpassword",
            commands: ["status --color"],
          });
        });

        const messages = [
          {
            output: [
              "Model       Controller       Cloud/Region     Version    SLA          Timestamp",
            ],
          },
          {
            output: [
              "controller  google-us-east1  google/us-east1  2.9-beta1  unsupported  17:44:14Z",
            ],
          },
          { output: [""] },
          {
            output: [
              "Machine  State    DNS             Inst id        Series  AZ          Message",
            ],
          },
          {
            output: [
              "0        started  35.190.153.209  juju-3686b9-0  focal   us-east1-b  RUNNING",
            ],
          },
          { output: [""] },
          { done: true },
        ];

        messages.forEach((message) => {
          // Due to the settimeout in the message buffer this causes intermittent react `act`
          // errors so this test has console.error clobbered to avoid looking at them.
          server.send(message);
        });

        setTimeout(() => {
          wrapper.update();
          expect(
            wrapper
              .find(".webcli__output-content code")
              .prop("dangerouslySetInnerHTML")
          ).toMatchSnapshot();
          expect(
            wrapper.find(".webcli__output-content").prop("style")
          ).toStrictEqual({
            height: "300px",
          });
          act(() => {
            WS.clean();
          });
          resolve();
        });
      });
    });

    it("displays ansi colored content colored", async () => {
      clobberConsoleError();
      // ..until it receives a 'done' message.
      const server = new WS("ws://localhost:1234/model/abc123/commands", {
        jsonProtocol: true,
      });
      const wrapper = await generateComponent({
        protocol: "ws",
        controllerWSHost: "localhost:1234",
        modelUUID: "abc123",
        credentials: {
          user: "spaceman",
          password: "somelongpassword",
        },
      });
      return new Promise(async (resolve) => {
        await act(async () => {
          await server.connected;
          wrapper.find(".webcli__input-input").instance().value =
            "status --color";
          wrapper.find("form").simulate("submit", { preventDefault: () => {} });
          await expect(server).toReceiveMessage({
            user: "spaceman",
            credentials: "somelongpassword",
            commands: ["status --color"],
          });
        });

        const messages = [
          {
            output: [
              "Model       Controller       Cloud/Region     Version    SLA          Timestamp",
            ],
          },
          {
            output: [
              "controller  google-us-east1  google/us-east1  2.9-beta1  unsupported  17:44:14Z",
            ],
          },
          { output: [""] },
          {
            output: [
              "Machine  State    DNS             Inst id        Series  AZ          Message",
            ],
          },
          {
            output: [
              "0        \u001b[32mstarted  \u001b[0m35.190.153.209  juju-3686b9-0  focal   us-east1-b  RUNNING",
            ],
          },
          { output: [""] },
          { done: true },
        ];

        messages.forEach((message) => {
          // Due to the settimeout in the message buffer this causes intermittent react `act`
          // errors so this test has console.error clobbered to avoid looking at them.
          server.send(message);
        });

        setTimeout(() => {
          wrapper.update();
          expect(
            wrapper
              .find(".webcli__output-content code")
              .prop("dangerouslySetInnerHTML")
          ).toMatchSnapshot();
          expect(
            wrapper.find(".webcli__output-content").prop("style")
          ).toStrictEqual({
            height: "300px",
          });
          act(() => {
            WS.clean();
          });
          resolve();
        });
      });
    });
  });
});
