import { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import {
  ModelInfoResults,
  UserModelList,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllWatcherDelta } from "juju/types";
import { processDeltas } from "juju/watchers";
import { Controller, JujuState } from "./types";

const slice = createSlice({
  name: "juju",
  initialState: {
    controllers: null,
    models: {},
    modelData: {},
    modelWatcherData: {},
  } as JujuState,
  reducers: {
    updateModelList: (
      state,
      action: PayloadAction<{ models: UserModelList; wsControllerURL: string }>
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
        };
      });
      state.models = modelList;
    },
    updateModelStatus: (
      state,
      action: PayloadAction<{
        modelUUID: string;
        status: FullStatus;
        wsControllerURL: string;
      }>
    ) => {
      const modelUUID = action.payload.modelUUID;

      if (!state.modelData[modelUUID]) {
        state.modelData[modelUUID] = {};
      }
      // There is some data that we don't want to store because it changes
      // to often causing needless re-renders and is currently irrelevent
      // like controllerTimestamp so we have a allowlist for top level keys.
      const allowedKeys = [
        "annotations",
        "applications",
        "machines",
        "model",
        "offers",
        "relations",
        "remote-applications",
      ];

      allowedKeys.forEach((key) => {
        state.modelData[modelUUID][key] =
          action.payload.status[key as keyof FullStatus];
      });
      // The status doesn't contain a top level uuid and when this data is
      // fetched it doesn't contain the UUID.
      state.modelData[modelUUID].uuid = modelUUID;
    },
    updateModelInfo: (
      state,
      action: PayloadAction<{
        modelInfo: ModelInfoResults;
        wsControllerURL: string;
      }>
    ) => {
      const modelInfo = action.payload.modelInfo.results[0].result;
      // There don't appear to be any irrelevent data in the modelInfo so
      // we overwrite the whole object every time it changes even though
      // mostly that'll just be status timestamps.
      const modelData = state.modelData[modelInfo.uuid];
      // If any of the status requests timeout then it's possible the data
      // won't be available. Just abandon saving any data in that case.
      // This will go away with the new API.
      if (modelData) {
        state.modelData[modelInfo.uuid].info = modelInfo;
      }
    },
    clearModelData: (state) => {
      state.modelData = {};
      state.models = {};
    },
    clearControllerData: (state) => {
      state.controllers = {};
    },
    updateControllerList: (
      state,
      action: PayloadAction<{
        controllers: Controller[];
        wsControllerURL: string;
      }>
    ) => {
      let controllers = state.controllers ?? {};
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
  },
});

export const { actions, reducer } = slice;

export default reducer;
