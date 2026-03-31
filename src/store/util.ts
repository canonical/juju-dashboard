import type { PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";

import type { ConnectionWithFacades } from "juju/types";

type MetaAction<P, M> = { meta: M } & PayloadAction<P>;

/**
 * Guard to ensure that the given action has `meta.connection` populated. This field is provided by
 * `connectionMiddleware`.
 */
export function actionWithConnection<P>(
  expectedAction: PayloadActionCreator<P>,
  action: unknown,
): action is MetaAction<P, { connection: ConnectionWithFacades }> {
  return (
    expectedAction.match(action) &&
    "meta" in action &&
    typeof action.meta === "object" &&
    action.meta !== null &&
    "connection" in action.meta
  );
}
