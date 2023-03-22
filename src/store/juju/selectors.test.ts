import {
  jujuStateFactory,
  modelListInfoFactory,
  controllerFactory,
} from "testing/factories/juju/juju";
import {
  modelWatcherModelDataFactory,
  applicationInfoFactory,
  unitChangeDeltaFactory,
  relationChangeDeltaFactory,
  machineChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";

import {
  getModelWatcherDataByUUID,
  getModelInfo,
  getModelUUIDFromList,
  getModelAnnotations,
  getModelApplications,
  getModelUnits,
  getModelRelations,
  getModelMachines,
  getAllModelApplicationStatus,
  getModelData,
  getControllerData,
  getModelListLoaded,
  hasModels,
  getModelList,
  getModelByUUID,
  getModelControllerDataByUUID,
  getActiveUsers,
  getActiveUser,
} from "./selectors";

describe("selectors", () => {
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
        {
          path: "/",
          uuid: "abc123",
          version: "1",
        },
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

  it("getModelUUID", () => {
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
    let models = {
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
          "ceph-mon/0": {
            "agent-status": {
              current: "idle",
              message: "",
              since: "2021-08-13T19:34:41.247417373Z",
              version: "2.8.7",
            },
            "workload-status": {
              current: "blocked",
              message:
                "Insufficient peer units to bootstrap cluster (require 3)",
              since: "2021-08-13T19:34:37.747827227Z",
              version: "",
            },
            application: "ceph-mon",
          },
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
    ).toStrictEqual({ "ceph-mon": "blocked" });
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
});
