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

      const spans = result.baseElement.getElementsByTagName("span");
      expect(spans).toHaveLength(1);
      expect(spans[0]).toHaveClass("show-status");

      if (connected) {
        expect(spans[0]).toHaveClass("positive");
      } else {
        expect(spans[0]).not.toHaveClass("positive");
      }

      expect(spans[0]).toHaveTextContent(connectionStr);
    },
  );
});

describe("Widget", () => {
  it("renders connected", ({ expect }) => {
    const { result } = renderComponent(<Widget />, { state: connectedState() });

    expect(result.container.children).toHaveLength(2);
    const grid = result.container.children[1];
    expect(grid.children).toHaveLength(4);

    const expectedItems = [
      ["Controller URL", "wss://jimm.jujucharms.com/api"],
      ["Server version", "1.2.3"],
      ["Controller access", "read"],
      ["Identity", "user-eggman@external"],
    ].map(([label, value], i) => [i, label, value] as const);

    for (const [i, label, value] of expectedItems) {
      const item = grid.children.item(i)!;

      const labelEl = item.children.item(0);
      const valueEl = item.children.item(1);

      expect(labelEl).toHaveTextContent(label);
      expect(valueEl).toHaveTextContent(value);
    }
  });

  it("renders disconnected", ({ expect }) => {
    const { result } = renderComponent(<Widget />, {
      state: disconnectedState(),
    });

    expect(result.container.children).toHaveLength(3);
    const hint = result.container.children[1];
    const grid = result.container.children[2];

    expect(hint).toHaveTextContent("Unable to connect to controller");

    expect(grid.children).toHaveLength(1);

    const expectedItems = [
      ["Controller URL", "wss://jimm.jujucharms.com/api"],
    ].map(([label, value], i) => [i, label, value] as const);

    for (const [i, label, value] of expectedItems) {
      const item = grid.children.item(i)!;

      const labelEl = item.children.item(0);
      const valueEl = item.children.item(1);

      expect(labelEl).toHaveTextContent(label);
      expect(valueEl).toHaveTextContent(value);
    }
  });

  it("renders no controller API endpoint", ({ expect }) => {
    const state = disconnectedState();
    delete (state.general.config as Partial<Config>).controllerAPIEndpoint;
    const { result } = renderComponent(<Widget />, {
      state,
    });

    expect(result.container.children).toHaveLength(3);
    const hint = result.container.children[1];
    const grid = result.container.children[2];

    expect(hint).toHaveTextContent("No controller URL is detected.");

    expect(grid.children).toHaveLength(0);
  });
});
