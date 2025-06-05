import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WS } from "jest-websocket-mock";
import { vi } from "vitest";

import * as WebCLIModule from "components/WebCLI";
import { WebCLILabel, WebCLITestId } from "components/WebCLI";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { controllerFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";
import urls, { externalURLs } from "urls";

import { OutputTestId } from "../WebCLI/Output";

import JujuCLI from "./JujuCLI";

describe("JujuCLI", () => {
  let state: RootState;
  const modelName = "test-model";
  const userName = "eggman@external";
  const userTag = `user-${userName}`;
  const path = urls.model.index(null);
  const url = urls.model.index({ userName, modelName });
  let server: WS;

  beforeEach(() => {
    server = new WS("wss://example.com:17070/model/abc123/commands");
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
          isJuju: true,
        }),
        credentials: {
          "wss://example.com:17070/api": credentialFactory.build({
            user: userTag,
          }),
        },
      }),
      juju: jujuStateFactory.build({
        controllers: {
          "wss://example.com:17070/api": [
            controllerFactory.build({ uuid: "controller123" }),
          ],
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: modelName,
            ownerTag: userTag,
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            model: modelWatcherModelInfoFactory.build({
              "controller-uuid": "controller123",
              name: modelName,
              owner: userName,
            }),
          }),
        },
      }),
    });
  });

  afterEach(() => {
    WS.clean();
  });

  it("shows the CLI in juju 2.9", async () => {
    renderComponent(<JujuCLI />, { path, url, state });
    expect(
      await screen.findByTestId(WebCLITestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("shows the CLI in juju higher than 2.9", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: modelName,
          owner: userName,
          version: "3.0.7",
          "controller-uuid": "controller123",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(
      await screen.findByTestId(WebCLITestId.COMPONENT),
    ).toBeInTheDocument();
  });

  it("does not show the CLI in JAAS", async () => {
    state.general.config = configFactory.build({
      isJuju: false,
    });
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: modelName,
          owner: userName,
          version: "3.0.7",
          "controller-uuid": "controller123",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });

  it("does not show the webCLI in juju 2.8", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: modelName,
          owner: userName,
          version: "2.8.7",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });

  it("passes the controller details to the webCLI", () => {
    const cliComponent = vi
      .spyOn(WebCLIModule, "default")
      .mockImplementation(vi.fn());
    renderComponent(<JujuCLI />, { path, url, state });
    expect(cliComponent.mock.calls[0][0]).toMatchObject({
      controllerWSHost: "example.com:17070",
      credentials: {
        password: "verysecure123",
        user: userTag,
      },
      modelUUID: "abc123",
      protocol: "wss",
    });
    cliComponent.mockReset();
  });

  it("adds links to the help command", async () => {
    renderComponent(<JujuCLI />, { path, url, state });
    await server.connected;
    const input = screen.getByRole("textbox", {
      name: WebCLILabel.COMMAND,
    });
    await userEvent.type(input, "help{enter}");
    const messages = [
      "See https://juju.is for getting started tutorials and additional documentation.",
      "",
      "Starter commands:",
      "",
      "    bootstrap           Initializes a cloud environment.",
      "    add-model           Adds a workload model.",
      "",
      "Interactive mode:",
      "",
      "When run without arguments, Juju will enter an interactive shell which can be",
    ];
    messages.forEach((message) => {
      server.send(JSON.stringify({ output: [message] }));
    });
    server.send(JSON.stringify({ done: true }));
    const output = screen.getByTestId(OutputTestId.CONTENT);
    await waitFor(() => {
      expect(
        within(output).getByRole("link", { name: "bootstrap" }),
      ).toHaveAttribute("href", externalURLs.cliHelpCommand("bootstrap"));
      expect(
        within(output).getByRole("link", { name: "add-model" }),
      ).toHaveAttribute("href", externalURLs.cliHelpCommand("add-model"));
    });
  });
});
