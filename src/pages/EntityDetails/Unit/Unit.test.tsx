import { screen } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import { InfoPanelTestId } from "components/InfoPanel";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  applicationStatusFactory,
  machineStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Unit from "./Unit";
import { Label } from "./types";

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = (): JSX.Element => <div className="webcli"></div>;
  return { default: WebCLI };
});

describe("Unit", () => {
  let state: RootState;
  const path = urls.model.unit(null);
  const url = urls.model.unit({
    appName: "etcd",
    modelName: "canonical-kubernetes",
    unitId: "etcd-0",
    qualifier: "eggman@external",
  });

  beforeEach(() => {
    state = rootStateFactory.build({
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
    renderComponent(<Unit />, { path, url, state });
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });
  it("displays the apps table", async () => {
    renderComponent(<Unit />, { path, url, state });
    expect(document.querySelector(".entity-details__apps")).toBeInTheDocument();
  });

  it("can display the machines table", async () => {
    renderComponent(<Unit />, { path, url, state });
    expect(
      document.querySelector(".entity-details__machines"),
    ).toBeInTheDocument();
  });

  it("does not display the machines table for k8s", async () => {
    if (state.juju.modelData?.abc123.model) {
      state.juju.modelData.abc123.info = modelInfoFactory.build({
        "provider-type": "kubernetes",
      });
    }
    renderComponent(<Unit />, { path, url, state });
    expect(
      document.querySelector(".entity-details__machines"),
    ).not.toBeInTheDocument();
  });

  it("handles invalid unit", async () => {
    renderComponent(<Unit />, {
      path: urls.model.unit(null),
      url: urls.model.unit({
        appName: "etcd",
        modelName: "canonical-kubernetes",
        unitId: "0",
        qualifier: "eggman@external",
      }),
    });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: Label.VIEW_ALL_UNITS }),
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        appName: "etcd",
        modelName: "canonical-kubernetes",
        qualifier: "eggman@external",
      }),
    );
  });
});
