import { createAction } from "@reduxjs/toolkit";
import { Credential } from "store/general/types";

export const updatePermissions = createAction<{
  action: string;
  user: string;
  permissionTo?: string;
  permissionFrom?: string;
  modelUUID: string;
  wsControllerURL: string;
}>("app/updatePermissions");

export type ControllerArgs = [
  string,
  Credential | undefined,
  boolean | undefined
];

export const connectAndPollControllers = createAction<{
  controllers: ControllerArgs[];
  isJuju: boolean;
}>("app/connectAndPollControllers");
