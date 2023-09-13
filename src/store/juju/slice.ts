import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type {
  ModelInfoResults,
  UserModelList,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import {
  type CrossModelQueryRequest,
  type CrossModelQueryFullResponse,
  isCrossModelQueryResponse,
} from "juju/jimm/JIMMV4";
import type {
  AllWatcherDelta,
  ApplicationInfo,
  FullStatusWithAnnotations,
} from "juju/types";
import { processDeltas } from "juju/watchers";

import type { Controllers, JujuState } from "./types";

type WsControllerURLParam = {
  wsControllerURL: string;
};

const slice = createSlice({
  name: "juju",
  initialState: {
    crossModelQuery: {
      results: null,
      errors: null,
      loaded: false,
      loading: false,
    },
    controllers: null,
    models: {},
    modelsLoaded: false,
    modelData: {},
    modelWatcherData: {},
    charms: [],
    selectedApplications: [],
  } as JujuState,
  reducers: {
    updateModelList: (
      state,
      action: PayloadAction<{
        models: UserModelList;
        wsControllerURL: string;
      }>
    ) => {
      const modelList = state.models;
      let userModels = action.payload.models["user-models"];
      if (!userModels) {
        userModels = [];
      }
      userModels.forEach((model) => {
        modelList[model.model.uuid] = {
          name: model.model.name,
          ownerTag: model.model["owner-tag"],
          type: model.model.type,
          uuid: model.model.uuid,
          wsControllerURL: action.payload.wsControllerURL,
        };
      });
      state.models = modelList;
      state.modelsLoaded = true;
    },
    updateModelStatus: (
      state,
      action: PayloadAction<{
        modelUUID: string;
        status: FullStatusWithAnnotations;
        wsControllerURL: string;
      }>
    ) => {
      const modelUUID = action.payload.modelUUID;
      if (!state.modelData) {
        state.modelData = {};
      }
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
      };
      // The status doesn't contain a top level uuid and when this data is
      // fetched it doesn't contain the UUID.
      model.uuid = modelUUID;
      state.modelData[modelUUID] = model;
    },
    updateModelInfo: (
      state,
      action: PayloadAction<{
        modelInfo: ModelInfoResults;
        wsControllerURL: string;
      }>
    ) => {
      const modelInfo = action.payload.modelInfo.results[0].result;
      // There don't appear to be any irrelevant data in the modelInfo so
      // we overwrite the whole object every time it changes even though
      // mostly that'll just be status timestamps.
      const modelData = state.modelData?.[modelInfo?.uuid];
      // If any of the status requests timeout then it's possible the data
      // won't be available. Just abandon saving any data in that case.
      // This will go away with the new API.
      if (state.modelData && modelData) {
        state.modelData[modelInfo.uuid].info = modelInfo;
      }
    },
    clearModelData: (state) => {
      state.modelData = {};
      state.models = {};
      state.modelsLoaded = false;
    },
    clearControllerData: (state) => {
      state.controllers = {};
    },
    fetchCrossModelQuery: (
      state,
      action: PayloadAction<
        Pick<CrossModelQueryRequest, "query"> & WsControllerURLParam
      >
    ) => {
      state.crossModelQuery.loading = true;
    },
    updateCrossModelQuery: (
      state,
      { payload }: PayloadAction<CrossModelQueryFullResponse>
    ) => {
      // If "payload" is a string, it represents the error. In this case,
      // "results" gets set to null and "errors" gets set to "payload".
      state.crossModelQuery.results = isCrossModelQueryResponse(payload)
        ? payload.results
        : null;
      state.crossModelQuery.errors =
        isCrossModelQueryResponse(payload) && Object.keys(payload.errors).length
          ? payload.errors
          : typeof payload === "string"
          ? payload
          : null;
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
      action: PayloadAction<{
        controllers: Controllers[0];
        wsControllerURL: string;
      }>
    ) => {
      const controllers = state.controllers ?? {};
      controllers[action.payload.wsControllerURL] = action.payload.controllers;
      state.controllers = controllers;
    },
    populateMissingAllWatcherData: (
      state,
      action: PayloadAction<{ uuid: string; status: FullStatus }>
    ) => {
      if (!state.modelWatcherData) {
        state.modelWatcherData = {};
      }
      if (!state.modelWatcherData[action.payload.uuid]) {
        return;
      }
      state.modelWatcherData[action.payload.uuid].model = {
        ...(state.modelWatcherData[action.payload.uuid]?.model ?? {}),
        "cloud-tag": action.payload.status.model["cloud-tag"],
        type: action.payload.status.model.type,
        region: action.payload.status.model.region,
        version: action.payload.status.model.version,
      };
    },
    processAllWatcherDeltas: (
      state,
      action: PayloadAction<AllWatcherDelta[]>
    ) => {
      state.modelWatcherData = processDeltas(
        state.modelWatcherData,
        action.payload
      );
    },
    updateCharms: (
      state,
      action: PayloadAction<{ charms: Charm[]; wsControllerURL?: string }>
    ) => {
      action.payload.charms = action.payload.charms.filter((charm) => {
        return !state.charms.some((c) => c.url === charm.url);
      });
      state.charms = [...state.charms, ...action.payload.charms];
    },
    updateSelectedApplications: (
      state,
      action: PayloadAction<{ selectedApplications: ApplicationInfo[] }>
    ) => {
      state.selectedApplications = action.payload.selectedApplications;
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
