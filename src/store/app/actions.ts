import { createAction } from "@reduxjs/toolkit";

import type { Credential } from "store/general/types";

export const updatePermissions = createAction<{
  action: string;
  user: string;
  permissionTo?: string;
  permissionFrom?: string;
  modelUUID: string;
  wsControllerURL: string;
}>("app/updatePermissions");

export type ControllerArgs =
  | [
      // wsControllerURL
      string,
      // credentials
      Credential | undefined,
      // identityProviderAvailable
      boolean | undefined
    ]
  | [
      // wsControllerURL
      string,
      // credentials
      Credential | undefined,
      // identityProviderAvailable
      boolean | undefined,
      // additional controller
      boolean | undefined
    ];

export const connectAndPollControllers = createAction<{
  controllers: ControllerArgs[];
  isJuju: boolean;
}>("app/connectAndPollControllers");
