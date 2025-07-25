import { unwrapResult } from "@reduxjs/toolkit";

import bakery from "juju/bakery";
import { thunks } from "store/app";
import { actions } from "store/general";
import { type AppDispatch } from "store/store";
import { logger } from "utils/logger";

import { Label } from "../types";

export function login(
  dispatch: AppDispatch,
  wsControllerURL: string | undefined,
  { user, password }: { user: string; password: string },
) {
  dispatch(actions.cleanupLoginErrors());
  dispatch(
    actions.storeUserPass({
      wsControllerURL,
      credential: { user, password },
    }),
  );
  dispatch(actions.updateLoginLoading(true));
  if (bakery) {
    dispatch(thunks.connectAndStartPolling())
      .then(unwrapResult)
      .catch((error) => logger.error(Label.POLLING_ERROR, error));
  }
}
