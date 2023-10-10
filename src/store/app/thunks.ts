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
  localStorage.removeItem("additionalControllers");
  Object.entries(pingerIntervalIds ?? {}).forEach((pingerIntervalId) =>
    clearInterval(pingerIntervalId[1])
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
  let additionalControllers: ControllerArgs[] | null = null;
  try {
    const data = window.localStorage.getItem("additionalControllers");
    if (data) {
      additionalControllers = JSON.parse(data);
      additionalControllers?.forEach((controller) => {
        thunkAPI.dispatch(
          generalActions.storeUserPass({
            wsControllerURL: controller[0],
            credential: controller[1],
          })
        );
        thunkAPI.dispatch(
          jujuActions.updateControllerList({
            wsControllerURL: controller[0],
            controllers: [{ additionalController: true }],
          })
        );
      });
    }
    await thunkAPI.dispatch(connectAndListModels(additionalControllers));
  } catch (e) {
    // XXX Add to Sentry.
    console.log("Error retrieving additional registered controllers", e);
  }
});

export const connectAndListModels = createAsyncThunk<
  void,
  ControllerArgs[] | null,
  {
    state: RootState;
  }
>("app/connectAndListModels", async (additionalControllers, thunkAPI) => {
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
    if (additionalControllers) {
      controllerList = controllerList.concat(additionalControllers);
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
      })
    );
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry if it's an error that's not connection related
    // a common error returned by this is:
    // Something went wrong:  cannot send request {"type":"ModelManager","request":"ListModels","version":5,"params":...}: connection state 3 is not open
    console.error("Something went wrong: ", error);
  }
});
