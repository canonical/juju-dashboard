import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { ConnectionWithFacades } from "juju/types";

import type {
  GeneralState,
  ControllerFeatures,
  Config,
  AuthCredential,
} from "./types";

const slice = createSlice({
  name: "general",
  initialState: {
    appVersion: null,
    config: null,
    connectionError: null,
    controllerConnections: null,
    controllerFeatures: null,
    credentials: null,
    login: null,
    pingerIntervalIds: null,
    visitURLs: null,
  } as GeneralState,
  reducers: {
    cleanupLoginErrors: (state) => {
      state.login = {
        ...state.login,
        errors: {},
      };
    },
    updateControllerConnection: (
      state,
      action: PayloadAction<{
        wsControllerURL: string;
        info: ConnectionWithFacades["info"];
      }>,
    ) => {
      const connections = state.controllerConnections ?? {};
      connections[action.payload.wsControllerURL] = action.payload.info;
      state.controllerConnections = connections;
    },
    updateControllerFeatures: (
      state,
      action: PayloadAction<{
        wsControllerURL: string;
        features: ControllerFeatures;
      }>,
    ) => {
      const features = state.controllerFeatures ?? {};
      features[action.payload.wsControllerURL] = action.payload.features;
      state.controllerFeatures = features;
    },
    storeConfig: (state, action: PayloadAction<Config>) => {
      state.config = action.payload;
    },
    storeConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
    },
    storeLoginError: (
      state,
      action: PayloadAction<{ wsControllerURL: string; error: string }>,
    ) => {
      state.login ??= {};
      state.login = {
        loading: false,
        errors: { [action.payload.wsControllerURL]: action.payload.error },
      };
    },
    storeUserPass: (
      state,
      action: PayloadAction<{
        wsControllerURL: string;
        credential: AuthCredential;
      }>,
    ) => {
      const credentials = state.credentials ?? {};
      credentials[action.payload.wsControllerURL] = action.payload.credential;
      state.credentials = credentials;
    },
    storeVersion: (state, action: PayloadAction<null | string>) => {
      state.appVersion = action.payload;
    },
    storeVisitURL: (state, action: PayloadAction<string>) => {
      state.visitURLs ??= [];
      state.visitURLs.push(action.payload);
    },
    removeVisitURL: (state, action: PayloadAction<string>) => {
      if (state.visitURLs) {
        state.visitURLs = state.visitURLs?.filter(
          (url) => url !== action.payload,
        );
      }
    },
    clearVisitURLs: (state) => {
      state.visitURLs = null;
    },
    logOut: (state) => {
      state.controllerConnections = null;
      state.credentials = null;
      state.pingerIntervalIds = null;
      state.visitURLs = null;
    },
    updatePingerIntervalId: (
      state,
      action: PayloadAction<{ wsControllerURL: string; intervalId: number }>,
    ) => {
      const intervals = state.pingerIntervalIds ?? {};
      intervals[action.payload.wsControllerURL] = action.payload.intervalId;
      state.pingerIntervalIds = intervals;
    },
    updateLoginLoading: (state, action: PayloadAction<boolean>) => {
      state.login ??= {};
      state.login.loading = action.payload;
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
