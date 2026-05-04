import type { PayloadAction } from "@reduxjs/toolkit";
import type { Action, UnknownAction } from "redux";
import { isAction } from "redux";

import type { Config } from "store/general/types";

declare global {
  interface Window {
    jujuDashboardConfig?: Config;
  }
}

/*
 * This type can be used for React props where a component needs to provide the
 * props from either A or B, but prevent a mix of both.
 */
export type ExclusiveProps<A, B> =
  | (A & Partial<Record<keyof B, never>>)
  | (B & Partial<Record<keyof A, never>>);

/*
  This type guard can be used to check if a Redux action includes a payload.
  */
export const isPayloadAction = (
  action: UnknownAction,
): action is PayloadAction<Record<string, unknown>> =>
  isAction(action) &&
  "payload" in action &&
  !!action.payload &&
  typeof action.payload === "object";

/**
 * Guard to ensure action has `meta` key.
 */
export const isMetaAction = <P, T extends string>(
  action: PayloadAction<P, T>,
): action is PayloadAction<P, T, Record<string, unknown>> => {
  return (
    "meta" in action && typeof action.meta === "object" && action.meta !== null
  );
};

export const isSpecificAction = <A extends Action>(
  action: UnknownAction,
  actionType: string,
): action is A => isPayloadAction(action) && action.type === actionType;

export enum FeatureFlags {
  REBAC = "rebac",
}

export type Nullable<T> = {
  [P in keyof T]: null | T[P];
};

export const isKeyOf = <O extends object>(
  key: PropertyKey,
  data: O,
): key is keyof O => !!key && typeof key === "string" && key in data;

export enum AccessLevel {
  ADMIN = "admin",
  READ = "read",
  WRITE = "write",
}
