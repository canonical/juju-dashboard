import { modelWatcherDataFactory } from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories";

import {
  getModelWatcherDataByUUID,
  getModelInfo,
  getModelUUID,
  getModelAnnotations,
  getModelApplications,
  getModelUnits,
  getModelRelations,
  getModelMachines,
  getAllModelApplicationStatus,
  getModelData,
  getControllerData,
} from "./selectors";

const defaultState = {
  controllers: null,
  models: {},
  modelData: {},
  modelWatcherData: {},
};

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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
      getModelUUID(
        "a model",
        "eggman@external"
      )(
        rootStateFactory.build({
          juju: {
            ...defaultState,
            models: {
              abc123: {
                uuid: "abc123",
                name: "a model",
                ownerTag: "user-eggman@external",
                type: "model",
              },
            },
          },
        })
      )
    ).toStrictEqual("abc123");
  });

  it("getModelAnnotations", () => {
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
    const modelWatcherData = modelWatcherDataFactory.build(undefined, {
      transient: { uuid: "abc123" },
    });
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
