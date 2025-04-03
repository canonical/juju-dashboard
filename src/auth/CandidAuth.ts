import * as jujuApi from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { thunks as appThunks } from "store/app";
import type { AppDispatch } from "store/store";

import { Auth } from "./Auth";
import { pollingMixin } from "./mixins";

import { AuthMethod } from ".";

export class CandidAuth extends pollingMixin(Auth) {
  constructor(dispatch: AppDispatch) {
    super(dispatch, AuthMethod.CANDID);
  }

  override async logout(): Promise<void> {
    // To enable users to log back in after logging out we have to re-connect
    // to the controller to get another wait url and start polling on it
    // again.
    await this.dispatch(appThunks.connectAndStartPolling());
  }

  override async afterControllerListFetched(
    conn: ConnectionWithFacades,
  ): Promise<void> {
    // This call will be a noop if the user isn't an administrator
    // on the JIMM controller we're connected to.
    try {
      await jujuApi.disableControllerUUIDMasking(conn);
    } catch (e) {
      // Silently fail, if this doesn't work then the user isn't authorized
      // to perform the action.
    }
  }
}
