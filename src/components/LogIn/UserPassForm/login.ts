import { unwrapResult } from "@reduxjs/toolkit";

import bakery from "juju/bakery";
import { thunks } from "store/app";
import { actions } from "store/general";
import type { AppDispatch } from "store/store";
import { logger } from "utils/logger";

import { Label } from "../types";

export function login(
  dispatch: AppDispatch,
  wsControllerURL: null | string,
  { user, password }: { user: string; password: string },
): void {
  dispatch(actions.cleanupLoginErrors());
  if (wsControllerURL !== null && wsControllerURL) {
    dispatch(
      actions.storeUserPass({
        wsControllerURL,
        credential: { user, password },
      }),
    );
  }
  dispatch(actions.updateLoginLoading(true));
  const hasBakery = Boolean(bakery);
  if (hasBakery) {
    dispatch(thunks.connectAndStartPolling())
      .then(unwrapResult)
      .catch((error) => {
        logger.error(Label.POLLING_ERROR, error);
      });
  }
}
