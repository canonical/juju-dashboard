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
  This typeguard can be used to check if a Redux action includes a payload.
  */
export const isPayloadAction = (
  action: UnknownAction,
): action is PayloadAction<Record<string, unknown>> =>
  isAction(action) &&
  "payload" in action &&
  !!action.payload &&
  typeof action.payload === "object";

export const isSpecificAction = <A extends Action>(
  action: UnknownAction,
  actionType: string,
): action is A => isPayloadAction(action) && action.type === actionType;
