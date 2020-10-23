import React from "react";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import WS from "jest-websocket-mock";

import WebCLI from "./WebCLI";

describe("WebCLI", () => {
  it("renders correctly", () => {
    const wrapper = mount(<WebCLI />);
    expect(wrapper).toMatchSnapshot();
  });

  it("shows the help in the output when the ? is clicked", () => {
    const wrapper = mount(<WebCLI />);
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

  it("shows a disconnected message if no ws is connected", () => {
    const wrapper = mount(<WebCLI />);
    expect(wrapper.find(".webcli__input-input").prop("placeholder")).toBe(
      "no web cli backend available"
    );
  });

  describe("WebCLI Output", () => {
    it("displays messages recieved over the websocket", () => {
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
          messages.forEach((message) => server.send(message));

          setTimeout(() => {
            act(() => {
              wrapper.update();
            });
            expect(
              wrapper
                .find(".webcli__output-content code")
                .prop("dangerouslySetInnerHTML")
            ).toMatchSnapshot();
            resolve();
          });
        });
      });
    });

    // it("can be resized by dragging");
    // it("displays ansi colored content colored");
    // it("displays content in the default height");
  });
});
