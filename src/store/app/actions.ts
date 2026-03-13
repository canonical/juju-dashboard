import { createAction } from "@reduxjs/toolkit";

import type { AuthCredential } from "store/general/types";

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
 * Connect each of the provided controllers, and begin polling them for updates via
 * `app/beginPollingModelList`.
 */
export const connectAndPollControllers = createAction<{
  controllers: ControllerArgs[];
  isJuju: boolean;
  // This arg is intended to prevent polling from starting in a testing scenario.
  poll?: number;
}>("app/connectAndPollControllers");
/**
 * For each connected controller, fetch a list of models, and store them in Redux. Once the models
 * have been added, trigger `updateModelStatuses`.
 */
export const beginPollingModelList = createAction<{ poll?: number }>(
  "app/beginPollingModelList",
);
/**
 * For each model present within Redux, fetch and store the model status.
 */
export const updateModelStatuses = createAction<{ pollIteration: number }>(
  "app/updateModelStatuses",
);
