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
} from "./selectors";

const defaultState = {
  controllers: null,
  models: {},
  modelData: {},
  modelWatcherData: {},
};

describe("selectors", () => {
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
