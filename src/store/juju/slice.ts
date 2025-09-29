import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type {
  DestroyModelParams,
  ModelInfoResults,
  UserModelList,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import type {
  ListSecretResult,
  SecretValueResult,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import fastDeepEqual from "fast-deep-equal/es6";

import type { AuditEvent, FindAuditEventsRequest } from "juju/jimm/JIMMV3";
import type {
  CheckRelationResponse,
  CrossModelQueryRequest,
  CrossModelQueryResponse,
  RelationshipTuple,
} from "juju/jimm/JIMMV4";
import type {
  AllWatcherDelta,
  ApplicationInfo,
  FullStatusWithAnnotations,
} from "juju/types";
import { processDeltas } from "juju/watchers";
import { extractCloudName } from "store/juju/utils/models";

import type {
  Controllers,
  JujuState,
  ModelFeatures,
  ModelSecrets,
  SecretsContent,
  ReBACAllowed,
  HistoryItem,
} from "./types";

export const DEFAULT_AUDIT_EVENTS_LIMIT = 50;

type WsControllerURLParam = { wsControllerURL: string };

const DEFAULT_MODEL_SECRETS: ModelSecrets = {
  items: null,
  errors: null,
  loading: false,
  loaded: false,
};

const DEFAULT_MODEL_SECRETS_CONTENT: SecretsContent = {
  content: null,
  errors: null,
  loading: false,
  loaded: false,
};

const getOrSetContentState = (
  state: JujuState,
  modelUUID: string,
): SecretsContent => {
  let modelSecrets = state.secrets[modelUUID];
  modelSecrets ??= state.secrets[modelUUID] = { ...DEFAULT_MODEL_SECRETS };

  let { content } = modelSecrets;
  content ??= modelSecrets.content = { ...DEFAULT_MODEL_SECRETS_CONTENT };
  return content;
};

const defaultRelationState: Omit<ReBACAllowed, "tuple"> = {
  errors: null,
  loaded: false,
  loading: false,
};

const updateCheckRelation = (
  state: JujuState,
  tuple: RelationshipTuple,
  changes: Omit<Partial<ReBACAllowed>, "tuple">,
): void => {
  const existingIndex = state.rebac.allowed.findIndex((relation) =>
    fastDeepEqual(relation.tuple, tuple),
  );
  if (existingIndex >= 0) {
    state.rebac.allowed[existingIndex] = {
      ...state.rebac.allowed[existingIndex],
      ...changes,
    };
  } else {
    state.rebac.allowed.push({
      tuple,
      ...defaultRelationState,
      ...changes,
    });
  }
};

const startCheckRelation = (
  state: JujuState,
  tuple: RelationshipTuple,
): void => {
  updateCheckRelation(state, tuple, {
    errors: null,
    loaded: false,
    loading: true,
  });
};

const slice = createSlice({
  name: "juju",
  initialState: {
    auditEvents: {
      items: null,
      errors: null,
      loaded: false,
      loading: false,
      limit: DEFAULT_AUDIT_EVENTS_LIMIT,
    },
    crossModelQuery: {
      results: null,
      errors: null,
      loaded: false,
      loading: false,
    },
    destroyModel: {},
    commandHistory: {},
    controllers: null,
    models: {},
    modelsError: null,
    modelsLoaded: false,
    modelData: {},
    modelFeatures: {},
    modelWatcherData: {},
    charms: [],
    rebac: {
      allowed: [],
      relationships: [],
    },
    secrets: {},
    selectedApplications: [],
  } as JujuState,
  reducers: {
    updateModelList: (
      state,
      action: PayloadAction<{ models: UserModelList } & WsControllerURLParam>,
    ) => {
      // Rebuild the models and modelData lists to keep the state synchronized between additions and removals.
      const modelList: JujuState["models"] = {};
      const modelDataList: JujuState["modelData"] = {};
      const userModels = action.payload.models["user-models"] ?? [];
      userModels.forEach((model) => {
        const { uuid } = model.model;
        modelList[uuid] = {
          name: model.model.name,
          ownerTag: model.model["owner-tag"],
          type: model.model.type,
          uuid,
          wsControllerURL: action.payload.wsControllerURL,
        };
        if (state.modelData[uuid]) {
          modelDataList[uuid] = state.modelData[uuid];
        }
      });
      state.models = modelList;
      state.modelData = modelDataList;
      state.modelsLoaded = true;
    },
    updateModelStatus: (
      state,
      action: PayloadAction<
        {
          modelUUID: string;
          status: FullStatusWithAnnotations;
        } & WsControllerURLParam
      >,
    ) => {
      const { modelUUID } = action.payload;
      // There is some data that we don't want to store because it changes
      // too often causing needless re-renders and is currently irrelevant
      // like controllerTimestamp.
      const model = {
        ...(state.modelData[modelUUID] ?? {}),
        applications: action.payload.status.applications,
        machines: action.payload.status.machines,
        model: action.payload.status.model,
        offers: action.payload.status.offers,
        relations: action.payload.status.relations,
        "remote-applications": action.payload.status["remote-applications"],
        storage: action.payload.status.storage,
      };
      // The status doesn't contain a top level uuid and when this data is
      // fetched it doesn't contain the UUID.
      model.uuid = modelUUID;
      state.modelData[modelUUID] = model;
    },
    updateModelInfo: (
      state,
      action: PayloadAction<
        { modelInfo: ModelInfoResults } & WsControllerURLParam
      >,
    ) => {
      const modelInfo = action.payload.modelInfo.results[0].result;
      // There don't appear to be any irrelevant data in the modelInfo so
      // we overwrite the whole object every time it changes even though
      // mostly that'll just be status timestamps.
      const modelData = modelInfo && state.modelData?.[modelInfo?.uuid];
      // If any of the status requests timeout then it's possible the data
      // won't be available. Just abandon saving any data in that case.
      // This will go away with the new API.
      if (state.modelData && modelData) {
        state.modelData[modelInfo.uuid].info = modelInfo;
      }
    },
    updateModelFeatures: (
      state,
      action: PayloadAction<
        { modelUUID: string; features: ModelFeatures } & WsControllerURLParam
      >,
    ) => {
      state.modelFeatures[action.payload.modelUUID] = action.payload.features;
    },
    updateModelsError: (
      state,
      action: PayloadAction<
        { modelsError: null | string } & WsControllerURLParam
      >,
    ) => {
      state.modelsError = action.payload.modelsError;
    },
    clearModelData: (state) => {
      state.modelData = {};
      state.models = {};
      state.modelFeatures = {};
      state.modelsError = null;
      state.modelsLoaded = false;
    },
    clearControllerData: (state) => {
      state.controllers = {};
    },
    destroyModels: (
      state,
      action: PayloadAction<
        {
          modelParams: DestroyModelParams[];
        } & WsControllerURLParam
      >,
    ) => {
      action.payload.modelParams.forEach(
        (model) =>
          (state.destroyModel[model["model-tag"]] = {
            loading: false,
            errors: null,
            loaded: false,
          }),
      );
    },
    updateDestroyModelsLoading: (
      state,
      action: PayloadAction<
        {
          modelTags: string[];
        } & WsControllerURLParam
      >,
    ) => {
      action.payload.modelTags.forEach(
        (modelTag) =>
          (state.destroyModel[modelTag] = {
            ...state.destroyModel[modelTag],
            loading: true,
          }),
      );
    },
    updateModelsDestroyed: (
      state,
      action: PayloadAction<
        {
          modelTags: string[];
        } & WsControllerURLParam
      >,
    ) => {
      action.payload.modelTags.forEach(
        (modelTag) =>
          (state.destroyModel[modelTag] = {
            ...state.destroyModel[modelTag],
            loading: false,
            errors: null,
            loaded: true,
          }),
      );
    },
    clearDestroyedModel: (
      state,
      action: PayloadAction<
        {
          modelTag: string;
        } & WsControllerURLParam
      >,
    ) => {
      delete state.destroyModel[action.payload.modelTag];
    },
    destroyModelErrors: (
      state,
      action: PayloadAction<{
        errors: string[][];
      }>,
    ) => {
      action.payload.errors.forEach(
        ([modelTag, error]) =>
          (state.destroyModel[modelTag] = {
            ...state.destroyModel[modelTag],
            loading: false,
            errors: error,
            loaded: true,
          }),
      );
    },
    // This action can be dispatched to fetch audit events which is handled in
    // the model-poller middleware.
    fetchAuditEvents: (
      state,
      _action: PayloadAction<FindAuditEventsRequest & WsControllerURLParam>,
    ) => {
      state.auditEvents.loading = true;
    },
    updateAuditEvents: (state, { payload }: PayloadAction<AuditEvent[]>) => {
      state.auditEvents.items = payload;
      state.auditEvents.errors = null;
      state.auditEvents.loaded = true;
      state.auditEvents.loading = false;
    },
    clearAuditEvents: (state) => {
      state.auditEvents.items = null;
      state.auditEvents.errors = null;
      state.auditEvents.loaded = false;
      state.auditEvents.loading = false;
    },
    updateAuditEventsLimit: (state, { payload }: PayloadAction<number>) => {
      state.auditEvents.limit = payload;
    },
    updateAuditEventsErrors: (
      state,
      { payload }: PayloadAction<null | string>,
    ) => {
      state.auditEvents.errors = payload;
    },
    fetchCrossModelQuery: (
      state,
      _action: PayloadAction<
        Pick<CrossModelQueryRequest, "query"> & WsControllerURLParam
      >,
    ) => {
      state.crossModelQuery.loading = true;
    },
    updateCrossModelQueryResults: (
      state,
      { payload }: PayloadAction<CrossModelQueryResponse["results"]>,
    ) => {
      state.crossModelQuery.results = payload;
      state.crossModelQuery.errors = null;
      state.crossModelQuery.loaded = true;
      state.crossModelQuery.loading = false;
    },
    updateCrossModelQueryErrors: (
      state,
      { payload }: PayloadAction<CrossModelQueryResponse["errors"] | string>,
    ) => {
      state.crossModelQuery.results = null;
      state.crossModelQuery.errors = payload;
      state.crossModelQuery.loaded = true;
      state.crossModelQuery.loading = false;
    },
    clearCrossModelQuery: (state) => {
      state.crossModelQuery.results = null;
      state.crossModelQuery.errors = null;
      state.crossModelQuery.loaded = false;
      state.crossModelQuery.loading = false;
    },
    updateControllerList: (
      state,
      action: PayloadAction<
        { controllers: Controllers[0] } & WsControllerURLParam
      >,
    ) => {
      const controllers = state.controllers ?? {};
      controllers[action.payload.wsControllerURL] = action.payload.controllers;
      state.controllers = controllers;
    },
    // This is required for Juju versions before 3.2.
    populateMissingAllWatcherData: (
      state,
      action: PayloadAction<{ uuid: string; status: FullStatus }>,
    ) => {
      state.modelWatcherData ??= {};
      const model = state.modelWatcherData[action.payload.uuid];
      if (!model) {
        return;
      }
      state.modelWatcherData[action.payload.uuid].model = {
        ...(state.modelWatcherData[action.payload.uuid]?.model ?? {}),
        // Match the data returned by the Juju 3.2 watcher:
        cloud: extractCloudName(action.payload.status.model["cloud-tag"]),
        type: action.payload.status.model.type,
        "cloud-region": action.payload.status.model.region,
        version: action.payload.status.model.version,
      };
    },
    processAllWatcherDeltas: (
      state,
      action: PayloadAction<AllWatcherDelta[]>,
    ) => {
      state.modelWatcherData = processDeltas(
        state.modelWatcherData,
        action.payload,
      );
    },
    updateCharms: (
      state,
      action: PayloadAction<
        { charms: Charm[] } & Partial<WsControllerURLParam>
      >,
    ) => {
      action.payload.charms = action.payload.charms.filter((charm) => {
        return !state.charms.some((stateCharm) => stateCharm.url === charm.url);
      });
      state.charms = [...state.charms, ...action.payload.charms];
    },
    updateSelectedApplications: (
      state,
      action: PayloadAction<{ selectedApplications: ApplicationInfo[] }>,
    ) => {
      state.selectedApplications = action.payload.selectedApplications;
    },
    secretsLoading: (
      state,
      action: PayloadAction<{ modelUUID: string } & WsControllerURLParam>,
    ) => {
      if (!state.secrets[action.payload.modelUUID]) {
        state.secrets[action.payload.modelUUID] = { ...DEFAULT_MODEL_SECRETS };
      }
      state.secrets[action.payload.modelUUID].loading = true;
    },
    updateSecrets: (
      state,
      action: PayloadAction<
        {
          modelUUID: string;
          secrets: ListSecretResult[];
        } & WsControllerURLParam
      >,
    ) => {
      if (!state.secrets[action.payload.modelUUID]) {
        state.secrets[action.payload.modelUUID] = { ...DEFAULT_MODEL_SECRETS };
      }
      state.secrets[action.payload.modelUUID].items = action.payload.secrets;
      state.secrets[action.payload.modelUUID].loading = false;
      state.secrets[action.payload.modelUUID].loaded = true;
    },
    setSecretsErrors: (
      state,
      action: PayloadAction<
        { modelUUID: string; errors: string } & WsControllerURLParam
      >,
    ) => {
      if (!state.secrets[action.payload.modelUUID]) {
        state.secrets[action.payload.modelUUID] = { ...DEFAULT_MODEL_SECRETS };
      }
      state.secrets[action.payload.modelUUID].errors = action.payload.errors;
      state.secrets[action.payload.modelUUID].loading = false;
      state.secrets[action.payload.modelUUID].loaded = true;
    },
    clearSecrets: (
      state,
      action: PayloadAction<{ modelUUID: string } & WsControllerURLParam>,
    ) => {
      delete state.secrets[action.payload.modelUUID];
    },
    secretsContentLoading: (
      state,
      action: PayloadAction<{ modelUUID: string } & WsControllerURLParam>,
    ) => {
      const content = getOrSetContentState(state, action.payload.modelUUID);
      content.loading = true;
    },
    updateSecretsContent: (
      state,
      action: PayloadAction<
        {
          modelUUID: string;
          content: SecretValueResult["data"];
        } & WsControllerURLParam
      >,
    ) => {
      const content = getOrSetContentState(state, action.payload.modelUUID);
      content.content = action.payload.content;
      content.errors = null;
      content.loading = false;
      content.loaded = true;
    },
    setSecretsContentErrors: (
      state,
      action: PayloadAction<
        { modelUUID: string; errors: string } & WsControllerURLParam
      >,
    ) => {
      const content = getOrSetContentState(state, action.payload.modelUUID);
      content.content = null;
      content.errors = action.payload.errors;
      content.loading = false;
      content.loaded = true;
    },
    clearSecretsContent: (
      state,
      action: PayloadAction<{ modelUUID: string } & WsControllerURLParam>,
    ) => {
      const secrets = state.secrets[action.payload.modelUUID];
      if (secrets) {
        delete secrets.content;
      }
    },
    checkRelation: (
      state,
      {
        payload,
      }: PayloadAction<{ tuple: RelationshipTuple } & WsControllerURLParam>,
    ) => {
      startCheckRelation(state, payload.tuple);
    },
    addCheckRelation: (
      state,
      {
        payload,
      }: PayloadAction<{ tuple: RelationshipTuple; allowed: boolean }>,
    ) => {
      updateCheckRelation(state, payload.tuple, {
        allowed: payload.allowed,
        errors: null,
        loaded: true,
        loading: false,
      });
    },
    addCheckRelationErrors: (
      state,
      { payload }: PayloadAction<{ tuple: RelationshipTuple; errors: string }>,
    ) => {
      updateCheckRelation(state, payload.tuple, {
        allowed: null,
        errors: payload.errors,
        loaded: false,
        loading: false,
      });
    },
    removeCheckRelation: (
      state,
      { payload }: PayloadAction<{ tuple: RelationshipTuple }>,
    ) => {
      const existingIndex = state.rebac.allowed.findIndex((relation) =>
        fastDeepEqual(relation.tuple, payload.tuple),
      );
      if (existingIndex >= 0) {
        state.rebac.allowed.splice(existingIndex, 1);
      }
    },
    checkRelations: (
      state,
      {
        payload,
      }: PayloadAction<
        {
          tuples: RelationshipTuple[];
          requestId: string;
        } & WsControllerURLParam
      >,
    ) => {
      payload.tuples.forEach((tuple) => {
        startCheckRelation(state, tuple);
      });
      const checkState = {
        errors: null,
        requestId: payload.requestId,
        loaded: false,
        loading: true,
      };
      const existingIndex = state.rebac.relationships.findIndex(
        (relation) => relation.requestId === payload.requestId,
      );
      if (existingIndex >= 0) {
        state.rebac.relationships[existingIndex] = checkState;
      } else {
        state.rebac.relationships.push(checkState);
      }
    },
    addCheckRelations: (
      state,
      {
        payload,
      }: PayloadAction<{
        permissions: CheckRelationResponse[];
        requestId: string;
        tuples: RelationshipTuple[];
      }>,
    ) => {
      payload.tuples.forEach((tuple, i) => {
        updateCheckRelation(state, tuple, {
          ...(payload.permissions[i] ? payload.permissions[i] : {}),
          loading: false,
          loaded: true,
        });
      });
      const existingIndex = state.rebac.relationships.findIndex(
        (relation) => relation.requestId === payload.requestId,
      );
      const checkState = {
        errors: null,
        loaded: true,
        loading: false,
      };
      if (existingIndex >= 0) {
        state.rebac.relationships[existingIndex] = {
          ...state.rebac.relationships[existingIndex],
          ...checkState,
        };
      } else {
        state.rebac.relationships.push({
          requestId: payload.requestId,
          ...checkState,
        });
      }
    },
    addCheckRelationsErrors: (
      state,
      {
        payload,
      }: PayloadAction<{
        requestId: string;
        errors: string;
        tuples: RelationshipTuple[];
      }>,
    ) => {
      payload.tuples.forEach((tuple) => {
        updateCheckRelation(state, tuple, {
          loading: false,
          loaded: false,
        });
      });
      const existingIndex = state.rebac.relationships.findIndex(
        (relation) => relation.requestId === payload.requestId,
      );
      const checkState = {
        loaded: false,
        loading: false,
        errors: [payload.errors],
      };
      if (existingIndex >= 0) {
        state.rebac.relationships[existingIndex] = {
          ...state.rebac.relationships[existingIndex],
          ...checkState,
        };
      } else {
        state.rebac.relationships.push({
          requestId: payload.requestId,
          ...checkState,
        });
      }
    },
    removeCheckRelations: (
      state,
      { payload }: PayloadAction<{ requestId: string }>,
    ) => {
      const existingIndex = state.rebac.relationships.findIndex(
        (relation) => relation.requestId === payload.requestId,
      );
      if (existingIndex >= 0) {
        state.rebac.relationships.splice(existingIndex, 1);
      }
    },
    addCommandHistory: (
      state,
      {
        payload: { modelUUID, historyItem },
      }: PayloadAction<{
        modelUUID: string;
        historyItem: HistoryItem;
      }>,
    ) => {
      if (!(modelUUID in state.commandHistory)) {
        state.commandHistory[modelUUID] = [];
      }
      state.commandHistory[modelUUID].push(historyItem);
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
