import { screen } from "@testing-library/react";
import { vi } from "vitest";

import * as WebCLIModule from "components/WebCLI";
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

import JujuCLI from "./JujuCLI";

vi.mock("components/WebCLI", () => ({
  __esModule: true,
  default: () => {
    return <div className="webcli" data-testid="webcli"></div>;
  },
}));

describe("JujuCLI", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/kirk@external/enterprise";

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
        credentials: {
          "wss://example.com:17070/api": credentialFactory.build({
            user: "user-kirk@external",
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
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            model: modelWatcherModelInfoFactory.build({
              "controller-uuid": "controller123",
            }),
          }),
        },
      }),
    });
  });

  it("shows the CLI in juju 2.9", async () => {
    state.general.config = configFactory.build({
      isJuju: true,
    });
    renderComponent(<JujuCLI />, { path, url, state });
    expect(await screen.findByTestId("webcli")).toBeInTheDocument();
  });

  it("shows the CLI in juju higher than 2.9", async () => {
    state.general.config = configFactory.build({
      isJuju: true,
    });
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: "enterprise",
          owner: "kirk@external",
          version: "3.0.7",
          "controller-uuid": "controller123",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(await screen.findByTestId("webcli")).toBeInTheDocument();
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
          name: "enterprise",
          owner: "kirk@external",
          version: "3.0.7",
          "controller-uuid": "controller123",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });

  it("does not show the webCLI in juju 2.8", async () => {
    state.general.config = configFactory.build({
      isJuju: true,
    });
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
        model: modelWatcherModelInfoFactory.build({
          name: "enterprise",
          owner: "kirk@external",
          version: "2.8.7",
        }),
      }),
    };
    renderComponent(<JujuCLI />, { path, url, state });
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });

  it("passes the controller details to the webCLI", () => {
    state.general.config = configFactory.build({
      isJuju: true,
    });
    const cliComponent = vi
      .spyOn(WebCLIModule, "default")
      .mockImplementation(vi.fn());
    renderComponent(<JujuCLI />, { path, url, state });
    expect(cliComponent.mock.calls[0][0]).toMatchObject({
      controllerWSHost: "example.com:17070",
      credentials: {
        password: "verysecure123",
        user: "user-kirk@external",
      },
      modelUUID: "abc123",
      protocol: "wss",
    });
    cliComponent.mockReset();
  });
});
