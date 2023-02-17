import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dataDump from "testing/complete-redux-store-dump";

import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  operationResultsFactory,
  actionResultsFactory,
} from "testing/factories/juju/ActionV7";
import { RootState } from "store/store";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
  relationChangeDeltaFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";

import Model, { Label } from "./Model";
import { TestId } from "../../../components/InfoPanel/InfoPanel";

const mockOperationResults = operationResultsFactory.build();
const mockActionResults = actionResultsFactory.build();

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

jest.mock("juju/api", () => {
  return {
    queryOperationsList: () => {
      return new Promise((resolve) => {
        resolve(mockOperationResults);
      });
    },
    queryActionsList: () => {
      return new Promise((resolve) => {
        resolve(mockActionResults);
      });
    },
  };
});

const mockStore = configureStore([]);

describe("Model", () => {
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
        credentials: {
          "wss://jimm.jujucharms.com/api": credentialFactory.build(),
        },
      }),
      juju: jujuStateFactory.build(
        {},
        {
          transient: {
            models: Object.values(dataDump.juju.modelData).map((model) => ({
              name: model.info.name,
              owner: model.info["owner-tag"].replace("user-", ""),
              uuid: model.uuid,
            })),
          },
        }
      ),
    });
    storeData.juju.modelData = dataDump.juju.modelData;
  });

  it("renders the info panel data", () => {
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/test1"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId(TestId.INFO_PANEL)).toBeInTheDocument();
  });

  it("renders the main table", () => {
    storeData.juju.modelWatcherData = {
      "2446d278-7928-4c50-811b-563efaked991":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/test1"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      document.querySelector(".entity-details__main table")
    ).toBeInTheDocument();
  });

  it("view toggles hide and show tables", async () => {
    storeData.juju.modelWatcherData = {
      "2f995dee-392e-4459-8eb9-839c5fake0af":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
          machines: {
            "0": machineChangeDeltaFactory.build(),
          },
          relations: {
            "wordpress:db mysql:db": relationChangeDeltaFactory.build(),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    Element.prototype.scrollIntoView = jest.fn();

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps")
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("tab-link-Machines"));
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines"
      )
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("tab-link-Integrations"));
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__relations"
      )
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("tab-link-Applications"));
    expect(
      document.querySelector(".entity-details__main > .entity-details__apps")
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("tab-link-Action Logs"));
    expect(
      document.querySelector(".entity-details__action-logs")
    ).toBeInTheDocument();
  });

  it("renders the details pane for models shared-with-me", () => {
    storeData.juju.modelWatcherData = {
      "2f995dee-392e-4459-8eb9-839c5fake0af":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      document.querySelector(".entity-details__main table")
    ).toBeInTheDocument(); // does this target correct table?
  });

  it("renders the machine details section", () => {
    storeData.juju.modelWatcherData = {
      "7ffe956a-06ac-4ae9-8aac-04ebafakeda5":
        modelWatcherModelDataFactory.build({
          machines: {
            "0": machineChangeDeltaFactory.build(),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/mymodel?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(document.querySelector(".entity-details__main table")).toHaveClass(
      "entity-details__machines"
    );
  });

  it("supports local charms", () => {
    storeData.juju.modelWatcherData = {
      "c2d8a696-e2eb-4021-8ab0-12220fake62a":
        modelWatcherModelDataFactory.build({
          applications: {
            cockroachdb: applicationInfoFactory.build({
              "charm-url": "local:cockroachdb-55",
            }),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        cockroachdb
        <MemoryRouter initialEntries={["/models/eggman@external/local-test"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      document.querySelector(".entity-details__apps tr[data-app='cockroachdb']")
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__apps tr[data-app='cockroachdb'] td[data-test-column='store']"
      )?.textContent
    ).toBe("Local");
  });

  it("displays the correct scale value", () => {
    storeData.juju.modelWatcherData = {
      "2f995dee-392e-4459-8eb9-839c5fake0af":
        modelWatcherModelDataFactory.build({
          applications: {
            client: applicationInfoFactory.build({
              "unit-count": 1,
            }),
          },
        }),
    };
    const store = mockStore(storeData);
    const testApp = "client";
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/pizza@external/hadoopspark"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const applicationRow = document.querySelector(`tr[data-app="${testApp}"]`);
    expect(
      applicationRow?.querySelector("td[data-test-column='scale']")?.textContent
    ).toBe("1");
  });

  it("should show a message if a model has no integrations", () => {
    storeData.juju.modelWatcherData = {
      "2446d278-7928-4c50-811b-563efaked991":
        modelWatcherModelDataFactory.build(),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/eggman@external/test1?activeView=integrations",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    const noRelationsMsg = document.querySelector(
      "[data-testid='no-integrations-msg']"
    );
    expect(noRelationsMsg).toBeInTheDocument();
  });

  it("should show a message if a model has no machines", () => {
    storeData.juju.modelWatcherData = {
      "2446d278-7928-4c50-811b-563efaked991":
        modelWatcherModelDataFactory.build(),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/eggman@external/test1?activeView=machines"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    const noMachinesMsg = document.querySelector(
      "[data-testid='no-machines-msg']"
    );
    expect(noMachinesMsg).toBeInTheDocument();
  });

  it("should show apps appropriate number of apps on machine in hadoopspark model", () => {
    storeData.juju.modelWatcherData = {
      "2f995dee-392e-4459-8eb9-839c5fake0af":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
          model: modelWatcherModelInfoFactory.build({ name: "hadoopspark" }),
          machines: {
            "0": machineChangeDeltaFactory.build(),
          },
          units: {
            "0": unitChangeDeltaFactory.build({ application: "ceph-mon-0" }),
            "1": unitChangeDeltaFactory.build({ application: "ceph-mon-1" }),
            "2": unitChangeDeltaFactory.build({ application: "ceph-mon-2" }),
            "3": unitChangeDeltaFactory.build({ application: "ceph-mon-3" }),
            "4": unitChangeDeltaFactory.build({ application: "ceph-mon-4" }),
            "5": unitChangeDeltaFactory.build({ application: "ceph-mon-5" }),
            "6": unitChangeDeltaFactory.build({ application: "ceph-mon-6" }),
            "7": unitChangeDeltaFactory.build({ application: "ceph-mon-7" }),
            "8": unitChangeDeltaFactory.build({ application: "ceph-mon-8" }),
            "9": unitChangeDeltaFactory.build({ application: "ceph-mon-9" }),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    const machineApps = document.querySelectorAll(".machine-app-icons img");
    expect(machineApps).toHaveLength(10);
  });

  it("should show apps appropriate number of apps on machine in canonical-kubernetes model", () => {
    storeData.juju.modelWatcherData = {
      "2f995dee-392e-4459-8eb9-839c5fake0af":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
          model: modelWatcherModelInfoFactory.build({ name: "hadoopspark" }),
          machines: {
            "0": machineChangeDeltaFactory.build({ id: "0" }),
            "1": machineChangeDeltaFactory.build({ id: "1" }),
          },
          units: {
            "0": unitChangeDeltaFactory.build({
              "machine-id": "0",
              application: "ceph-mon",
            }),
            "1": unitChangeDeltaFactory.build({
              "machine-id": "0",
              application: "ceph-mon-0",
            }),
            "2": unitChangeDeltaFactory.build({
              "machine-id": "1",
              application: "ceph-mon-1",
            }),
            "3": unitChangeDeltaFactory.build({
              "machine-id": "1",
              application: "ceph-mon-2",
            }),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    const machineAppIconRows = screen.getAllByRole("row");

    expect(
      within(machineAppIconRows[1]).getByAltText("ceph-mon icon")
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[1]).getByAltText("ceph-mon-0 icon")
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[2]).getByAltText("ceph-mon-1 icon")
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[2]).getByAltText("ceph-mon-2 icon")
    ).toBeInTheDocument();
  });

  it("renders the topology", () => {
    storeData.juju.modelWatcherData = {
      "57650e3c-815f-4540-89df-81fdfakeb7ef":
        modelWatcherModelDataFactory.build({
          applications: {
            "ceph-mon": applicationInfoFactory.build(),
          },
        }),
    };
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/group-test"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      document.querySelector(".info-panel__pictogram")
    ).toBeInTheDocument();
  });

  it("should have a link for model access panel", () => {
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/group-test"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route path="/models/:userName/:modelName" element={<Model />} />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      screen.getByRole("button", { name: Label.ACCESS_BUTTON })
    ).toBeInTheDocument();
  });
});
