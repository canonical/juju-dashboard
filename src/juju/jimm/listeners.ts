import type { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { createAction, TaskAbortError } from "@reduxjs/toolkit";

import { OIDC_POLL_INTERVAL } from "consts";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { getWSControllerURL } from "store/general/selectors";
import type { RootState, AppDispatch } from "store/store";
import { toErrorString } from "utils";

import { endpoints } from "./api";

export enum Label {
  ERROR_AUTHENTICATION = "Authentication error.",
  ERROR_LOGGED_OUT = "You have been logged out.",
}

export const pollWhoamiStart = createAction("jimm/pollWhoami/start");
export const pollWhoamiStop = createAction("jimm/pollWhoami/stop");

export const addWhoamiListener = (
  startListening: ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    unknown
  >["startListening"],
) => {
  startListening({
    actionCreator: pollWhoamiStart,
    effect: async (_action, listenerApi) => {
      listenerApi.unsubscribe();
      const pollingTask = listenerApi.fork(async (forkApi) => {
        try {
          while (true) {
            await forkApi.delay(OIDC_POLL_INTERVAL);
            const response = await forkApi.pause(
              fetch(endpoints().whoami, { credentials: "include" }),
            );
            // Handle the user no longer logged in:
            if (response.status === 401 || response.status === 403) {
              throw new Error(Label.ERROR_LOGGED_OUT);
            }
            // Handle all other API errors:
            if (!response.ok) {
              throw new Error(Label.ERROR_AUTHENTICATION);
            }
          }
        } catch (error) {
          if (error instanceof TaskAbortError) {
            // Polling was aborted e.g. when clicking "log out". Don't display
            // this to the user.
            return;
          }
          const wsControllerURL = getWSControllerURL(listenerApi.getState());
          if (wsControllerURL !== null && wsControllerURL) {
            listenerApi.dispatch(
              generalActions.storeLoginError({
                error: toErrorString(error),
                wsControllerURL,
              }),
            );
          }
          // If the user no longer has access then clean up state and display the login screen.
          await listenerApi.dispatch(appThunks.logOut());
        }
      });
      await listenerApi.condition(pollWhoamiStop.match);
      pollingTask.cancel();
    },
  });
};
