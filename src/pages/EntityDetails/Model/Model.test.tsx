import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dataDump from "testing/complete-redux-store-dump";

import { rootStateFactory } from "testing/factories";
import { ModelData } from "juju/types";
import { RootState } from "store/store";

import Model, { Label } from "./Model";
import { TestId } from "../../../components/InfoPanel/InfoPanel";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

jest.mock("juju", () => {
  return {
    queryOperationsList: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/list-operations-api-response.json");
        resolve(apiData.response);
      });
    },
    queryActionsList: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/list-actions-api-response.json");
        resolve(apiData.response);
      });
    },
  };
});

const mockStore = configureStore([]);

describe("Model", () => {
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build(
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
    );
    storeData.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": {
        user: { identity: "user-eggman@external" },
      },
    };
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
    const model = Object.values(storeData.juju.modelWatcherData).find(
      (model) => model.model.name === "local-test"
    );
    if (model && "applications" in model) {
      model.applications = {
        cockroachdb: {
          "charm-url": "local:cockroachdb-55",
          constraints: {},
          exposed: false,
          life: "alive",
          "min-units": 0,
          "model-uuid": "abc123",
          name: "cockroachdb",
          "owner-tag": "",
          status: { current: "unset", message: "", version: "" },
          subordinate: false,
          "unit-count": 1,
          "workload-version": "12.2.13",
        },
      };
    }
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
    const model = Object.values(storeData.juju.modelWatcherData).find(
      (model) => model.model.name === "hadoopspark"
    );
    if (model && "applications" in model) {
      model.applications = {
        client: {
          "charm-url": "cs:client-55",
          constraints: {},
          exposed: false,
          life: "alive",
          "min-units": 0,
          "model-uuid": "abc123",
          name: "client",
          "owner-tag": "",
          status: { current: "unset", message: "", version: "" },
          subordinate: false,
          "unit-count": 1,
          "workload-version": "12.2.13",
        },
      };
    }
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
    const model: Partial<ModelData> | undefined = Object.values(
      storeData.juju.modelWatcherData
    ).find((model) => model.model.name === "test1");
    delete model?.relations;
    delete model?.applications;
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
    const model: Partial<ModelData> | undefined = Object.values(
      storeData.juju.modelWatcherData
    ).find((model) => model.model.name === "test1");
    delete model?.machines;
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
    const model = Object.values(storeData.juju.modelWatcherData).find(
      (model) => model.model.name === "hadoopspark"
    );
    if (model && "units" in model) {
      for (let index = 0; index < 9; index++) {
        model.units[index] = {
          "agent-status": {
            current: "idle",
            message: "",
            since: "2021-08-13T19:34:41.247417373Z",
            version: "2.8.7",
          },
          "charm-url": "cs:ceph-mon-55",
          "machine-id": "0",
          "model-uuid": "abc123",
          "port-ranges": null,
          "private-address": "172.31.43.84",
          "public-address": "54.162.156.160",
          "workload-status": {
            current: "blocked",
            message: "Insufficient peer units to bootstrap cluster (require 3)",
            since: "2021-08-13T19:34:37.747827227Z",
            version: "",
          },
          application: `ceph-mon-${index}`,
          life: "alive",
          name: `ceph-mon-${index}/0`,
          ports: [],
          principal: "",
          series: "bionic",
          subordinate: false,
        };
      }
    }
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
    const model = Object.values(storeData.juju.modelWatcherData).find(
      (model) => model.model.name === "hadoopspark"
    );
    const counts = [1, 2, 4];
    let unitIndex = 0;
    if (model && "units" in model) {
      for (let machineIndex = 0; machineIndex < 9; machineIndex++) {
        model.machines[machineIndex] = {
          addresses: [],
          "agent-status": {
            current: "started",
            message: "",
            since: "2021-08-13T19:32:59.800842177Z",
            version: "2.8.7",
          },
          "container-type": "",
          "has-vote": false,
          id: machineIndex.toString(),
          "instance-id": "i-0a195974d9fdd9d16",
          "instance-status": {
            current: "running",
            message: "running",
            since: "2021-08-13T19:31:34.099184348Z",
            version: "",
          },
          jobs: ["JobHostUnits"],
          life: "alive",
          "model-uuid": "abc123",
          series: "bionic",
          "supported-containers": ["lxd"],
          "supported-containers-known": true,
          "wants-vote": false,
        };

        for (
          let machineUnitIndex = 0;
          machineUnitIndex < counts[machineIndex];
          machineUnitIndex++
        ) {
          model.units[unitIndex] = {
            "agent-status": {
              current: "idle",
              message: "",
              since: "2021-08-13T19:34:41.247417373Z",
              version: "2.8.7",
            },
            "charm-url": "cs:ceph-mon-55",
            "machine-id": machineIndex.toString(),
            "model-uuid": "abc123",
            "port-ranges": null,
            "private-address": "172.31.43.84",
            "public-address": "54.162.156.160",
            "workload-status": {
              current: "blocked",
              message:
                "Insufficient peer units to bootstrap cluster (require 3)",
              since: "2021-08-13T19:34:37.747827227Z",
              version: "",
            },
            application: `ceph-mon-${unitIndex}`,
            life: "alive",
            name: `ceph-mon-${unitIndex}/0`,
            ports: [],
            principal: "",
            series: "bionic",
            subordinate: false,
          };
          unitIndex++;
        }
      }
    }
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
