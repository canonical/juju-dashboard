import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { InfoPanelTestId } from "components/InfoPanel";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Unit from "./Unit";
import { Label } from "./types";

vi.mock("components/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return { default: WebCLI };
});

describe("Unit", () => {
  let state: RootState;
  const path = urls.model.unit(null);
  const url = urls.model.unit({
    appName: "etcd",
    modelName: "canonical-kubernetes",
    unitId: "etcd-0",
    userName: "eggman@external",
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
    if (state.juju.modelWatcherData?.abc123.model) {
      state.juju.modelWatcherData.abc123.model =
        modelWatcherModelInfoFactory.build({
          type: "kubernetes",
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
        userName: "eggman@external",
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
        userName: "eggman@external",
      }),
    );
  });
});
