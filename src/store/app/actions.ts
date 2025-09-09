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
  // credentials
  AuthCredential | undefined,
];

export const connectAndPollControllers = createAction<{
  controllers: ControllerArgs[];
  isJuju: boolean;
  // This arg is intended to prevent polling from starting in a testing scenario.
  poll?: number;
}>("app/connectAndPollControllers");
