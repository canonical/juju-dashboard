import { screen } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import { InfoPanelTestId } from "components/InfoPanel";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Machine from "./Machine";

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = (): JSX.Element => (
    <div className="webcli" data-testid="webcli"></div>
  );
  return { default: WebCLI };
});

describe("Machine", () => {
  let state: RootState;
  const path = urls.model.machine(null);
  const url = urls.model.machine({
    machineId: "0",
    modelName: "canonical-kubernetes",
    userName: "eggman@external",
  });

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        credentials: {
          "wss://jimm.jujucharms.com/api": credentialFactory.build(),
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            name: "canonical-kubernetes",
            uuid: "abc123",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              etcd: applicationInfoFactory.build(),
            },
            machines: {
              "0": machineChangeDeltaFactory.build({ id: "0" }),
            },
            units: {
              "etcd/0": unitChangeDeltaFactory.build({
                application: "etcd",
                name: "etcd/0",
                "charm-url": "cs:etcd-50",
              }),
            },
          }),
        },
      }),
    });
  });

  it("renders the info panel", async () => {
    renderComponent(<Machine />, { path, url, state });
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });
  it("displays the units table", async () => {
    renderComponent(<Machine />, { path, url, state });
    expect(
      document.querySelector(".entity-details__units"),
    ).toBeInTheDocument();
  });

  it("displays the apps table", async () => {
    renderComponent(<Machine />, { path, url, state });
    expect(document.querySelector(".entity-details__apps")).toBeInTheDocument();
  });
});
