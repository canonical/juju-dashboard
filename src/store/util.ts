import type { PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";

import type { ConnectionWithFacades } from "juju/types";
import { isMetaAction } from "types";

import { hasConnections } from "./middleware/connection/util";

/**
 * Guard to ensure that the given action has `meta.connections` populated with expected connection
 * keys. This field is provided by `connectionMiddleware`.
 */
export function actionWithConnections<P, T extends string, K extends string>(
  expectedAction: PayloadActionCreator<P, T>,
  action: unknown,
  connectionKeys: K[],
): action is PayloadAction<
  P,
  T,
  { connections: Record<K, ConnectionWithFacades> } & Record<string, unknown>
> {
  return (
    expectedAction.match(action) &&
    isMetaAction(action) &&
    hasConnections(action.meta, connectionKeys)
  );
}
