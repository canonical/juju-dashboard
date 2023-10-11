import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import {
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV6";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
  modelDataMachineFactory,
  modelDataUnitFactory,
  auditEventsStateFactory,
  crossModelQueryStateFactory,
} from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  relationChangeDeltaFactory,
  unitAgentStatusFactory,
  unitChangeDeltaFactory,
  workloadStatusFactory,
} from "testing/factories/juju/model-watcher";

import {
  getActiveUser,
  getActiveUsers,
  getAllModelApplicationStatus,
  getCharms,
  getControllerData,
  getControllerDataByUUID,
  getExternalUsers,
  getExternalUsersInModel,
  getFilteredModelData,
  getGroupedApplicationsDataByStatus,
  getGroupedByCloudAndFilteredModelData,
  getGroupedByOwnerAndFilteredModelData,
  getGroupedByStatusAndFilteredModelData,
  getGroupedMachinesDataByStatus,
  getGroupedModelStatusCounts,
  getGroupedUnitsDataByStatus,
  getModelAccess,
  getModelAnnotations,
  getModelApplications,
  getModelByUUID,
  getModelControllerDataByUUID,
  getModelData,
  getModelDataByUUID,
  getModelInfo,
  getModelList,
  getModelListLoaded,
  getModelMachines,
  getModelRelations,
  getModelStatus,
  getModelUUID,
  getModelUUIDFromList,
  getModelUnits,
  getModelWatcherDataByUUID,
  getSelectedApplications,
  getSelectedCharm,
  getUserDomains,
  getUserDomainsInModel,
  hasModels,
  getAuditEventsState,
  getAuditEvents,
  getAuditEventsLoaded,
  getAuditEventsLoading,
  getAuditEventsUsers,
  getAuditEventsModels,
  getAuditEventsFacades,
  getAuditEventsMethods,
  getCrossModelQueryState,
  getCrossModelQueryResults,
  getCrossModelQueryErrors,
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getFullModelNames,
  getUsers,
  getFullModelName,
} from "./selectors";

