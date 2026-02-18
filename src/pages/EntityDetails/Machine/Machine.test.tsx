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
import {
  applicationStatusFactory,
  machineStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV7";
import {
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Machine from "./Machine";

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = (): JSX.Element => <div className="webcli"></div>;
  return { default: WebCLI };
});

describe("Machine", () => {
  let state: RootState;
  const path = urls.model.machine(null);
  const url = urls.model.machine({
    machineId: "0",
    modelName: "canonical-kubernetes",
    qualifier: "eggman@external",
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
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              etcd: applicationStatusFactory.build({
                units: {
                  "etcd/0": unitStatusFactory.build({
                    charm: "cs:etcd-50",
                  }),
                },
              }),
            },
            machines: {
              "0": machineStatusFactory.build({ id: "0" }),
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
