import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WS } from "jest-websocket-mock";
import { vi } from "vitest";

import * as WebCLIModule from "components/WebCLI";
import { WebCLILabel, WebCLITestId } from "components/WebCLI";
import * as useAnalyticsHook from "hooks/useAnalytics";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
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
  const useAnalyticsMock = vi.fn();
  const modelName = "test-model";
  const userName = "eggman@external";
  const userTag = `user-${userName}`;
  const path = urls.model.index(null);
  const url = urls.model.index({ userName, modelName });
  let server: WS;

  beforeEach(() => {
    vi.spyOn(useAnalyticsHook, "default").mockReturnValue(useAnalyticsMock);
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
        controllerConnections: {
          "wss://example.com:17070/api": {
            user: authUserInfoFactory.build(),
          },
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
      credentials: {
        password: "verysecure123",
        user: userTag,
      },
      modelUUID: "abc123",
      protocol: "wss",
      activeUser: userTag,
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

  it("sends usage analytics when a command is successfully sent", async () => {
    renderComponent(<JujuCLI />, { path, url, state });
    await server.connected;
    const input = screen.getByRole("textbox", {
      name: WebCLILabel.COMMAND,
    });
    await userEvent.type(input, "some-command{enter}");
    expect(useAnalyticsMock).toBeCalledWith({
      category: "User",
      action: "WebCLI command sent",
    });
  });

  it("adds links to the status command", async () => {
    renderComponent(<JujuCLI />, { path, url, state });
    await server.connected;
    const input = screen.getByRole("textbox", {
      name: WebCLILabel.COMMAND,
    });
    await userEvent.type(input, "status{enter}");
    const messages = [
      "Model         Controller           Cloud/Region         Version    SLA          Timestamp",
      "test-model    localhost-localhost  localhost/localhost  3.2-beta3  unsupported  01:17:46Z",
      "",
      "App       Version  Status   Scale  Charm     Channel  Rev  Exposed  Message",
      "slurmdbd  0.8.5    blocked      1  slurmdbd  stable    18  no       Need relations: slurcmtld",
      "",
      "Unit         Workload  Agent  Machine  Public address  Ports  Message",
      "slurmdbd/0*  blocked   idle   0        10.153.59.132          Need relations: slurcmtld",
      "",
      "Machine  State    Address        Inst id        Base          AZ  Message",
      "0        started  10.153.59.132  juju-75ed27-0  ubuntu@20.04      Running",
    ];
    messages.forEach((message) => {
      server.send(JSON.stringify({ output: [message] }));
    });
    server.send(JSON.stringify({ done: true }));
    const output = screen.getByTestId(OutputTestId.CONTENT);
    await waitFor(() => {
      expect(
        within(output).getByRole("link", { name: "test-model" }),
      ).toHaveAttribute("href", "/models/eggman@external/test-model");
      expect(
        within(output).getByRole("link", { name: "slurmdbd" }),
      ).toHaveAttribute(
        "href",
        "/models/eggman@external/test-model/app/slurmdbd",
      );
      expect(
        within(output).getByRole("link", { name: "localhost-localhost" }),
      ).toHaveAttribute("href", "/controllers");
      expect(
        within(output).getByRole("link", { name: "slurmdbd/0*" }),
      ).toHaveAttribute(
        "href",
        "/models/eggman@external/test-model/app/slurmdbd/unit/slurmdbd-0",
      );
      // There should be two machine links.
      const machines = within(output).getAllByRole("link", { name: "0" });
      expect(machines).toHaveLength(2);
      expect(machines[0]).toHaveAttribute(
        "href",
        "/models/eggman@external/test-model/machine/0",
      );
      expect(machines[1]).toHaveAttribute(
        "href",
        "/models/eggman@external/test-model/machine/0",
      );
      // There should be two address links.
      const addresses = within(output).getAllByRole("link", {
        name: "10.153.59.132",
      });
      expect(addresses).toHaveLength(2);
      expect(addresses[0]).toHaveAttribute("href", "http://10.153.59.132");
      expect(addresses[1]).toHaveAttribute("href", "http://10.153.59.132");
    });
  });
});
