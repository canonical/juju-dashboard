import {
  modelWatcherModelDataFactory,
  applicationInfoFactory,
  unitChangeDeltaFactory,
  relationChangeDeltaFactory,
  machineChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { rootStateFactory } from "testing/factories";

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
} from "./selectors";
import { modelListInfoFactory } from "../../testing/factories/juju/juju";

const defaultState = {
  controllers: null,
  models: {},
  modelData: {},
  modelWatcherData: {},
};

describe("selectors", () => {
  it("getModelData", () => {
    const modelData = {
      "wss://example.com": modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelData(
        rootStateFactory.build({
          juju: {
            ...defaultState,
            modelData,
          },
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
          juju: {
            ...defaultState,
            controllers,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            models: {
              abc123: modelListInfoFactory.build({
                uuid: "abc123",
                name: "a model",
                ownerTag: "user-eggman@external",
              }),
            },
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.applications);
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
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
          juju: {
            ...defaultState,
            modelWatcherData,
          },
        })
      )
    ).toStrictEqual({ "ceph-mon": "blocked" });
  });
});
