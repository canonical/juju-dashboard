import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
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
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
  modelFeaturesFactory,
  modelFeaturesStateFactory,
  rebacAllowedFactory,
  relationshipTupleFactory,
  secretRevisionFactory,
  modelSecretsContentFactory,
  rebacState,
  rebacRelationshipFactory,
  commandHistoryState,
  commandHistoryItem,
} from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  relationChangeDeltaFactory,
  unitAgentStatusFactory,
  unitChangeDeltaFactory,
  workloadStatusFactory,
  modelWatcherModelInfoFactory,
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
  getControllersCount,
  getModelCredential,
  getSecretsErrors,
  getSecretsLoaded,
  getSecretsLoading,
  getSecretsState,
  getModelSecrets,
  getModelFeaturesState,
  getCanListSecrets,
  getModelFeatures,
  getCanManageSecrets,
  getSecretByURI,
  getSecretsContentState,
  getSecretsContent,
  getSecretsContentErrors,
  getSecretsContentLoaded,
  getSecretsContentLoading,
  isKubernetesModel,
  getReBACAllowedState,
  hasReBACPermission,
  getSecretLatestRevision,
  getReBACPermissionLoading,
  getReBACPermissionLoaded,
  getReBACRelationshipsState,
  getReBACRelationships,
  getReBACRelationshipsLoading,
  getReBACRelationshipsLoaded,
  getReBACPermissions,
  getReBACPermission,
  getCommandHistory,
  getReBACPermissionErrors,
  getModelUUIDs,
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
        }),
      ),
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
        }),
      ),
    ).toStrictEqual(items);
  });

  it("getAuditEventsLoaded", () => {
    expect(
      getAuditEventsLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ loaded: true }),
          }),
        }),
      ),
    ).toBe(true);
  });

  it("getAuditEventsLoading", () => {
    expect(
      getAuditEventsLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ loading: true }),
          }),
        }),
      ),
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
        }),
      ),
    ).toStrictEqual(["eggman", "spaceman"]);
  });

  it("getAuditEventsModels", () => {
    const items = [
      auditEventFactory.build({ model: "model1" }),
      auditEventFactory.build({ model: "model2" }),
      auditEventFactory.build({ model: "model2" }),
      auditEventFactory.build(),
    ];
    expect(
      getAuditEventsModels(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        }),
      ),
    ).toStrictEqual(["model1", "model2"]);
  });

  it("getAuditEventsFacades", () => {
    const items = [
      auditEventFactory.build({ "facade-name": "Client" }),
      auditEventFactory.build({ "facade-name": "Client" }),
      auditEventFactory.build({ "facade-name": "Admin" }),
      auditEventFactory.build(),
    ];
    expect(
      getAuditEventsFacades(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        }),
      ),
    ).toStrictEqual(["Client", "Admin"]);
  });

  it("getAuditEventsMethods", () => {
    const items = [
      auditEventFactory.build({ "facade-method": "Login" }),
      auditEventFactory.build({ "facade-method": "Logout" }),
      auditEventFactory.build({ "facade-method": "Login" }),
      auditEventFactory.build(),
    ];
    expect(
      getAuditEventsMethods(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            auditEvents: auditEventsStateFactory.build({ items }),
          }),
        }),
      ),
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
        }),
      ),
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
        }),
      ),
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
        }),
      ),
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
        }),
      ),
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
        }),
      ),
    ).toStrictEqual(true);
  });

  it("getSecretsState", () => {
    const secrets = secretsStateFactory.build();
    expect(
      getSecretsState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets,
          }),
        }),
      ),
    ).toStrictEqual(secrets);
  });

  it("getModelSecrets", () => {
    const items = [listSecretResultFactory.build()];
    expect(
      getModelSecrets(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({ items }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(items);
  });

  it("getSecretByURI", () => {
    const items = [
      listSecretResultFactory.build({ uri: "secret:aabbccdd" }),
      listSecretResultFactory.build({ uri: "secret:eeffgghh" }),
    ];
    expect(
      getSecretByURI(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({ items }),
              def456: modelSecretsFactory.build({
                items: [
                  listSecretResultFactory.build({
                    uri: "secret:aabbccdd",
                    label: "other-model",
                  }),
                ],
              }),
            }),
          }),
        }),
        "abc123",
        "secret:aabbccdd",
      ),
    ).toStrictEqual(items[0]);
  });

  it("getSecretLatestRevision", () => {
    const items = [
      listSecretResultFactory.build({ uri: "secret:eeffgghh" }),
      listSecretResultFactory.build({
        uri: "secret:aabbccdd",
        label: "other-model",
        "latest-revision": 3,
        revisions: [
          secretRevisionFactory.build({ revision: 1 }),
          secretRevisionFactory.build({ revision: 2 }),
        ],
      }),
    ];
    expect(
      getSecretLatestRevision(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({ items }),
              def456: modelSecretsFactory.build({
                items: [
                  listSecretResultFactory.build({
                    uri: "secret:aabbccdd",
                    label: "other-model",
                    "latest-revision": 3,
                    revisions: [
                      secretRevisionFactory.build({ revision: 1 }),
                      secretRevisionFactory.build({ revision: 2 }),
                    ],
                  }),
                ],
              }),
            }),
          }),
        }),
        "abc123",
        "secret:aabbccdd",
      ),
    ).toStrictEqual(2);
  });

  it("getSecretsErrors", () => {
    const errors = "Uh oh!";
    expect(
      getSecretsErrors(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                errors,
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(errors);
  });

  it("getSecretsLoaded", () => {
    expect(
      getSecretsLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                loaded: true,
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(true);
  });

  it("getSecretsLoading", () => {
    expect(
      getSecretsLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                loading: true,
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(true);
  });

  it("getSecretsContentState", () => {
    const content = modelSecretsContentFactory.build({
      loaded: true,
    });
    expect(
      getSecretsContentState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                content,
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(content);
  });

  it("getSecretsContent", () => {
    const content = {
      key: "val",
    };
    expect(
      getSecretsContent(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                content: modelSecretsContentFactory.build({
                  content,
                }),
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(content);
  });

  it("getSecretsContentErrors", () => {
    const errors = "Uh oh!";
    expect(
      getSecretsContentErrors(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                content: modelSecretsContentFactory.build({
                  errors,
                }),
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(errors);
  });

  it("getSecretsContentLoading", () => {
    expect(
      getSecretsContentLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                content: modelSecretsContentFactory.build({
                  loading: true,
                }),
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(true);
  });

  it("getSecretsContentLoaded", () => {
    expect(
      getSecretsContentLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            secrets: secretsStateFactory.build({
              abc123: modelSecretsFactory.build({
                content: modelSecretsContentFactory.build({
                  loaded: true,
                }),
              }),
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(true);
  });

  it("getModelFeaturesState", () => {
    const modelFeatures = modelFeaturesStateFactory.build();
    expect(
      getModelFeaturesState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelFeatures,
          }),
        }),
      ),
    ).toStrictEqual(modelFeatures);
  });

  it("getModelFeatures", () => {
    const modelFeatures = modelFeaturesFactory.build({
      listSecrets: true,
      manageSecrets: true,
    });
    expect(
      getModelFeatures(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelFeatures: modelFeaturesStateFactory.build({
              abc123: modelFeatures,
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(modelFeatures);
  });

  it("getCanListSecrets", () => {
    const modelFeatures = modelFeaturesFactory.build({
      listSecrets: true,
    });
    expect(
      getCanListSecrets(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelFeatures: modelFeaturesStateFactory.build({
              abc123: modelFeatures,
            }),
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(true);
  });

  it("getCanManageSecrets", () => {
    const modelFeatures = modelFeaturesFactory.build({
      manageSecrets: true,
    });
    expect(
      getCanManageSecrets(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelFeatures: modelFeaturesStateFactory.build({
              abc123: modelFeatures,
            }),
          }),
        }),
        "abc123",
      ),
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
        }),
      ),
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
        }),
      ),
    ).toStrictEqual(controllers);
  });

  it("getReBACAllowedState", () => {
    const allowed = [
      rebacAllowedFactory.build({
        tuple: relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        }),
        allowed: true,
      }),
    ];
    expect(
      getReBACAllowedState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed,
            },
          }),
        }),
      ),
    ).toStrictEqual(allowed);
  });

  it("getReBACPermissionLoading exists", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      getReBACPermissionLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                rebacAllowedFactory.build({
                  tuple,
                  loading: true,
                }),
              ],
            },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(true);
  });

  it("getReBACPermission", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    const allowed = rebacAllowedFactory.build({
      tuple,
      loading: true,
    });
    expect(
      getReBACPermission(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                allowed,
                rebacAllowedFactory.build({
                  tuple: relationshipTupleFactory.build({
                    target_object: "model-not-a-match",
                  }),
                  loading: true,
                }),
              ],
            },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(allowed);
  });

  it("getReBACPermissions", () => {
    const tuples = [
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        relation: JIMMRelation.ADMINISTRATOR,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      }),
      relationshipTupleFactory.build({
        object: "user-eggman@external",
        relation: JIMMRelation.WRITER,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      }),
    ];
    const allowed = [
      rebacAllowedFactory.build({
        tuple: tuples[0],
        loading: true,
      }),
      rebacAllowedFactory.build({
        tuple: tuples[1],
        loading: false,
      }),
    ];
    expect(
      getReBACPermissions(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                ...allowed,
                rebacAllowedFactory.build({
                  tuple: relationshipTupleFactory.build({
                    target_object: "model-not-a-match",
                  }),
                  loading: true,
                }),
              ],
            },
          }),
        }),
        tuples,
      ),
    ).toStrictEqual(allowed);
  });

  it("getReBACPermissionLoading doesn't exist", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      getReBACPermissionLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: { allowed: [] },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(false);
  });

  it("getReBACPermissionLoaded exists", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      getReBACPermissionLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                rebacAllowedFactory.build({
                  tuple,
                  loaded: true,
                }),
              ],
            },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(true);
  });

  it("getReBACPermissionLoaded doesn't exist", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      getReBACPermissionLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: { allowed: [] },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(false);
  });

  it("getReBACPermissionErrors exists", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      getReBACPermissionErrors(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                rebacAllowedFactory.build({
                  tuple,
                  errors: "Uh oh!",
                }),
              ],
            },
          }),
        }),
        tuple,
      ),
    ).toEqual("Uh oh!");
  });

  it("hasReBACPermission exists", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      hasReBACPermission(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: {
              allowed: [
                rebacAllowedFactory.build({
                  tuple,
                  allowed: true,
                }),
              ],
            },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(true);
  });

  it("hasReBACPermission doesn't exist", () => {
    const tuple = relationshipTupleFactory.build({
      object: "user-eggman@external",
      relation: JIMMRelation.ADMINISTRATOR,
      target_object: JIMMTarget.JIMM_CONTROLLER,
    });
    expect(
      hasReBACPermission(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: { allowed: [] },
          }),
        }),
        tuple,
      ),
    ).toStrictEqual(false);
  });

  it("getReBACRelationshipsState", () => {
    const relationships = [rebacRelationshipFactory.build()];
    expect(
      getReBACRelationshipsState(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships,
            }),
          }),
        }),
      ),
    ).toStrictEqual(relationships);
  });

  it("getReBACRelationships exists", () => {
    const requestId = "123456";
    const relationship = rebacRelationshipFactory.build({
      requestId,
    });
    expect(
      getReBACRelationships(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [relationship],
            }),
          }),
        }),
        requestId,
      ),
    ).toStrictEqual(relationship);
  });

  it("getReBACRelationships doesn't exist", () => {
    expect(
      getReBACRelationships(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [],
            }),
          }),
        }),
        "12345",
      ),
    ).toBeUndefined();
  });

  it("getReBACRelationshipsLoading exists", () => {
    const requestId = "123456";
    expect(
      getReBACRelationshipsLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [
                rebacRelationshipFactory.build({
                  requestId,
                  loading: true,
                }),
              ],
            }),
          }),
        }),
        requestId,
      ),
    ).toStrictEqual(true);
  });

  it("getReBACRelationshipsLoading doesn't exist", () => {
    expect(
      getReBACRelationshipsLoading(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [],
            }),
          }),
        }),
        "123456",
      ),
    ).toStrictEqual(false);
  });

  it("getReBACRelationshipsLoaded exists", () => {
    const requestId = "123456";
    expect(
      getReBACRelationshipsLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [
                rebacRelationshipFactory.build({
                  requestId,
                  loaded: true,
                }),
              ],
            }),
          }),
        }),
        requestId,
      ),
    ).toStrictEqual(true);
  });

  it("getReBACRelationshipsLoaded doesn't exist", () => {
    expect(
      getReBACRelationshipsLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            rebac: rebacState.build({
              relationships: [],
            }),
          }),
        }),
        "123456",
      ),
    ).toStrictEqual(false);
  });

  describe("getControllersCount", () => {
    it("without controllers", () => {
      expect(
        getControllersCount(
          rootStateFactory.build({
            juju: jujuStateFactory.build({
              controllers: null,
            }),
          }),
        ),
      ).toStrictEqual(0);
    });

    it("with controllers", () => {
      const controllers = {
        "wss://example.com": [
          controllerFactory.build({
            path: "/",
            uuid: "abc123",
            version: "1",
          }),
          controllerFactory.build({
            path: "/",
            uuid: "abc123",
            version: "2",
          }),
        ],
        "wss://example2.com": [
          controllerFactory.build({
            path: "/",
            uuid: "abc123",
            version: "3",
          }),
        ],
      };
      expect(
        getControllersCount(
          rootStateFactory.build({
            juju: jujuStateFactory.build({
              controllers,
            }),
          }),
        ),
      ).toStrictEqual(3);
    });
  });

  it("getModelWatcherDataByUUID", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelWatcherDataByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(modelWatcherData.abc123);
  });

  it("getModelInfo", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelInfo(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(modelWatcherData.abc123.model);
  });

  it("getModelUUID from model name", () => {
    expect(
      getModelUUID(
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
        }),
        "test-model",
      ),
    ).toStrictEqual("abc123");
  });

  it("getModelUUID from model and owner names", () => {
    expect(
      getModelUUID(
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
        }),
        "eggman/test-model",
      ),
    ).toStrictEqual("abc123");
  });

  it("getModelUUID handles incorrect owner name", () => {
    expect(
      getModelUUID(
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
        }),
        "eggman/test-model",
      ),
    ).toBeNull();
  });

  it("getModelUUIDs handles incorrect owner name", () => {
    expect(
      getModelUUIDs(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build(),
              def456: modelDataFactory.build(),
            },
          }),
        }),
      ),
    ).toStrictEqual(["abc123", "def456"]);
  });

  it("getModelStatus handles incorrect owner name", () => {
    const model = modelDataFactory.build();
    expect(
      getModelStatus(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData: {
              abc123: model,
            },
          }),
        }),
        "abc123",
      ),
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
      getGroupedByStatusAndFilteredModelData(state, {
        cloud: ["aws", "google"],
      }),
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
      getGroupedByCloudAndFilteredModelData(state, {
        cloud: ["aws", "google"],
      }),
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
      getGroupedByOwnerAndFilteredModelData(state, {
        cloud: ["aws", "google"],
      }),
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
    expect(getControllerDataByUUID(state, "controller123")).toStrictEqual([
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
    expect(getCharms(state)).toStrictEqual([
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
    expect(getSelectedApplications(state)).toStrictEqual(
      state.juju.selectedApplications,
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
      getSelectedApplications(state, "ch:amd64/focal/redis-k8s"),
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
    expect(getSelectedCharm(state, "ch:amd64/focal/redis-k8s")).toStrictEqual(
      charmInfoFactory.build({
        meta: { name: "Redis k8s" },
        url: "ch:amd64/focal/redis-k8s",
      }),
    );
  });

  it("getModelUUIDFromList", () => {
    expect(
      getModelUUIDFromList(
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
        }),
        "a model",
        "eggman@external",
      ),
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
      getModelAnnotations(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
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
      getModelApplications(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
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
        }),
      ),
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
        "abc123",
      ),
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
        }),
      ),
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
        "abc123",
      ),
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
        "abc123",
      ),
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
        "abc123",
      ),
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
        "abc123",
      ),
    ).toBe("superuser");
  });

  it("getModelCredential", () => {
    expect(
      getModelCredential(
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
                  "cloud-credential-tag": "cloudcred-google_eggman_juju",
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
        "abc123",
      ),
    ).toBe("eggman");
  });

  it("getModelControllerDataByUUID", () => {
    const controllers = {
      "wss://example.com/api": [controllerFactory.build({ uuid: "abc123" })],
      "wss://test.com/api": [controllerFactory.build({ uuid: "def456" })],
    };
    expect(
      getModelControllerDataByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            controllers,
          }),
        }),
        "def456",
      ),
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
        }),
      ),
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
      getModelUnits(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
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
      getModelRelations(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
    ).toStrictEqual(modelWatcherData.abc123.relations);
  });

  it("getModelMachines", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: { "0": machineChangeDeltaFactory.build() },
      }),
    };
    expect(
      getModelMachines(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
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
      getAllModelApplicationStatus(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        }),
        "abc123",
      ),
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
        }),
      ),
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
        getFilteredModelData(state, { cloud: ["aws", "google"] }),
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
        getFilteredModelData(state, {
          credential: ["eggman", "eggman@external"],
        }),
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
        getFilteredModelData(state, { region: ["west", "north"] }),
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
        getFilteredModelData(state, { owner: ["eggman", "eggman@external"] }),
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
      expect(getFilteredModelData(state, { custom: ["match"] })).toStrictEqual({
        a1: modelData.a1,
        b2: modelData.b2,
        c3: modelData.c3,
        d4: modelData.d4,
        e5: modelData.e5,
      });
    });
  });

  describe("isKubernetesModel", () => {
    it("handles non-kubernetes models", () => {
      const modelWatcherData = {
        abc123: modelWatcherModelDataFactory.build(),
      };
      expect(
        isKubernetesModel(
          rootStateFactory.build({
            juju: jujuStateFactory.build({
              modelWatcherData,
            }),
          }),
          "abc123",
        ),
      ).toBe(false);
    });

    it("handles kubernetes in model watcher info", () => {
      const modelWatcherData = {
        abc123: modelWatcherModelDataFactory.build({
          model: modelWatcherModelInfoFactory.build({
            type: "kubernetes",
          }),
        }),
      };
      expect(
        isKubernetesModel(
          rootStateFactory.build({
            juju: jujuStateFactory.build({
              modelWatcherData,
            }),
          }),
          "abc123",
        ),
      ).toBe(true);
    });

    it("handles kubernetes in model data", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "provider-type": "kubernetes",
          }),
        }),
      };
      expect(
        isKubernetesModel(
          rootStateFactory.build({
            juju: jujuStateFactory.build({
              modelData,
            }),
          }),
          "abc123",
        ),
      ).toBe(true);
    });
  });

  it("getCommandHistory", () => {
    const commandHistory = commandHistoryState.build({
      abc1234: [commandHistoryItem.build()],
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        commandHistory,
      }),
    });
    expect(getCommandHistory(state)).toStrictEqual(commandHistory);
  });
});
