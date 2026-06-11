import type { PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";

import type { Source } from "data";
import type { ConnectionWithFacades } from "juju/types";
import { isMetaAction } from "types";
import { toErrorString } from "utils";

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

/**
 * Convert a source error to a serializable value.
 */
export const toSerializableSourceError = (
  error: Source<unknown>["error"],
): { message: string; source: string } | null => {
  if (!error) {
    return error;
  }
  return {
    message: error.message,
    source: toErrorString(error.source),
  };
};
