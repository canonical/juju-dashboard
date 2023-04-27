import { fullStatusFactory } from "testing/factories/juju/Clientv6";

import { actions } from "./slice";

const status = fullStatusFactory.build({
  model: {
    "available-version": "",
    "cloud-tag": "",
    "meter-status": {
      color: "",
      message: "",
    },
    "model-status": {
      data: {},
      info: "",
      kind: "",
      life: "",
      since: "",
      status: "",
      version: "",
    },
    name: "",
    sla: "",
    type: "",
    version: "",
  },
});

describe("actions", () => {
  it("updateModelList", () => {
    const models = {
      "user-models": [
        {
          model: {
            uuid: "abc123",
            name: "a model",
            "owner-tag": "user-eggman@external",
            type: "model",
          },
          "last-connection": "today",
        },
      ],
    };
    expect(
      actions.updateModelList({
        models,
        wsControllerURL: "wss://test.example.com",
      })
    ).toStrictEqual({
      type: "juju/updateModelList",
      payload: {
        models,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateModelStatus", () => {
    expect(
      actions.updateModelStatus({
        modelUUID: "abc123",
        status,
        wsControllerURL: "wss://test.example.com",
      })
    ).toStrictEqual({
      type: "juju/updateModelStatus",
      payload: {
        modelUUID: "abc123",
        status,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateModelInfo", () => {
    const modelInfo = {
      results: [],
    };
    expect(
      actions.updateModelInfo({
        modelInfo,
        wsControllerURL: "wss://test.example.com",
      })
    ).toStrictEqual({
      type: "juju/updateModelInfo",
      payload: {
        modelInfo,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("clearModelData", () => {
    expect(actions.clearModelData()).toStrictEqual({
      type: "juju/clearModelData",
      payload: undefined,
    });
  });

  it("clearControllerData", () => {
    expect(actions.clearControllerData()).toStrictEqual({
      type: "juju/clearControllerData",
      payload: undefined,
    });
  });

  it("updateControllerList", () => {
    expect(
      actions.updateControllerList({
        controllers: [],
        wsControllerURL: "wss://test.example.com",
      })
    ).toStrictEqual({
      type: "juju/updateControllerList",
      payload: {
        controllers: [],
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("populateMissingAllWatcherData", () => {
    expect(
      actions.populateMissingAllWatcherData({
        status,
        uuid: "abc123",
      })
    ).toStrictEqual({
      type: "juju/populateMissingAllWatcherData",
      payload: {
        status,
        uuid: "abc123",
      },
    });
  });

  it("processAllWatcherDeltas", () => {
    expect(actions.processAllWatcherDeltas([])).toStrictEqual({
      type: "juju/processAllWatcherDeltas",
      payload: [],
    });
  });
});
