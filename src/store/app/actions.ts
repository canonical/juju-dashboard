import { createAction } from "@reduxjs/toolkit";

import type { AuthCredential } from "store/general/types";
import type { NotificationSeverity } from "utils/toastNotification";

export const updatePermissions = createAction<{
  action: string;
  user: string;
  permissionTo?: string;
  permissionFrom?: string;
  modelUUID: string;
  wsControllerURL: string;
}>("app/updatePermissions");

export type ControllerArgs = [
  // wsControllerURL
  string,
  (
    // credentials
    AuthCredential | undefined
  ),
];

/**
 * Connect each of the provided controllers.
 */
export const connectAndPollControllers = createAction<{
  controllers: ControllerArgs[];
  isJuju: boolean;
}>("app/connectAndPollControllers");

/**
 * For each model present within Redux, fetch and store the model status.
 */
export const updateModelStatuses = createAction("app/updateModelStatuses");

/**
 * Create a toast notification via the Redux middleware.
 */
export const createToast = createAction<{
  message: string;
  severity?: NotificationSeverity;
}>("app/createToast");
