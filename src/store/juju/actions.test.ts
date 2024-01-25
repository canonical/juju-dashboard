import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";
import { auditEventFactory } from "testing/factories/juju/jimm";

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
      }),
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
      }),
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
      }),
    ).toStrictEqual({
      type: "juju/updateModelInfo",
      payload: {
        modelInfo,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateModelsError", () => {
    expect(
      actions.updateModelsError({
        modelsError: null,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/updateModelsError",
      payload: {
        modelsError: null,
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

  it("fetchAuditEvents", () => {
    expect(
      actions.fetchAuditEvents({
        "user-tag": "user-eggman@external",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/fetchAuditEvents",
      payload: {
        "user-tag": "user-eggman@external",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateAuditEvents", () => {
    const events = [auditEventFactory.build()];
    expect(actions.updateAuditEvents(events)).toStrictEqual({
      type: "juju/updateAuditEvents",
      payload: events,
    });
  });

  it("clearAuditEvents", () => {
    expect(actions.clearAuditEvents()).toStrictEqual({
      type: "juju/clearAuditEvents",
      payload: undefined,
    });
  });

  it("updateAuditEventsLimit", () => {
    expect(actions.updateAuditEventsLimit(50)).toStrictEqual({
      type: "juju/updateAuditEventsLimit",
      payload: 50,
    });
  });

  it("fetchCrossModelQuery", () => {
    expect(
      actions.fetchCrossModelQuery({
        wsControllerURL: "wss://test.example.com",
        query: ".",
      }),
    ).toStrictEqual({
      type: "juju/fetchCrossModelQuery",
      payload: {
        wsControllerURL: "wss://test.example.com",
        query: ".",
      },
    });
  });

  it("updateCrossModelQuery", () => {
    const payload = { results: {}, errors: {} };
    expect(actions.updateCrossModelQuery(payload)).toStrictEqual({
      type: "juju/updateCrossModelQuery",
      payload,
    });
  });

  it("clearCrossModelQuery", () => {
    expect(actions.clearCrossModelQuery()).toStrictEqual({
      type: "juju/clearCrossModelQuery",
      payload: undefined,
    });
  });
  it("updateControllerList", () => {
    expect(
      actions.updateControllerList({
        controllers: [],
        wsControllerURL: "wss://test.example.com",
      }),
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
      }),
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

  it("updateCharms", () => {
    const charms = [charmInfoFactory.build()];
    expect(
      actions.updateCharms({
        charms,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/updateCharms",
      payload: {
        charms,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateSelectedApplications", () => {
    const selectedApplications = [charmApplicationFactory.build()];
    expect(
      actions.updateSelectedApplications({
        selectedApplications,
      }),
    ).toStrictEqual({
      type: "juju/updateSelectedApplications",
      payload: { selectedApplications },
    });
  });
});
