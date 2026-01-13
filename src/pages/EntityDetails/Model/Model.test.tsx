import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { vi } from "vitest";

import { TestId as InfoPanelTestId } from "components/InfoPanel/types";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import { TestId as SecretsTestId } from "pages/EntityDetails/Model/Secrets/types";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import {
  actionResultsFactory,
  operationResultsFactory,
} from "testing/factories/juju/ActionV7";
import {
  applicationOfferStatusFactory,
  remoteApplicationStatusFactory,
} from "testing/factories/juju/ClientV6";
import {
  relationStatusFactory,
  machineStatusFactory,
} from "testing/factories/juju/ClientV7";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  auditEventsStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
  modelFeaturesStateFactory,
  modelFeaturesFactory,
  rebacAllowedFactory,
  rebacState,
  modelDataApplicationFactory,
  modelDataUnitFactory,
} from "testing/factories/juju/juju";
import {
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";

import Model from "./Model";
import { Label, TestId } from "./types";

const mockOperationResults = operationResultsFactory.build();
const mockActionResults = actionResultsFactory.build();

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = (): JSX.Element => <div className="webcli"></div>;
  return { default: WebCLI };
});

vi.mock("juju/api", () => {
  return {
    queryOperationsList: async (): Promise<unknown> => {
      return new Promise((resolve) => {
        resolve(mockOperationResults);
      });
    },
    queryActionsList: async (): Promise<unknown> => {
      return new Promise((resolve) => {
        resolve(mockActionResults);
      });
    },
    connectToModel: async (): Promise<unknown> => {
      return new Promise((resolve) => {
        resolve({});
      });
    },
  };
});