describe("selectors", () => {
  it("getAuditEventsState", () => {
    const auditEvents = auditEventsStateFactory.build();
    expect(
      getAuditEventsState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents,
          }),
        })
      )
    ).toStrictEqual(auditEvents);
  });

  it("getAuditEvents", () => {
    const items = [auditEventFactory.build()];
    expect(
      getAuditEvents(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        })
      )
    ).toStrictEqual(items);
  });

  it("getAuditEventsLoaded", () => {
    expect(
      getAuditEventsLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ loaded: true }),
          }),
        })
      )
    ).toBe(true);
  });

  it("getAuditEventsLoading", () => {
    expect(
      getAuditEventsLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ loading: true }),
          }),
        })
      )
    ).toBe(true);
  });

  it("getAuditEventsUsers", () => {
    const items = [
      auditEventFactory.build({ "user-tag": "user-eggman" }),
      auditEventFactory.build({ "user-tag": "user-spaceman" }),
      auditEventFactory.build({ "user-tag": "user-eggman" }),
    ];
    expect(
      getAuditEventsUsers(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        })
      )
    ).toStrictEqual(["eggman", "spaceman"]);
  });

  it("getAuditEventsModels", () => {
    const items = [
      auditEventFactory.build({ model: "model1" }),
      auditEventFactory.build({ model: "model2" }),
      auditEventFactory.build({ model: "model2" }),
    ];
    expect(
      getAuditEventsModels(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        })
      )
    ).toStrictEqual(["model1", "model2"]);
  });

  it("getAuditEventsFacades", () => {
    const items = [
      auditEventFactory.build({ "facade-name": "Client" }),
      auditEventFactory.build({ "facade-name": "Client" }),
      auditEventFactory.build({ "facade-name": "Admin" }),
    ];
    expect(
      getAuditEventsFacades(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        })
      )
    ).toStrictEqual(["Client", "Admin"]);
  });

  it("getAuditEventsMethods", () => {
    const items = [
      auditEventFactory.build({ "facade-method": "Login" }),
      auditEventFactory.build({ "facade-method": "Logout" }),
      auditEventFactory.build({ "facade-method": "Login" }),
    ];
    expect(
      getAuditEventsMethods(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        })
      )
    ).toStrictEqual(["Login", "Logout"]);
  });

  it("getCrossModelQueryState", () => {
    const crossModelQuery = crossModelQueryStateFactory.build();
    expect(
      getCrossModelQueryState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            crossModelQuery,
          }),
        })
      )
    ).toStrictEqual(crossModelQuery);
  });

  it("getCrossModelQueryResults", () => {
    const results = { mockResultKey: ["mockResultValue"] };
    expect(
      getCrossModelQueryResults(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            crossModelQuery: crossModelQueryStateFactory.build({ results }),
          }),
        })
      )
    ).toStrictEqual(results);
  });

  it("getCrossModelQueryErrors", () => {
    const errors = { mockErrorKey: ["mockErrorValue"] };
    expect(
      getCrossModelQueryErrors(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            crossModelQuery: crossModelQueryStateFactory.build({ errors }),
          }),
        })
      )
    ).toStrictEqual(errors);
  });

  it("getCrossModelQueryLoaded", () => {
    expect(
      getCrossModelQueryLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            crossModelQuery: crossModelQueryStateFactory.build({
              loaded: true,
            }),
          }),
        })
      )
    ).toStrictEqual(true);
  });

  it("getCrossModelQueryLoading", () => {
    expect(
      getCrossModelQueryLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            crossModelQuery: crossModelQueryStateFactory.build({
              loading: true,
            }),
          }),
        })
      )
    ).toStrictEqual(true);
  });

  it("getModelData", () => {
    const modelData = {
      "wss://example.com": {
        uuid: "abc123",
        annotations: undefined,
        applications: {},
        machines: {},
        model: {},
        offers: {},
        relations: [],
        "remote-applications": {},
      },
    };
    expect(
      getModelData(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData,
          }),
        })
      )
    ).toStrictEqual(modelData);
  });

  it("getControllerData", () => {
    const controllers = {
      "wss://example.com": [
        controllerFactory.build({
          path: "/",
          uuid: "abc123",
          version: "1",
        }),
      ],
    };
    expect(
      getControllerData(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            controllers,
          }),
        })
      )
    ).toStrictEqual(controllers);
  });

  it("getModelWatcherDataByUUID", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelWatcherDataByUUID("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123);
  });

  it("getModelInfo", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelInfo("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.model);
  });

  it("getModelUUID from model name", () => {
    expect(
      getModelUUID("test-model")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  name: "test-model",
                }),
              }),
            },
          }),
        })
      )
    ).toStrictEqual("abc123");
  });

  it("getModelUUID from model and owner names", () => {
    expect(
      getModelUUID("eggman/test-model")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  name: "test-model",
                  "owner-tag": "user-eggman",
                }),
              }),
            },
          }),
        })
      )
    ).toStrictEqual("abc123");
  });

  it("getModelUUID handles incorrect owner name", () => {
    expect(
      getModelUUID("eggman/test-model")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  name: "test-model",
                  "owner-tag": "user-admin",
                }),
              }),
            },
          }),
        })
      )
    ).toBeNull();
  });

  it("getModelStatus handles incorrect owner name", () => {
    const model = modelDataFactory.build();
    expect(
      getModelStatus("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: model,
            },
          }),
        })
      )
    ).toStrictEqual(model);
  });

  it("getGroupedByStatusAndFilteredModelData", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "pending",
            }),
          }),
        },
      }),
      def456: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "blocked",
            }),
          }),
        },
      }),
      ghi789: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "unknown",
            }),
          }),
        },
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(
      getGroupedByStatusAndFilteredModelData({ cloud: ["aws", "google"] })(
        state
      )
    ).toStrictEqual({
      alert: [modelData.ghi789],
      blocked: [modelData.def456],
      running: [modelData.abc123],
    });
  });

  it("getGroupedByCloudAndFilteredModelData", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "cloud-tag": "cloud-aws",
        }),
      }),
      def456: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "cloud-tag": "cloud-gce",
        }),
      }),
      ghi789: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "cloud-tag": "cloud-azure",
        }),
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(
      getGroupedByCloudAndFilteredModelData({ cloud: ["aws", "google"] })(state)
    ).toStrictEqual({
      aws: [modelData.abc123],
      gce: [modelData.def456],
      azure: [modelData.ghi789],
    });
  });

  it("getGroupedByOwnerAndFilteredModelData", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "owner-tag": "user-eggman",
        }),
      }),
      def456: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "owner-tag": "user-spaceman",
        }),
      }),
      ghi789: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "owner-tag": "user-admin",
        }),
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(
      getGroupedByOwnerAndFilteredModelData({ cloud: ["aws", "google"] })(state)
    ).toStrictEqual({
      eggman: [modelData.abc123],
      spaceman: [modelData.def456],
      admin: [modelData.ghi789],
    });
  });

  it("getGroupedMachinesDataByStatus", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        machines: {
          "0": modelDataMachineFactory.build({
            "agent-status": {
              status: "down",
            },
            id: "0",
          }),
          "1": modelDataMachineFactory.build({
            "agent-status": {
              status: "pending",
            },
            id: "1",
          }),
        },
      }),
      def456: modelDataFactory.build({
        machines: {
          "2": modelDataMachineFactory.build({
            "agent-status": {
              status: "running",
            },
            id: "2",
          }),
          "3": modelDataMachineFactory.build({
            "agent-status": {
              status: "down",
            },
            id: "3",
          }),
        },
      }),
      ghi789: modelDataFactory.build({
        machines: {
          "4": modelDataMachineFactory.build({
            "agent-status": {
              status: "down",
            },
            id: "4",
          }),
          "5": modelDataMachineFactory.build({
            "agent-status": {
              status: "error",
            },
            id: "5",
          }),
        },
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(getGroupedMachinesDataByStatus(state)).toStrictEqual({
      alert: [modelData.abc123.machines["1"]],
      blocked: [
        modelData.abc123.machines["0"],
        modelData.def456.machines["3"],
        modelData.ghi789.machines["4"],
      ],
      running: [modelData.def456.machines["2"], modelData.ghi789.machines["5"]],
    });
  });

  it("getGroupedUnitsDataByStatus", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            units: {
              "easyrsa/0": modelDataUnitFactory.build({
                "agent-status": detailedStatusFactory.build({
                  status: "running",
                }),
                charm: "ch:easyrsa",
              }),
            },
          }),
        },
      }),
      def456: modelDataFactory.build({
        applications: {
          etcd: modelDataApplicationFactory.build({
            units: {
              "etcd/0": modelDataUnitFactory.build({
                "agent-status": detailedStatusFactory.build({
                  status: "allocating",
                }),
                charm: "ch:etcd",
              }),
              "etcd/1": modelDataUnitFactory.build({
                "agent-status": detailedStatusFactory.build({
                  status: "lost",
                }),
                charm: "ch:etcd",
              }),
            },
          }),
          ceph: modelDataApplicationFactory.build({
            units: {
              "ceph/0": modelDataUnitFactory.build({
                "agent-status": detailedStatusFactory.build({
                  status: "lost",
                }),
                charm: "ch:ceph",
              }),
            },
          }),
        },
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(getGroupedUnitsDataByStatus(state)).toStrictEqual({
      alert: [modelData.def456.applications.etcd.units["etcd/0"]],
      blocked: [
        modelData.def456.applications.etcd.units["etcd/1"],
        modelData.def456.applications.ceph.units["ceph/0"],
      ],
      running: [modelData.abc123.applications.easyrsa.units["easyrsa/0"]],
    });
  });

  it("getGroupedApplicationsDataByStatus", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "pending",
            }),
          }),
        },
      }),
      def456: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "blocked",
            }),
          }),
        },
      }),
      ghi789: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "unknown",
            }),
          }),
        },
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(getGroupedApplicationsDataByStatus(state)).toStrictEqual({
      alert: [modelData.ghi789.applications.easyrsa],
      blocked: [modelData.def456.applications.easyrsa],
      running: [modelData.abc123.applications.easyrsa],
    });
  });

  it("getGroupedModelStatusCounts", () => {
    const modelData = {
      abc123: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "pending",
            }),
          }),
        },
      }),
      def456: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "unknown",
            }),
          }),
        },
      }),
      ghi789: modelDataFactory.build({
        applications: {
          easyrsa: modelDataApplicationFactory.build({
            status: detailedStatusFactory.build({
              status: "unknown",
            }),
          }),
        },
      }),
    };
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData,
      }),
    });
    expect(getGroupedModelStatusCounts(state)).toStrictEqual({
      alert: 2,
      blocked: 0,
      running: 1,
    });
  });

  it("getControllerDataByUUID", () => {
    const controller = controllerFactory.build({
      uuid: "controller123",
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        controllers: {
          "wss://example.com": [controller],
        },
      }),
    });
    expect(getControllerDataByUUID("controller123")(state)).toStrictEqual([
      "wss://example.com",
      [controller],
    ]);
  });

  it("getCharms", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build(),
          charmInfoFactory.build({
            meta: { name: "Redis k8s" },
            url: "ch:amd64/focal/redis-k8s",
          }),
        ],
        selectedApplications: [
          charmApplicationFactory.build({ "charm-url": "ch:nothing" }),
          charmApplicationFactory.build({
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
    expect(getCharms()(state)).toStrictEqual([
      charmInfoFactory.build({
        meta: { name: "Redis k8s" },
        url: "ch:amd64/focal/redis-k8s",
      }),
    ]);
  });

  it("getSelectedApplications without charm URL", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        selectedApplications: [
          charmApplicationFactory.build({ "charm-url": "ch:nothing" }),
          charmApplicationFactory.build({
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
    expect(getSelectedApplications()(state)).toStrictEqual(
      state.juju.selectedApplications
    );
  });

  it("getSelectedApplications with charm URL", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        selectedApplications: [
          charmApplicationFactory.build({ "charm-url": "ch:nothing" }),
          charmApplicationFactory.build({
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
    expect(
      getSelectedApplications("ch:amd64/focal/redis-k8s")(state)
    ).toStrictEqual([
      charmApplicationFactory.build({
        "charm-url": "ch:amd64/focal/redis-k8s",
      }),
    ]);
  });

  it("getSelectedCharm", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build(),
          charmInfoFactory.build({
            meta: { name: "Redis k8s" },
            url: "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
    expect(getSelectedCharm("ch:amd64/focal/redis-k8s")(state)).toStrictEqual(
      charmInfoFactory.build({
        meta: { name: "Redis k8s" },
        url: "ch:amd64/focal/redis-k8s",
      })
    );
  });

  it("getModelUUIDFromList", () => {
    expect(
      getModelUUIDFromList(
        "a model",
        "eggman@external"
      )(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models: {
              abc123: modelListInfoFactory.build({
                uuid: "abc123",
                name: "a model",
                ownerTag: "user-eggman@external",
              }),
            },
          }),
        })
      )
    ).toStrictEqual("abc123");
  });

  it("getModelAnnotations", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        annotations: {
          "ceph-mon": {
            "gui-x": "818",
            "gui-y": "563",
          },
        },
      }),
    };
    expect(
      getModelAnnotations("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.annotations);
  });

  it("getModelApplications", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
      }),
    };
    expect(
      getModelApplications("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.applications);
  });

  it("getModelList", () => {
    const models = {
      abc123: modelListInfoFactory.build({
        wsControllerURL: "wss://example.com/api",
      }),
    };
    expect(
      getModelList(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models,
          }),
        })
      )
    ).toStrictEqual(models);
  });

  it("getFullModelName", () => {
    expect(
      getFullModelName(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models: {
              abc123: modelListInfoFactory.build({
                name: "model1",
                uuid: "abc123",
                wsControllerURL: "wss://example.com/api",
              }),
            },
            controllers: {
              "wss://example.com/api": [
                controllerFactory.build({ name: "controller1" }),
              ],
            },
          }),
        }),
        "abc123"
      )
    ).toStrictEqual("controller1/model1");
  });

  it("getFullModelNames", () => {
    const models = {
      abc123: modelListInfoFactory.build({
        name: "model1",
        wsControllerURL: "wss://example.com/api",
      }),
      def456: modelListInfoFactory.build({
        name: "model2",
        wsControllerURL: "wss://test.com/api",
      }),
    };
    expect(
      getFullModelNames(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models,
            controllers: {
              "wss://example.com/api": [
                controllerFactory.build({ name: "controller1" }),
              ],
              "wss://test.com/api": [
                controllerFactory.build({ name: "controller2" }),
              ],
            },
          }),
        })
      )
    ).toStrictEqual(["controller1/model1", "controller2/model2"]);
  });

  it("getModelByUUID", () => {
    const models = {
      abc123: modelListInfoFactory.build({
        wsControllerURL: "wss://example.com/api",
      }),
    };
    expect(
      getModelByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models,
          }),
        }),
        "abc123"
      )
    ).toStrictEqual(models.abc123);
  });

  it("getModelDataByUUID", () => {
    const modelData = {
      abc123: modelDataFactory.build(),
    };
    expect(
      getModelDataByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData,
          }),
        }),
        "abc123"
      )
    ).toStrictEqual(modelData.abc123);
  });

  it("getModelAccess for a user with access to a model", () => {
    expect(
      getModelAccess(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com/api": {
                user: {
                  "display-name": "eggman",
                  identity: "user-eggman@external",
                  "controller-access": "",
                  "model-access": "",
                },
              },
            },
          }),
          juju: jujuStateFactory.build({
            modelData: {
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
            },
            models: {
              abc123: modelListInfoFactory.build({
                wsControllerURL: "wss://example.com/api",
              }),
            },
          }),
        }),
        "abc123"
      )
    ).toBe("read");
  });

  it("getModelAccess for a user with access to a controller", () => {
    expect(
      getModelAccess(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com/api": {
                user: {
                  "display-name": "eggman",
                  identity: "user-eggman@external",
                  "controller-access": "superuser",
                  "model-access": "",
                },
              },
            },
          }),
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  users: [],
                }),
              }),
            },
            models: {
              abc123: modelListInfoFactory.build({
                wsControllerURL: "wss://example.com/api",
              }),
            },
          }),
        }),
        "abc123"
      )
    ).toBe("superuser");
  });

  it("getModelControllerDataByUUID", () => {
    const controllers = {
      "wss://example.com/api": [controllerFactory.build({ uuid: "abc123" })],
      "wss://test.com/api": [controllerFactory.build({ uuid: "def456" })],
    };
    expect(
      getModelControllerDataByUUID("def456")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            controllers,
          }),
        })
      )
    ).toStrictEqual({
      ...controllerFactory.build({ uuid: "def456" }),
      url: "wss://test.com/api",
    });
  });

  it("getModelListLoaded", () => {
    expect(
      getModelListLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelsLoaded: true,
          }),
        })
      )
    ).toBe(true);
  });

  it("getModelUnits", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph-mon/0": unitChangeDeltaFactory.build(),
        },
      }),
    };
    expect(
      getModelUnits("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.units);
  });

  it("getModelRelations", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        relations: {
          "wordpress:db mysql:db": relationChangeDeltaFactory.build(),
        },
      }),
    };
    expect(
      getModelRelations("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.relations);
  });

  it("getModelMachines", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: { "0": machineChangeDeltaFactory.build() },
      }),
    };
    expect(
      getModelMachines("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.machines);
  });

  it("getAllModelApplicationStatus", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph-mon/0": unitChangeDeltaFactory.build({
            "agent-status": unitAgentStatusFactory.build({
              current: "idle",
            }),
            "workload-status": workloadStatusFactory.build({
              current: "blocked",
            }),
            application: "ceph-mon",
          }),
          "postgres/0": unitChangeDeltaFactory.build({
            "agent-status": unitAgentStatusFactory.build({
              current: "rebooting",
            }),
            "workload-status": workloadStatusFactory.build({
              current: "waiting",
            }),
            application: "postgres",
          }),
          "etcd/0": unitChangeDeltaFactory.build({
            "agent-status": unitAgentStatusFactory.build({
              current: "failed",
            }),
            "workload-status": workloadStatusFactory.build({
              current: "maintenance",
            }),
            application: "etcd",
          }),
          "wordpress/0": unitChangeDeltaFactory.build({
            "agent-status": unitAgentStatusFactory.build({
              current: "allocating",
            }),
            "workload-status": workloadStatusFactory.build({
              current: "maintenance",
            }),
            application: "wordpress",
          }),
          "dashboard/0": unitChangeDeltaFactory.build({
            "agent-status": unitAgentStatusFactory.build({
              current: "executing",
            }),
            "workload-status": workloadStatusFactory.build({
              current: "maintenance",
            }),
            application: "dashboard",
          }),
        },
      }),
    };
    expect(
      getAllModelApplicationStatus("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual({
      "ceph-mon": "blocked",
      dashboard: "alert",
      etcd: "blocked",
      postgres: "alert",
      wordpress: "alert",
    });
  });

  it("hasModels", () => {
    expect(
      hasModels(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models: {
              abc123: modelListInfoFactory.build(),
            },
          }),
        })
      )
    ).toBe(true);
  });

  it("getActiveUser", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
        },
      }),
    });
    expect(getActiveUser(state, "abc123")).toStrictEqual("eggman@external");
  });

  it("getUsers", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [modelUserInfoFactory.build({ user: "other3" })],
            }),
          }),
        },
      }),
    });
    expect(getUsers(state)).toStrictEqual([
      "eggman@external",
      "spaceman@domain",
      "other3",
    ]);
  });

  it("getActiveUsers", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
          "wss://test.com/api": {
            user: {
              "display-name": "spaceman",
              identity: "user-spaceman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
          def456: modelListInfoFactory.build({
            wsControllerURL: "wss://test.com/api",
          }),
        },
      }),
    });
    expect(getActiveUsers(state)).toStrictEqual({
      abc123: "eggman@external",
      def456: "spaceman@external",
    });
  });

  it("getExternalUsers", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "other@model2" }),
                modelUserInfoFactory.build({ user: "other2@anothermodel2" }),
                modelUserInfoFactory.build({ user: "other3" }),
              ],
            }),
          }),
        },
      }),
    });
    expect(getExternalUsers(state)).toStrictEqual([
      "eggman@external",
      "spaceman@domain",
      "other@model2",
      "other2@anothermodel2",
    ]);
  });

  it("getExternalUsersInModel", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [modelUserInfoFactory.build({ user: "other@model2" })],
            }),
          }),
        },
      }),
    });
    expect(getExternalUsersInModel(state, "abc123")).toStrictEqual([
      "eggman@external",
      "spaceman@domain",
    ]);
  });

  it("getUserDomains", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "other@model2" }),
                modelUserInfoFactory.build({ user: "other2@external" }),
              ],
            }),
          }),
        },
      }),
    });
    expect(getUserDomains(state)).toStrictEqual([
      "external",
      "domain",
      "model2",
    ]);
  });

  it("getUserDomainsInModel", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
                modelUserInfoFactory.build({ user: "fireman@external" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [modelUserInfoFactory.build({ user: "other@model2" })],
            }),
          }),
        },
      }),
    });
    expect(getUserDomainsInModel(state, "abc123")).toStrictEqual([
      "external",
      "domain",
    ]);
  });

  describe("getFilteredModelData", () => {
    it("filters by cloud", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-aws",
          }),
        }),
        def456: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-google",
          }),
        }),
        ghi789: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-azure",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ cloud: ["aws", "google"] })(state)
      ).toStrictEqual({
        abc123: modelData.abc123,
        def456: modelData.def456,
      });
    });

    it("filters by credential", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_spaceman@external_juju",
          }),
        }),
        ghi789: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_eggman_juju",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ credential: ["eggman", "eggman@external"] })(
          state
        )
      ).toStrictEqual({
        abc123: modelData.abc123,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by region", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "east",
          }),
        }),
        def456: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "west",
          }),
        }),
        ghi789: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "north",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ region: ["west", "north"] })(state)
      ).toStrictEqual({
        def456: modelData.def456,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by owner", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-eggman@external",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-spaceman@external",
          }),
        }),
        ghi789: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-eggman",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ owner: ["eggman", "eggman@external"] })(state)
      ).toStrictEqual({
        abc123: modelData.abc123,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by custom", () => {
      const modelData = {
        a1: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            name: "matches",
          }),
        }),
        b2: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "matches",
          }),
        }),
        c3: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_matches_juju",
          }),
        }),
        d4: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "matches",
          }),
        }),
        e5: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-matches",
          }),
        }),
        f6: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            name: "not this one!",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(getFilteredModelData({ custom: ["match"] })(state)).toStrictEqual({
        a1: modelData.a1,
        b2: modelData.b2,
        c3: modelData.c3,
        d4: modelData.d4,
        e5: modelData.e5,
      });
    });
  });
});
