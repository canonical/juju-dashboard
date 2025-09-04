import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  listSecretResultFactory,
  relationshipTupleFactory,
  commandHistoryItem,
} from "testing/factories/juju/juju";

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

  it("updateAuditEventsErrors", () => {
    expect(actions.updateAuditEventsErrors("Oops!")).toStrictEqual({
      type: "juju/updateAuditEventsErrors",
      payload: "Oops!",
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

  it("updateCrossModelQueryResults", () => {
    const results = { result1Key: ["result1Value"] };
    expect(actions.updateCrossModelQueryResults(results)).toStrictEqual({
      type: "juju/updateCrossModelQueryResults",
      payload: results,
    });
  });

  it("updateCrossModelQueryErrors", () => {
    const errors = { error1: ["Uh oh!"] };
    expect(actions.updateCrossModelQueryErrors(errors)).toStrictEqual({
      type: "juju/updateCrossModelQueryErrors",
      payload: errors,
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
  it("updateModelFeatures", () => {
    expect(
      actions.updateModelFeatures({
        modelUUID: "abc123",
        features: {
          listSecrets: true,
        },
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/updateModelFeatures",
      payload: {
        modelUUID: "abc123",
        features: {
          listSecrets: true,
        },
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("secretsLoading", () => {
    expect(
      actions.secretsLoading({
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/secretsLoading",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateSecrets", () => {
    const secrets = [listSecretResultFactory.build()];
    expect(
      actions.updateSecrets({
        modelUUID: "abc123",
        secrets,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/updateSecrets",
      payload: {
        modelUUID: "abc123",
        secrets,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("setSecretsErrors", () => {
    expect(
      actions.setSecretsErrors({
        errors: "Uh oh!",
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/setSecretsErrors",
      payload: {
        errors: "Uh oh!",
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("clearSecrets", () => {
    expect(
      actions.clearSecrets({
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/clearSecrets",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("secretsContentLoading", () => {
    expect(
      actions.secretsContentLoading({
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/secretsContentLoading",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("updateSecretsContent", () => {
    const content = { key: "val" };
    expect(
      actions.updateSecretsContent({
        modelUUID: "abc123",
        content,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/updateSecretsContent",
      payload: {
        modelUUID: "abc123",
        content,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("setSecretsContentErrors", () => {
    expect(
      actions.setSecretsContentErrors({
        errors: "Uh oh!",
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/setSecretsContentErrors",
      payload: {
        errors: "Uh oh!",
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("clearSecretsContent", () => {
    expect(
      actions.clearSecretsContent({
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/clearSecretsContent",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("checkRelation", () => {
    const tuple = relationshipTupleFactory.build();
    expect(
      actions.checkRelation({
        tuple,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/checkRelation",
      payload: {
        tuple,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("addCheckRelation", () => {
    const tuple = relationshipTupleFactory.build();
    expect(actions.addCheckRelation({ tuple, allowed: true })).toStrictEqual({
      type: "juju/addCheckRelation",
      payload: { tuple, allowed: true },
    });
  });

  it("addCheckRelationErrors", () => {
    const tuple = relationshipTupleFactory.build();
    expect(
      actions.addCheckRelationErrors({ tuple, errors: "oops!" }),
    ).toStrictEqual({
      type: "juju/addCheckRelationErrors",
      payload: { tuple, errors: "oops!" },
    });
  });

  it("removeCheckRelation", () => {
    const tuple = relationshipTupleFactory.build();
    expect(actions.removeCheckRelation({ tuple })).toStrictEqual({
      type: "juju/removeCheckRelation",
      payload: { tuple },
    });
  });

  it("checkRelations", () => {
    const requestId = "123456";
    const tuples = [relationshipTupleFactory.build()];
    expect(
      actions.checkRelations({
        requestId,
        tuples,
        wsControllerURL: "wss://test.example.com",
      }),
    ).toStrictEqual({
      type: "juju/checkRelations",
      payload: {
        requestId,
        tuples,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });

  it("addCheckRelations", () => {
    const tuples = [relationshipTupleFactory.build()];
    const permissions = [{ allowed: true }];
    const requestId = "123456";
    expect(
      actions.addCheckRelations({ requestId, tuples, permissions }),
    ).toStrictEqual({
      type: "juju/addCheckRelations",
      payload: { tuples, permissions, requestId },
    });
  });

  it("addCheckRelationsErrors", () => {
    const tuples = [relationshipTupleFactory.build()];
    const requestId = "123456";
    expect(
      actions.addCheckRelationsErrors({ requestId, tuples, errors: "oops!" }),
    ).toStrictEqual({
      type: "juju/addCheckRelationsErrors",
      payload: { requestId, tuples, errors: "oops!" },
    });
  });

  it("removeCheckRelations", () => {
    const requestId = "123456";
    expect(actions.removeCheckRelations({ requestId })).toStrictEqual({
      type: "juju/removeCheckRelations",
      payload: { requestId },
    });
  });

  it("addCommandHistory", () => {
    const payload = {
      modelUUID: "abc123",
      historyItem: commandHistoryItem.build({ command: "status" }),
    };
    expect(actions.addCommandHistory(payload)).toStrictEqual({
      type: "juju/addCommandHistory",
      payload,
    });
  });
});
