/*
  Redux middleware that gates every request on authentication unless an action
  has been allowed.
*/

import { isAction, type Middleware } from "redux";

import { createToast } from "store/app/actions";
import type { RootState, Store } from "store/store";
import { isSpecificAction } from "types";
import { toastNotification } from "utils/toastNotification";

/**
  Redux middleware to enable gating actions on the respective controller
  authentication.
  @param action The typical Redux action or thunk to execute
  @param options Any options that this checker needs to perform an
    appropriate auth check.
      wsControllerURL: The full controller websocket url that the controller
        is stored under in redux in order to determine it's logged in status.
*/
export const notificationsMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = () => (next) => (action) => {
  if (!isAction(action)) {
    return next(action);
  }
  if (
    isSpecificAction<ReturnType<typeof createToast>>(action, createToast.type)
  ) {
    toastNotification(action.payload.message, action.payload.severity);
    // Don't need to pass this notifications on to other middleware.
    return;
  }
  return next(action);
};

export default notificationsMiddleware;
