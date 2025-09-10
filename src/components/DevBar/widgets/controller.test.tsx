import type { Config } from "store/general/types";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { renderComponent } from "testing/utils";

import controller from "./controller";

const { Title, Widget } = controller;

function connectedState() {
  return rootStateFactory.build({
    general: generalStateFactory.build({
      config: configFactory.build({
        isJuju: true,
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
      controllerConnections: {
        "wss://jimm.jujucharms.com/api": {
          controllerTag: "controller",
          serverVersion: "1.2.3",
          user: {
            "display-name": "eggman",
            identity: "user-eggman@external",
            "controller-access": "read",
            "model-access": "write",
          },
        },
      },
    }),
  });
}

function disconnectedState() {
  return rootStateFactory.build({
    general: generalStateFactory.build({
      config: configFactory.build({
        isJuju: true,
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
      controllerConnections: {},
    }),
  });
}

describe("Title", () => {
  it.for([
    ["Connected", true, connectedState()],
    ["Disconnected", false, disconnectedState()],
  ] as const)(
    "%s controller",
    ([connectionStr, connected, state], { expect }) => {
      const { result } = renderComponent(<Title />, { state });

      expect(result.baseElement).toHaveTextContent("Controller");

      const status = result.getByText(connectionStr);
      expect(status).toHaveClass("show-status");

      if (connected) {
        expect(status).toHaveClass("positive");
      } else {
        expect(status).not.toHaveClass("positive");
      }
    },
  );
});

describe("Widget", () => {
  it("renders connected", ({ expect }) => {
    const { result } = renderComponent(<Widget />, { state: connectedState() });

    expect(result.container.children).toHaveLength(2);
    const [, grid] = result.container.children;
    expect(grid.children).toHaveLength(4);

    const expectedItems = [
      ["Controller URL", "wss://jimm.jujucharms.com/api"],
      ["Server version", "1.2.3"],
      ["Controller access", "read"],
      ["Identity", "user-eggman@external"],
    ].map(([label, value], i) => [i, label, value] as const);

    for (const [i, label, value] of expectedItems) {
      const item = grid.children[i];
      expect(item.children[0]).toHaveTextContent(label);
      expect(item.children[1]).toHaveTextContent(value);
    }
  });

  it("renders disconnected", ({ expect }) => {
    const { result } = renderComponent(<Widget />, {
      state: disconnectedState(),
    });

    expect(result.container.children).toHaveLength(3);
    const [, hint, grid] = result.container.children;

    expect(hint).toHaveTextContent("Unable to connect to controller");

    expect(grid.children).toHaveLength(1);

    const expectedItems = [
      ["Controller URL", "wss://jimm.jujucharms.com/api"],
    ].map(([label, value], i) => [i, label, value] as const);

    for (const [i, label, value] of expectedItems) {
      const item = grid.children[i];
      expect(item.children[0]).toHaveTextContent(label);
      expect(item.children[1]).toHaveTextContent(value);
    }
  });

  it("renders no controller API endpoint", ({ expect }) => {
    const state = disconnectedState();
    delete (state.general.config as Partial<Config>).controllerAPIEndpoint;
    const { result } = renderComponent(<Widget />, {
      state,
    });

    expect(result.container.children).toHaveLength(3);
    const [, hint, grid] = result.container.children;

    expect(hint).toHaveTextContent("No controller URL is detected.");

    expect(grid.children).toHaveLength(0);
  });
});
