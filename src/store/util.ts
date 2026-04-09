import type { PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";

import type { ConnectionWithFacades } from "juju/types";

/**
 * Guard to ensure that the given action has `meta.connection` populated. This field is provided by
 * `connectionMiddleware`.
 */
export function actionWithConnection<P, T extends string>(
  expectedAction: PayloadActionCreator<P, T>,
  action: unknown,
): action is PayloadAction<P, T, { connection: ConnectionWithFacades }> {
  return (
    expectedAction.match(action) &&
    "meta" in action &&
    typeof action.meta === "object" &&
    action.meta !== null &&
    "connection" in action.meta
  );
}
