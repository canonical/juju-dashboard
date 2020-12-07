import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import WS from "jest-websocket-mock";

import WebCLI from "./WebCLI";

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

  it("renders correctly", () => {
    const wrapper = mount(
      <WebCLI controllerWSHost="jimm.jujucharms.com:443" modelUUID="abc123" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("shows the help in the output when the ? is clicked", () => {
    const wrapper = mount(
      <WebCLI controllerWSHost="jimm.jujucharms.com:443" modelUUID="abc123" />
    );
    act(() => {
      wrapper.find(".webcli__input-help i").simulate("click");
    });
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

  it("calls to refresh the model on command submission", () => {
    const mockRefreshModel = jest.fn();
    new WS("ws://localhost:1234/model/abc123/commands", {
      jsonProtocol: true,
    });
    const wrapper = mount(
      <WebCLI
        protocol="ws"
        controllerWSHost="localhost:1234"
        credentials={{
          user: "spaceman",
          password: "somelongpassword",
        }}
        modelUUID="abc123"
        refreshModel={mockRefreshModel}
      />
    );
    wrapper.find(".webcli__input-input").instance().value = "status --color";
    wrapper.find("form").simulate("submit", { preventDefault: () => {} });
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(mockRefreshModel).toHaveBeenCalled();
        WS.clean();
        resolve();
      }, 600); // the timeout is 500ms in the app
    });
  });

  describe("WebCLI Output", () => {
    it("displays messages recieved over the websocket", () => {
      clobberConsoleError();
      // ..until it receives a 'done' message.
      const server = new WS("ws://localhost:1234/model/abc123/commands", {
        jsonProtocol: true,
      });
      const wrapper = mount(
        <WebCLI
          protocol="ws"
          controllerWSHost="localhost:1234"
          credentials={{
            user: "spaceman",
            password: "somelongpassword",
          }}
          modelUUID="abc123"
        />
      );
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

    it("displays ansi colored content colored", () => {
      clobberConsoleError();
      // ..until it receives a 'done' message.
      const server = new WS("ws://localhost:1234/model/abc123/commands", {
        jsonProtocol: true,
      });
      const wrapper = mount(
        <WebCLI
          protocol="ws"
          controllerWSHost="localhost:1234"
          credentials={{
            user: "spaceman",
            password: "somelongpassword",
          }}
          modelUUID="abc123"
        />
      );
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
