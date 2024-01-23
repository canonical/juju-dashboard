import { createAsyncThunk } from "@reduxjs/toolkit";

import bakery from "juju/bakery";
import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import {
  getConfig,
  getControllerConnections,
  getPingerIntervalIds,
  getUserPass,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";

import type { ControllerArgs } from "./actions";

export const logOut = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
  }
>("app/logout", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const identityProviderAvailable =
    state?.general?.config?.identityProviderAvailable;
  const pingerIntervalIds = getPingerIntervalIds(state);
  bakery.storage.clear();
  Object.entries(pingerIntervalIds ?? {}).forEach((pingerIntervalId) =>
    clearInterval(pingerIntervalId[1]),
  );
  thunkAPI.dispatch(jujuActions.clearModelData());
  thunkAPI.dispatch(jujuActions.clearControllerData());
  thunkAPI.dispatch(generalActions.logOut());
  if (identityProviderAvailable) {
    // To enable users to log back in after logging out we have to re-connect
    // to the controller to get another wait url and start polling on it
    // again.
    await thunkAPI.dispatch(connectAndStartPolling());
  }
});

/**
  Trigger the connection and polling of models.
*/
export const connectAndStartPolling = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
  }
>("app/connectAndStartPolling", async (_, thunkAPI) => {
  try {
    const storeState = thunkAPI.getState();
    const config = getConfig(storeState);
    const wsControllerURL = getWSControllerURL(storeState);
    const credentials = getUserPass(storeState, wsControllerURL);
    const controllerConnections = getControllerConnections(storeState) || {};
    let controllerList: ControllerArgs[] = [];
    if (wsControllerURL) {
      controllerList.push([
        wsControllerURL,
        credentials,
        config?.identityProviderAvailable,
      ]);
    }
    const connectedControllers = Object.keys(controllerConnections);
    controllerList = controllerList.filter((controllerData) => {
      // remove controllers we're already connected to.
      return !connectedControllers.includes(controllerData[0]);
    });

    thunkAPI.dispatch(
      appActions.connectAndPollControllers({
        controllers: controllerList,
        isJuju: config?.isJuju ?? false,
      }),
    );
    throw new Error("dummy error");
  } catch (error) {
    // a common error logged to the console by this is:
    // Error while triggering the connection and polling of models. cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error(
      "Error while triggering the connection and polling of models.",
      error,
    );
    let errorMessage;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage =
        "Something went wrong. View the console log for more details.";
    }
    thunkAPI.dispatch(
      generalActions.storeConnectionError(`Unable to connect: ${errorMessage}`),
    );
  }
});
