import { charmInfoFactory } from "testing/factories/juju/Charms";
import {
  applicationStatusFactory,
  fullStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { listSecretResultFactory } from "testing/factories/juju/SecretsV2";
import {
  auditEventFactory,
  rebacAllowedFactory,
  rebacRelationshipFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  auditEventsStateFactory,
  crossModelQueryStateFactory,
  secretsStateFactory,
  modelSecretsFactory,
  modelFeaturesStateFactory,
  modelSecretsContentFactory,
  rebacState,
  commandHistoryState,
  commandHistoryItem,
} from "testing/factories/juju/juju";

import { actions, reducer } from "./slice";

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
    region: "west",
  },
});

const model = modelDataFactory.build({
  uuid: "abc123",
  applications: status.applications,
  machines: status.machines,
  model: status.model,
  offers: status.offers,
  relations: status.relations,
  "remote-applications": status["remote-applications"],
  storage: undefined,
});

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "" })).toStrictEqual(
      jujuStateFactory.build(),
    );
  });

  it("updateModelList adds list of models to empty state for Juju 3.6 models", () => {
    const state = jujuStateFactory.build({ modelsLoaded: false });
    expect(
      reducer(
        state,
        actions.updateModelList({
          models: {
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
          },
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      models: {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          name: "a model",
          qualifier: "eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
      },
      modelsLoaded: true,
    });
  });

  it("updateModelList adds list of models to empty state for Juju 4.0 models", () => {
    const state = jujuStateFactory.build({ modelsLoaded: false });
    expect(
      reducer(
        state,
        actions.updateModelList({
          models: {
            "user-models": [
              {
                model: {
                  uuid: "abc123",
                  name: "a model",
                  qualifier: "eggman@external",
                  type: "model",
                },
                "last-connection": "today",
              },
            ],
          },
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      models: {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          name: "a model",
          qualifier: "eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
      },
      modelsLoaded: true,
    });
  });

  it("updateModelList removes a model and its associated model data", () => {
    const state = jujuStateFactory.build({
      models: {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          name: "a model",
          qualifier: "user-eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
        xyz345: modelListInfoFactory.build({
          uuid: "xyz345",
          name: "another model",
          qualifier: "user-eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
      },
      modelData: {
        abc123: model,
        xyz345: { ...model, uuid: "xyz345" },
      },
      modelsLoaded: true,
    });
    expect(
      reducer(
        state,
        actions.updateModelList({
          models: {
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
          },
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      models: {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          name: "a model",
          qualifier: "eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
      },
      modelData: {
        abc123: model,
      },
      modelsLoaded: true,
    });
  });

  it("updateModelStatus", () => {
    const annotations = {
      "ceph-mon": {
        "gui-x": "818",
        "gui-y": "563",
      },
    };
    const updatedModel = {
      ...model,
      annotations,
      uuid: "abc123",
    };
    delete updatedModel.info;
    const state = jujuStateFactory.build();
    expect(
      reducer(
        state,
        actions.updateModelStatus({
          modelUUID: "abc123",
          status: {
            ...status,
            annotations,
          },
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      modelData: {
        abc123: updatedModel,
      },
    });
  });

  it("updateModelInfo", () => {
    const state = jujuStateFactory.build({
      modelData: {
        abc123: model,
      },
    });
    const modelInfo = {
      results: [
        {
          error: {
            code: "",
            message: "",
          },
          result: modelInfoFactory.build(),
        },
      ],
    };
    expect(
      reducer(
        state,
        actions.updateModelInfo({
          modelInfo,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      modelData: {
        abc123: {
          ...model,
          info: modelInfo.results[0].result,
        },
      },
    });
  });

  it("updateModelsError", () => {
    const state = jujuStateFactory.build({
      modelData: {
        abc123: model,
      },
    });
    expect(
      reducer(
        state,
        actions.updateModelsError({
          modelsError: null,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      modelsError: null,
    });
  });

  it("clearModelData", () => {
    const state = jujuStateFactory.build({
      modelData: {
        abc123: model,
      },
      models: {
        abc123: modelListInfoFactory.build(),
      },
      modelsLoaded: true,
    });
    expect(reducer(state, actions.clearModelData())).toStrictEqual(
      jujuStateFactory.build({ modelsLoaded: false }),
    );
  });

  it("destroyModels", () => {
    const state = jujuStateFactory.build();
    const destroyModelParams = [
      {
        "model-tag": "model-abc123",
        "destroy-storage": true,
        modelUUID: "abc123",
        modelName: "abc",
      },
    ];
    expect(
      reducer(
        state,
        actions.destroyModels({
          models: destroyModelParams,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      destroyModel: {
        abc123: {
          modelName: "abc",
          errors: null,
          loaded: false,
          loading: false,
        },
      },
    });
  });

  it("updateDestroyModelsLoading", () => {
    const state = jujuStateFactory.build({
      destroyModel: {
        abc123: {
          errors: null,
          loaded: false,
          loading: false,
        },
      },
    });
    expect(
      reducer(
        state,
        actions.updateDestroyModelsLoading({
          modelUUIDs: ["abc123"],
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      destroyModel: {
        abc123: {
          errors: null,
          loaded: false,
          loading: true,
        },
      },
    });
  });

  it("updateModelsDestroyed", () => {
    const state = jujuStateFactory.build({
      destroyModel: {
        abc123: {
          errors: null,
          loaded: false,
          loading: true,
        },
      },
    });
    expect(
      reducer(
        state,
        actions.updateModelsDestroyed({
          modelUUIDs: ["abc123"],
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      destroyModel: {
        abc123: {
          errors: null,
          loaded: true,
          loading: false,
        },
      },
    });
  });

  it("clearDestroyedModel", () => {
    const state = jujuStateFactory.build({
      destroyModel: {
        abc123: {
          errors: null,
          loaded: false,
          loading: true,
        },
        xyz456: {
          errors: null,
          loaded: false,
          loading: true,
        },
      },
    });
    expect(
      reducer(
        state,
        actions.clearDestroyedModel({
          modelUUID: "abc123",
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      destroyModel: {
        xyz456: {
          errors: null,
          loaded: false,
          loading: true,
        },
      },
    });
  });

  it("destroyModelErrors", () => {
    const state = jujuStateFactory.build({
      destroyModel: {
        abc123: {
          errors: null,
          loaded: false,
          loading: true,
        },
      },
    });
    expect(
      reducer(
        state,
        actions.destroyModelErrors({ errors: [["abc123", "Uh oh!"]] }),
      ),
    ).toStrictEqual({
      ...state,
      destroyModel: {
        abc123: {
          errors: "Uh oh!",
          loaded: true,
          loading: false,
        },
      },
    });
  });

  it("fetchCrossModelQuery", () => {
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({ loading: false }),
    });
    expect(
      reducer(
        state,
        actions.fetchCrossModelQuery({
          wsControllerURL: "wss://example.com",
          query: ".",
        }),
      ),
    ).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({ loading: true }),
    });
  });

  it("updateCrossModelQueryResults", () => {
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: null,
        loaded: false,
        loading: true,
      }),
    });
    const results = { mockResultKey: ["mockResultValue"] };
    expect(
      reducer(state, actions.updateCrossModelQueryResults(results)),
    ).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({
        results,
        errors: null,
        loaded: true,
        loading: false,
      }),
    });
  });

  it("updateCrossModelQueryErrors", () => {
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: null,
        loaded: false,
        loading: true,
      }),
    });
    expect(
      reducer(state, actions.updateCrossModelQueryErrors("Uh oh!")),
    ).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: "Uh oh!",
        loaded: true,
        loading: false,
      }),
    });
  });

  it("clearCrossModelQuery", () => {
    const results = { mockResultKey: ["mockResultValue"] };
    const errors = { mockErrorKey: ["mockErrorValue"] };
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({
        results,
        errors,
        loaded: true,
        loading: true,
      }),
    });
    expect(reducer(state, actions.clearCrossModelQuery())).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: null,
        loaded: false,
        loading: false,
      }),
    });
  });

  it("fetchAuditEvents", () => {
    const state = jujuStateFactory.build({
      auditEvents: auditEventsStateFactory.build({ loading: false }),
    });
    expect(
      reducer(
        state,
        actions.fetchAuditEvents({
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      auditEvents: auditEventsStateFactory.build({ loading: true }),
    });
  });

  it("updateAuditEvents", () => {
    const state = jujuStateFactory.build({
      auditEvents: auditEventsStateFactory.build({
        items: null,
        loaded: false,
        loading: true,
      }),
    });
    const items = [auditEventFactory.build()];
    expect(reducer(state, actions.updateAuditEvents(items))).toStrictEqual({
      ...state,
      auditEvents: auditEventsStateFactory.build({
        items,
        loaded: true,
        loading: false,
      }),
    });
  });

  it("clearAuditEvents", () => {
    const state = jujuStateFactory.build({
      auditEvents: auditEventsStateFactory.build({
        items: [auditEventFactory.build()],
        loaded: true,
        loading: true,
      }),
    });
    expect(reducer(state, actions.clearAuditEvents())).toStrictEqual({
      ...state,
      auditEvents: auditEventsStateFactory.build({
        items: null,
        loaded: false,
        loading: false,
      }),
    });
  });

  it("updateAuditEventsLimit", () => {
    const state = jujuStateFactory.build({
      auditEvents: auditEventsStateFactory.build({
        limit: 50,
      }),
    });
    expect(reducer(state, actions.updateAuditEventsLimit(100))).toStrictEqual({
      ...state,
      auditEvents: auditEventsStateFactory.build({
        limit: 100,
      }),
    });
  });

  it("updateAuditEventsErrors", () => {
    const state = jujuStateFactory.build();
    expect(
      reducer(state, actions.updateAuditEventsErrors("Oops!")),
    ).toStrictEqual({
      ...state,
      auditEvents: auditEventsStateFactory.build({
        errors: "Oops!",
      }),
    });
  });

  it("clearControllerData", () => {
    const state = jujuStateFactory.build({
      controllers: {
        "wss://example.com": [controllerFactory.build()],
      },
    });
    expect(reducer(state, actions.clearControllerData())).toStrictEqual({
      ...state,
      controllers: {},
    });
  });

  it("updateControllerList", () => {
    const state = jujuStateFactory.build();
    const controllers = [controllerFactory.build()];
    expect(
      reducer(
        state,
        actions.updateControllerList({
          controllers,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      controllers: {
        "wss://example.com": controllers,
      },
    });
  });

  it("updateCharms", () => {
    const state = jujuStateFactory.build({
      charms: [
        charmInfoFactory.build({ url: "ch:mysql" }),
        charmInfoFactory.build({ url: "ch:ceph" }),
      ],
    });
    const charms = [
      charmInfoFactory.build({ url: "ch:postgres" }),
      charmInfoFactory.build({ url: "ch:ceph" }),
    ];
    expect(
      reducer(
        state,
        actions.updateCharms({
          charms,
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      charms: [
        charmInfoFactory.build({ url: "ch:mysql" }),
        charmInfoFactory.build({ url: "ch:ceph" }),
        charmInfoFactory.build({ url: "ch:postgres" }),
      ],
    });
  });

  it("updateModelFeatures", () => {
    const state = jujuStateFactory.build();
    expect(
      reducer(
        state,
        actions.updateModelFeatures({
          modelUUID: "abc123",
          features: {
            listSecrets: true,
          },
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual(
      jujuStateFactory.build({
        modelFeatures: modelFeaturesStateFactory.build({
          abc123: {
            listSecrets: true,
          },
        }),
      }),
    );
  });

  it("updateSelectedApplications", () => {
    const state = jujuStateFactory.build({
      selectedApplications: {
        mysql: applicationStatusFactory.build(),
      },
    });
    const selectedApplications = {
      ceph: applicationStatusFactory.build({ charm: "ch:ceph" }),
    };
    expect(
      reducer(
        state,
        actions.updateSelectedApplications({
          selectedApplications,
        }),
      ),
    ).toStrictEqual({
      ...state,
      selectedApplications,
    });
  });

  it("secretsLoading", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ loading: false }),
      }),
    });
    expect(
      reducer(
        state,
        actions.secretsLoading({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ loading: true }),
      }),
    });
  });

  it("secretsLoading handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    expect(
      reducer(
        state,
        actions.secretsLoading({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ loading: true }),
      }),
    });
  });

  it("setSecretsErrors", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items: null,
          errors: null,
          loaded: false,
          loading: true,
        }),
      }),
    });
    expect(
      reducer(
        state,
        actions.setSecretsErrors({
          errors: "Uh oh!",
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items: null,
          errors: "Uh oh!",
          loaded: true,
          loading: false,
        }),
      }),
    });
  });

  it("setSecretsErrors handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    expect(
      reducer(
        state,
        actions.setSecretsErrors({
          errors: "Uh oh!",
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items: null,
          errors: "Uh oh!",
          loaded: true,
          loading: false,
        }),
      }),
    });
  });

  it("updateSecrets", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items: null,
          errors: null,
          loaded: false,
          loading: true,
        }),
      }),
    });
    const items = [listSecretResultFactory.build()];
    expect(
      reducer(
        state,
        actions.updateSecrets({
          secrets: items,
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items,
          errors: null,
          loaded: true,
          loading: false,
        }),
      }),
    });
  });

  it("updateSecrets handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    const items = [listSecretResultFactory.build()];
    expect(
      reducer(
        state,
        actions.updateSecrets({
          secrets: items,
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items,
          errors: null,
          loaded: true,
          loading: false,
        }),
      }),
    });
  });

  it("clearSecrets", () => {
    const items = [listSecretResultFactory.build()];
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          items,
          errors: "Uh oh!",
          loaded: true,
          loading: true,
        }),
      }),
    });
    expect(
      reducer(
        state,
        actions.clearSecrets({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build(),
    });
  });

  it("secretsContentLoading", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({ loading: false }),
        }),
      }),
    });
    expect(
      reducer(
        state,
        actions.secretsContentLoading({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({ loading: true }),
        }),
      }),
    });
  });

  it("secretsContentLoading handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    expect(
      reducer(
        state,
        actions.secretsContentLoading({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({ loading: true }),
        }),
      }),
    });
  });

  it("secretsContentLoading handles no existing content state", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ content: undefined }),
      }),
    });
    expect(
      reducer(
        state,
        actions.secretsContentLoading({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({ loading: true }),
        }),
      }),
    });
  });

  it("setSecretsContentErrors", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content: { key: "val" },
            errors: null,
            loaded: false,
            loading: true,
          }),
        }),
      }),
    });
    expect(
      reducer(
        state,
        actions.setSecretsContentErrors({
          errors: "Uh oh!",
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content: null,
            errors: "Uh oh!",
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("setSecretsContentErrors handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    expect(
      reducer(
        state,
        actions.setSecretsContentErrors({
          errors: "Uh oh!",
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content: null,
            errors: "Uh oh!",
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("setSecretsContentErrors handles no existing content state", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ content: undefined }),
      }),
    });
    expect(
      reducer(
        state,
        actions.setSecretsContentErrors({
          errors: "Uh oh!",
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content: null,
            errors: "Uh oh!",
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("clearSecretsContent", () => {
    const content = { key: "val" };
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content,
            errors: "Uh oh!",
            loaded: true,
            loading: true,
          }),
        }),
      }),
    });
    expect(
      reducer(
        state,
        actions.clearSecretsContent({
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build(),
      }),
    });
  });

  it("updateSecretsContent", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content: { oldKey: "oldVal" },
            errors: null,
            loaded: false,
            loading: true,
          }),
        }),
      }),
    });
    const content = { newKey: "newVal" };
    expect(
      reducer(
        state,
        actions.updateSecretsContent({
          content,
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content,
            errors: null,
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("updateSecretsContent handles no existing model", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build(),
    });
    const content = { key: "val" };
    expect(
      reducer(
        state,
        actions.updateSecretsContent({
          content,
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content,
            errors: null,
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("updateSecretsContent handles no existing content state", () => {
    const state = jujuStateFactory.build({
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({ content: undefined }),
      }),
    });
    const content = { key: "val" };
    expect(
      reducer(
        state,
        actions.updateSecretsContent({
          content,
          modelUUID: "abc123",
          wsControllerURL: "wss://test.example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      secrets: secretsStateFactory.build({
        abc123: modelSecretsFactory.build({
          content: modelSecretsContentFactory.build({
            content,
            errors: null,
            loaded: true,
            loading: false,
          }),
        }),
      }),
    });
  });

  it("checkRelation", () => {
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({ allowed: [] }),
    });
    expect(
      reducer(
        state,
        actions.checkRelation({
          tuple,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
          }),
        ],
      }),
    });
  });

  it("checkRelation already exists", () => {
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loaded: true,
          }),
        ],
      }),
    });
    expect(
      reducer(
        state,
        actions.checkRelation({
          tuple,
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
            loaded: false,
          }),
        ],
      }),
    });
  });

  it("addCheckRelation", () => {
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
          }),
        ],
      }),
    });
    expect(
      reducer(state, actions.addCheckRelation({ tuple, allowed: true })),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            allowed: true,
            tuple,
            loading: false,
            loaded: true,
          }),
        ],
      }),
    });
  });

  it("addCheckRelationErrors", () => {
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
          }),
        ],
      }),
    });
    expect(
      reducer(
        state,
        actions.addCheckRelationErrors({ tuple, errors: "Oops!" }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            allowed: null,
            errors: "Oops!",
            loading: false,
            loaded: false,
          }),
        ],
      }),
    });
  });

  it("removeCheckRelation", () => {
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
          }),
          rebacAllowedFactory.build({
            tuple: relationshipTupleFactory.build({
              object: "model-1234",
            }),
          }),
        ],
      }),
    });
    expect(
      reducer(state, actions.removeCheckRelation({ tuple })),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple: relationshipTupleFactory.build({
              object: "model-1234",
            }),
          }),
        ],
      }),
    });
  });

  it("checkRelations", () => {
    const requestId = "123456";
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build(),
    });
    expect(
      reducer(
        state,
        actions.checkRelations({
          requestId,
          tuples: [tuple],
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loading: true,
          }),
        ],
      }),
    });
  });

  it("checkRelations already exists", () => {
    const requestId = "123456";
    const tuple = relationshipTupleFactory.build();
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loaded: true,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loaded: true,
          }),
        ],
      }),
    });
    expect(
      reducer(
        state,
        actions.checkRelations({
          requestId,
          tuples: [tuple],
          wsControllerURL: "wss://example.com",
        }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple,
            loading: true,
            loaded: false,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loading: true,
            loaded: false,
          }),
        ],
      }),
    });
  });

  it("addCheckRelations", () => {
    const requestId = "123456";
    const tuples = [
      relationshipTupleFactory.build({ target_object: "model-1" }),
      relationshipTupleFactory.build({ target_object: "model-2" }),
    ];
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple: tuples[0],
            loading: true,
            allowed: false,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loading: true,
          }),
        ],
      }),
    });
    expect(
      reducer(
        state,
        actions.addCheckRelations({
          requestId,
          tuples,
          permissions: [{ allowed: false }, { allowed: true }],
        }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple: tuples[0],
            loaded: true,
            loading: false,
            allowed: false,
          }),
          rebacAllowedFactory.build({
            tuple: tuples[1],
            loaded: true,
            loading: false,
            allowed: true,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loading: false,
            loaded: true,
          }),
        ],
      }),
    });
  });

  it("addCheckRelationsErrors", () => {
    const requestId = "123456";
    const tuples = [relationshipTupleFactory.build()];
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple: tuples[0],
            loading: true,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            loading: true,
          }),
        ],
      }),
    });
    expect(
      reducer(
        state,
        actions.addCheckRelationsErrors({ requestId, tuples, errors: "Oops!" }),
      ),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        allowed: [
          rebacAllowedFactory.build({
            tuple: tuples[0],
            loading: false,
            loaded: false,
          }),
        ],
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
            errors: ["Oops!"],
            loading: false,
            loaded: false,
          }),
        ],
      }),
    });
  });

  it("removeCheckRelations", () => {
    const requestId = "123456";
    const state = jujuStateFactory.build({
      rebac: rebacState.build({
        relationships: [
          rebacRelationshipFactory.build({
            requestId,
          }),
        ],
      }),
    });
    expect(
      reducer(state, actions.removeCheckRelations({ requestId })),
    ).toStrictEqual({
      ...state,
      rebac: rebacState.build({
        relationships: [],
      }),
    });
  });

  it("addCommandHistory", () => {
    const state = jujuStateFactory.build({
      commandHistory: commandHistoryState.build({
        abc1234: [commandHistoryItem.build({ command: "help" })],
      }),
    });
    expect(
      reducer(
        state,
        actions.addCommandHistory({
          modelUUID: "abc1234",
          historyItem: commandHistoryItem.build({ command: "status" }),
        }),
      ),
    ).toStrictEqual({
      ...state,
      commandHistory: commandHistoryState.build({
        abc1234: [
          commandHistoryItem.build({ command: "help" }),
          commandHistoryItem.build({ command: "status" }),
        ],
      }),
    });
  });
});
