import { Connection } from "@canonical/jujulib";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { ManagedConnection } from "./connection-manager";

/**
 * Guard to test of an action has a connection URL in the payload.
 */
export function hasConnectionURL<P extends Record<string, unknown>>(
  action: PayloadAction<P>,
  key: string,
): action is PayloadAction<{ [key]: string } & P> {
  return key in action.payload && typeof action.payload[key] === "string";
}

/**
 * Guard to ensure that the given object has a `connections` key with provided connection keys.
 */
export function hasConnections<K extends string>(
  meta: Record<string, unknown>,
  connectionKeys: K[],
): meta is { connections: Record<K, ManagedConnection> } & Record<
  string,
  unknown
> {
  if (
    !(
      "connections" in meta &&
      typeof meta.connections === "object" &&
      meta.connections !== null
    )
  ) {
    return false;
  }
  const connections = meta.connections as Record<string, unknown>;
  return connectionKeys.every(
    (key) => key in connections && connections[key] instanceof Connection,
  );
}
