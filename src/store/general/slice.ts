import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { GeneralState, ControllerFeatures } from "./types";

const slice = createSlice({
  name: "general",
  initialState: {
    appVersion: null,
    config: null,
    connectionError: null,
    controllerConnections: null,
    controllerFeatures: null,
    credentials: null,
    loginError: null,
    pingerIntervalIds: null,
    visitURL: null,
  } as GeneralState,
  reducers: {
    cleanupLoginErrors: (state) => {
      state.loginError = null;
    },
    updateControllerConnection: (state, action) => {
      const connections = state.controllerConnections ?? {};
      connections[action.payload.wsControllerURL] = action.payload.info;
      state.controllerConnections = connections;
    },
    updateControllerFeatures: (
      state,
      action: PayloadAction<{
        wsControllerURL: string;
        features: ControllerFeatures;
      }>
    ) => {
      const features = state.controllerFeatures ?? {};
      features[action.payload.wsControllerURL] = action.payload.features;
      state.controllerFeatures = features;
    },
    storeConfig: (state, action) => {
      state.config = action.payload;
    },
    storeConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
    },
    storeLoginError: (state, action) => {
      state.loginError = action.payload;
    },
    storeUserPass: (state, action) => {
      const credentials = state.credentials ?? {};
      credentials[action.payload.wsControllerURL] = action.payload.credential;
      state.credentials = credentials;
    },
    storeVersion: (state, action) => {
      state.appVersion = action.payload;
    },
    storeVisitURL: (state, action) => {
      state.visitURL = action.payload;
    },
    logOut: (state) => {
      state.controllerConnections = null;
      state.credentials = null;
      state.pingerIntervalIds = null;
      state.visitURL = null;
    },
    updatePingerIntervalId: (state, action) => {
      const intervals = state.pingerIntervalIds ?? {};
      intervals[action.payload.wsControllerURL] = action.payload.intervalId;
      state.pingerIntervalIds = intervals;
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