describe("Model", () => {
  let state: RootState;
  const url = "/models/eggman@external/test1";
  const path = "/models/:userName/:modelName";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
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
      juju: jujuStateFactory.build({
        auditEvents: auditEventsStateFactory.build({
          items: [auditEventFactory.build()],
        }),
        modelData: {
          abc123: modelDataFactory.build(),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build(),
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the info panel data", () => {
    renderComponent(<Model />, { state, url, path });
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });

  it("displays model access for Juju controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    }
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          users: [
            modelUserInfoFactory.build({
              user: "eggman@external",
              access: "read",
            }),
          ],
        }),
      }),
    };
    renderComponent(<Model />, { state, url, path });
    expect(screen.getByLabelText("access")).toHaveTextContent("read");
  });

  it("displays model access for JIMM controllers", () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.rebac = rebacState.build({
      allowed: [
        rebacAllowedFactory.build({
          tuple: {
            object: "user-eggman@external",
            relation: JIMMRelation.WRITER,
            target_object: "model-abc123",
          },
          loading: true,
          allowed: true,
        }),
      ],
    });
    renderComponent(<Model />, { state, url, path });
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
    expect(screen.getByLabelText("access")).toHaveTextContent("writer");
  });

  it("renders the main table", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, { state, url, path });
    expect(
      document.querySelector(".entity-details__main table"),
    ).toBeInTheDocument();
  });

  it("displays the apps table by default", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    renderComponent(<Model />, { state, url, path });

    Element.prototype.scrollIntoView = vi.fn();

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__integrations",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".entity-details__action-logs"),
    ).not.toBeInTheDocument();
  });

  it("can display the apps table", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=apps",
      path,
    });

    vi.spyOn(window.HTMLElement.prototype, "scrollIntoView");

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__integrations",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".entity-details__action-logs"),
    ).not.toBeInTheDocument();
  });

  it("can display the machines table", async () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
        machines: {
          "0": machineStatusFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=machines",
      path,
    });

    Element.prototype.scrollIntoView = vi.fn();

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines",
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__integrations",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".entity-details__action-logs"),
    ).not.toBeInTheDocument();
  });

  it("can display the relations table", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=integrations",
      path,
    });

    Element.prototype.scrollIntoView = vi.fn();

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__integrations",
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".entity-details__action-logs"),
    ).not.toBeInTheDocument();
  });

  it("can display the action logs table", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=logs",
      path,
    });

    Element.prototype.scrollIntoView = vi.fn();

    expect(
      document.querySelector(".entity-details__main > .entity-details__apps"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__machines",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__main > .entity-details__integrations",
      ),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".entity-details__action-logs"),
    ).toBeInTheDocument();
  });

  it("can display the audit logs table", async () => {
    if (state.general.config) {
      state.general.config.isJuju = false;
    }
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://jimm.jujucharms.com/api": controllerFeaturesFactory.build({
        auditLogs: true,
      }),
    });
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": {
        user: authUserInfoFactory.build(),
      },
    };
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: {
          object: "user-eggman@external",
          relation: JIMMRelation.AUDIT_LOG_VIEWER,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        },
        allowed: true,
      }),
      rebacAllowedFactory.build({
        tuple: {
          object: "user-eggman@external",
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        },
        allowed: true,
      }),
    ];
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=logs&tableView=audit-logs",
      path,
    });

    Element.prototype.scrollIntoView = vi.fn();

    await waitFor(() => {
      expect(
        document.querySelector(".entity-details__action-logs"),
      ).not.toBeInTheDocument();
      expect(
        document.querySelector(".entity-details__audit-logs"),
      ).toBeInTheDocument();
    });
  });

  it("can display the offers table", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        info: modelDataInfoFactory.build({
          uuid: "abc123",
          name: "test1",
        }),
        offers: {
          db: applicationOfferStatusFactory.build(),
        },
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=integrations",
      path,
    });
    expect(screen.getByTestId(TestId.OFFERS)).toBeInTheDocument();
  });

  it("can display the consumed table", async () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": machineChangeDeltaFactory.build(),
        },
      }),
    };
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        info: modelDataInfoFactory.build({
          uuid: "abc123",
          name: "test1",
        }),
        relations: [
          relationStatusFactory.build({
            key: "wordpress:db mysql:db",
          }),
        ],
        "remote-applications": {
          mysql: remoteApplicationStatusFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=integrations",
      path,
    });
    expect(screen.getByTestId(TestId.CONSUMED)).toBeInTheDocument();
  });

  it("can display the secrets tab via the URL", async () => {
    state.juju.modelFeatures = modelFeaturesStateFactory.build({
      abc123: modelFeaturesFactory.build({
        listSecrets: true,
      }),
    });
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=secrets",
      path,
    });
    expect(
      within(screen.getByTestId(TestId.MAIN)).getByTestId(
        SecretsTestId.SECRETS_TAB,
      ),
    ).toBeInTheDocument();
  });

  it("does not display the secrets tab if the feature is not available", async () => {
    state.juju.modelFeatures = modelFeaturesStateFactory.build({
      abc123: modelFeaturesFactory.build({
        listSecrets: false,
      }),
    });
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=secrets",
      path,
    });
    expect(
      within(screen.getByTestId(TestId.MAIN)).queryByTestId(
        SecretsTestId.SECRETS_TAB,
      ),
    ).not.toBeInTheDocument();
  });

  it("renders the details pane for models shared-with-me", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, { state, url, path });
    expect(
      document.querySelector(".entity-details__main table"),
    ).toBeInTheDocument(); // does this target correct table?
  });

  it("renders the machine details section", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        machines: {
          "0": machineStatusFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=machines",
      path,
    });
    expect(document.querySelector(".entity-details__main table")).toHaveClass(
      "entity-details__machines",
    );
  });

  it("supports local charms", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          cockroachdb: modelDataApplicationFactory.build({
            charm: "local:cockroachdb-55",
          }),
        },
      }),
    };
    renderComponent(<Model />, { state, url, path });
    expect(
      document.querySelector(
        ".entity-details__apps tr[data-app='cockroachdb']",
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        ".entity-details__apps tr[data-app='cockroachdb'] td[data-test-column='store']",
      )?.textContent,
    ).toBe("Local");
  });

  it("displays the correct scale value", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          client: modelDataApplicationFactory.build({
            units: {
              0: modelDataUnitFactory.build(),
            },
          }),
        },
      }),
    };
    const testApp = "client";
    renderComponent(<Model />, { state, url, path });
    const applicationRow = document.querySelector(`tr[data-app="${testApp}"]`);
    expect(
      applicationRow?.querySelector("td[data-test-column='scale']")
        ?.textContent,
    ).toBe("1");
  });

  it("should show a message if a model has no integrations", () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=integrations",
      path,
    });

    const noRelationsMsg = document.querySelector(
      "[data-testid='no-integrations-msg']",
    );
    expect(noRelationsMsg).toBeInTheDocument();
  });

  it("should show a message if a model has no machines", () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=machines",
      path,
    });

    const noMachinesMsg = document.querySelector(
      `[data-testid='${TestId.NO_MACHINES}']`,
    );
    expect(noMachinesMsg).toBeInTheDocument();
  });

  it("should show apps appropriate number of apps on machine in hadoopspark model", () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        model: modelWatcherModelInfoFactory.build({ name: "hadoopspark" }),
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
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        machines: {
          "0": machineStatusFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=machines",
      path,
    });
    const machineApps = document.querySelectorAll(".machine-app-icons img");
    expect(machineApps).toHaveLength(10);
  });

  it("should show apps appropriate number of apps on machine in canonical-kubernetes model", () => {
    state.juju.modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
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
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
        machines: {
          "0": machineStatusFactory.build({ id: "0" }),
          "1": machineStatusFactory.build({ id: "1" }),
        },
      }),
    };
    renderComponent(<Model />, {
      state,
      url: "/models/eggman@external/test1?activeView=machines",
      path,
    });

    const machineAppIconRows = screen.getAllByRole("row");

    expect(
      within(machineAppIconRows[1]).getByAltText("ceph-mon icon"),
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[1]).getByAltText("ceph-mon-0 icon"),
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[2]).getByAltText("ceph-mon-1 icon"),
    ).toBeInTheDocument();
    expect(
      within(machineAppIconRows[2]).getByAltText("ceph-mon-2 icon"),
    ).toBeInTheDocument();
  });

  it("renders the topology", () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {
          "ceph-mon": modelDataApplicationFactory.build(),
        },
      }),
    };
    renderComponent(<Model />, { state, url, path });
    expect(
      document.querySelector(".info-panel__pictogram"),
    ).toBeInTheDocument();
  });

  it("should have a link for model access panel", async () => {
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      uuid: "abc123",
      name: "test1",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const { router } = renderComponent(<Model />, { state, url, path });
    expect(router.state.location.search).toEqual("");
    await userEvent.click(
      screen.getByRole("button", { name: Label.ACCESS_BUTTON }),
    );
    expect(router.state.location.search).toEqual("?panel=share-model");
  });
});
