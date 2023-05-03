import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { TestId as InfoPanelTestId } from "components/InfoPanel/InfoPanel";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  modelWatcherModelDataFactory,
  applicationInfoFactory,
  unitChangeDeltaFactory,
  machineChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { modelWatcherModelInfoFactory } from "testing/factories/juju/model-watcher";
import urls from "urls";

import Unit from "./Unit";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

describe("Unit", () => {
  let state: RootState;

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

  function generateComponent() {
    const store = mockStore(state);
    window.history.pushState(
      {},
      "",
      urls.model.unit({
        appName: "etcd",
        modelName: "canonical-kubernetes",
        unitId: "etcd-0",
        userName: "eggman@external",
      })
    );
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={urls.model.unit(null)} element={<Unit />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  }

  it("renders the info panel", async () => {
    generateComponent();
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });
  it("displays the apps table", async () => {
    generateComponent();
    expect(document.querySelector(".entity-details__apps")).toBeInTheDocument();
  });

  it("can display the machines table", async () => {
    generateComponent();
    expect(
      document.querySelector(".entity-details__machines")
    ).toBeInTheDocument();
  });

  it("does not display the machines table for k8s", async () => {
    if (state.juju.modelWatcherData?.abc123.model) {
      state.juju.modelWatcherData.abc123.model =
        modelWatcherModelInfoFactory.build({
          type: "kubernetes",
        });
    }
    generateComponent();
    expect(
      document.querySelector(".entity-details__machines")
    ).not.toBeInTheDocument();
  });
});
