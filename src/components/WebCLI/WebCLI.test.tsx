import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WS } from "jest-websocket-mock";

import bakery from "juju/bakery";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { TestId } from "./Output";
import WebCLI, { MAX_HISTORY, Label as WebCLILabel } from "./WebCLI";
import { Label as ConnectionLabel } from "./connection";

jest.mock("juju/bakery", () => ({
  __esModule: true,
  default: {
    storage: {
      get: jest.fn(),
    },
  },
}));

describe("WebCLI", () => {
  let bakerySpy: jest.SpyInstance;
  let server: WS;
  const props = {
    controllerWSHost: "localhost:1234",
    modelUUID: "abc123",
    credentials: {
      user: "eggman@external",
      password: "somelongpassword",
    },
  };

  beforeEach(() => {
    bakerySpy = jest.spyOn(bakery.storage, "get");
    server = new WS("wss://localhost:1234/model/abc123/commands");
  });

  afterEach(() => {
    bakerySpy.mockClear();
    localStorage.clear();
    WS.clean();
  });

  it("renders correctly", async () => {
    const { result } = renderComponent(<WebCLI {...props} />);
    await server.connected;
    expect(result.container).toMatchSnapshot();
  });

  it("shows the help in the output when the ? is clicked", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    await userEvent.click(screen.getByRole("button"));
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(
      `Welcome to the Juju Web CLI - see the full documentation here.`,
    );
  });

  it("shows the help when there is no output", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(
      `Welcome to the Juju Web CLI - see the full documentation here.`,
    );
  });

  it("trims the command being submitted", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "      status       {enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status"],
      }),
    );
  });

  it("navigate back through the history", async () => {
    localStorage.setItem(
      "cliHistory",
      JSON.stringify(["status", "help", "whoami"]),
    );
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "{arrowup}{arrowup}");
    expect(input).toHaveValue("help");
  });

  it("navigate forward through the history", async () => {
    localStorage.setItem(
      "cliHistory",
      JSON.stringify(["status", "help", "whoami"]),
    );
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "{arrowup}{arrowup}{arrowup}");
    expect(input).toHaveValue("status");
    await userEvent.type(input, "{arrowdown}{arrowdown}");
    expect(input).toHaveValue("whoami");
  });

  it("can navigate forward to the empty state", async () => {
    localStorage.setItem(
      "cliHistory",
      JSON.stringify(["status", "help", "whoami"]),
    );
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "{arrowup}{arrowup}");
    expect(input).toHaveValue("help");
    await userEvent.type(input, "{arrowdown}{arrowdown}");
    expect(input).toHaveValue("");
  });

  it("prevents navigating past the last history item", async () => {
    localStorage.setItem(
      "cliHistory",
      JSON.stringify(["status", "help", "whoami"]),
    );
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "{arrowup}{arrowup}{arrowup}{arrowup}");
    expect(input).toHaveValue("status");
  });

  it("limits the number of items in the history", async () => {
    const items = [...Array(MAX_HISTORY).keys()].map((_, i) => `command-${i}`);
    localStorage.setItem("cliHistory", JSON.stringify(items));
    // ..until it receives a 'done' message.
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    let history = JSON.parse(localStorage.getItem("cliHistory") ?? "");
    expect(history).toHaveLength(MAX_HISTORY);
    expect(history[0]).toBe("command-0");
    await userEvent.type(input, "status{enter}");
    history = JSON.parse(localStorage.getItem("cliHistory") ?? "");
    expect(history).toHaveLength(MAX_HISTORY);
    // The first item should be now be the old second item.
    expect(history[0]).toBe("command-1");
  });

  it("supports macaroon based authentication", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "ws://localhost:1234/api",
        }),
        controllerConnections: {
          "wss://localhost:1234/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
    });
    bakerySpy.mockImplementation((key) => {
      const macaroons: Record<string, string> = {
        "wss://localhost:1234": "WyJtYWMiLCAiYXJvb24iXQo=",
      };
      return macaroons[key];
    });

    renderComponent(<WebCLI {...props} credentials={null} />, { state });
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "      status       {enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        macaroons: [["mac", "aroon"]],
        commands: ["status"],
      }),
    );
  });

  it("displays messages received over the websocket", async () => {
    // ..until it receives a 'done' message.
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );

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
      server.send(JSON.stringify(message));
    });

    const code = await screen.findByTestId(TestId.CODE);
    expect(code?.textContent).toMatchSnapshot();
    // Wait for the setTimeout that buffers the message updates in connection.js.
    await waitFor(() => {
      expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
        "style",
        "height: 300px;",
      );
    });
  });

  it("displays ansi colored content colored", async () => {
    // ..until it receives a 'done' message.
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );

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
      server.send(JSON.stringify(message));
    });

    const code = await screen.findByTestId(TestId.CODE);
    expect(code?.textContent).toMatchSnapshot();
    // Wait for the setTimeout that buffers the message updates in connection.js.
    await waitFor(() => {
      expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
        "style",
        "height: 300px;",
      );
    });
  });

  it("can be resized with a mouse", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    expect(await screen.findByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      "height: 1px;",
    );
    const handle = document.querySelector(".webcli__output-handle");
    expect(handle).toBeTruthy();
    if (handle) {
      fireEvent.mouseDown(handle);
      fireEvent.mouseMove(handle, {
        clientY: 100,
      });
    }
    expect(await screen.findByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      "height: 628px;",
    );
  });

  it("can be resized on mobile", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    expect(await screen.findByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      "height: 1px;",
    );
    const handle = document.querySelector(".webcli__output-handle");
    expect(handle).toBeTruthy();
    if (handle) {
      fireEvent.touchStart(handle);
      fireEvent.touchMove(handle, {
        touches: [
          {
            clientY: 100,
          },
        ],
      });
    }
    expect(await screen.findByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      "height: 628px;",
    );
  });

  it("should display connection error when no websocket address is present", () => {
    renderComponent(<WebCLI {...props} modelUUID="" />);
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${WebCLILabel.CONNECTION_ERROR}`);
  });

  it("should display authentication error when no credentials and macaroons are available", async () => {
    bakerySpy.mockImplementation(() => null);

    renderComponent(<WebCLI {...props} credentials={null} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({ commands: ["status"] }),
    );
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${WebCLILabel.AUTHENTICATION_ERROR}`);
  });

  it("should display error when JSON can't be parsed", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );
    server.send("[1, 2, 3, 4}");
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${ConnectionLabel.INCORRECT_DATA_ERROR}`);
  });

  it("should display error when received message is falsy", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );
    server.send(JSON.stringify(null));
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${ConnectionLabel.INCORRECT_DATA_ERROR}`);
  });

  it("should display error when received message is not an object", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );
    server.send(JSON.stringify("not an object"));
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${ConnectionLabel.INCORRECT_DATA_ERROR}`);
  });

  it("should display error when connecting to sub controller of JAAS", async () => {
    const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );
    server.send(JSON.stringify({ "redirect-to": "jaas-sub-controller" }));
    // Check that previous websocket was disconnected.
    expect(clearTimeoutSpy).toHaveBeenCalled();
    WS.clean();
    server = new WS("url-for-jaas-sub-controller");
    server.error();
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${ConnectionLabel.JAAS_CONNECTION_ERROR}`);
  });

  it("should display error when received message output is not an array", async () => {
    renderComponent(<WebCLI {...props} />);
    await server.connected;
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "status --color{enter}");
    await expect(server).toReceiveMessage(
      JSON.stringify({
        user: "eggman@external",
        credentials: "somelongpassword",
        commands: ["status --color"],
      }),
    );
    server.send(
      JSON.stringify({
        output: "not-an-array",
      }),
    );
    WS.clean();
    server = new WS("url-for-jaas-sub-controller");
    server.error();
    expect(
      document.querySelector(".webcli__output-content code"),
    ).toHaveTextContent(`ERROR: ${ConnectionLabel.INCORRECT_DATA_ERROR}`);
  });
});
