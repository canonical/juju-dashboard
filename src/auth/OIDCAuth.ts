import type { ConnectOptions } from "@canonical/jujulib";
import { unwrapResult } from "@reduxjs/toolkit";

import * as jimmListeners from "juju/jimm/listeners";
import * as jimmThunks from "juju/jimm/thunks";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
import { listenerMiddleware } from "store/listenerMiddleware";
import type { AppDispatch } from "store/store";
import { logger } from "utils/logger";

import type { ControllerData } from "./Auth";
import { Auth } from "./Auth";

export enum Label {
  WHOAMI = "Unable to check authentication status. You can attempt to log in anyway.",
  POLLING_ERROR = "Error while trying to connect and start polling.",
}

export class OIDCAuth extends Auth {
  constructor(dispatch: AppDispatch) {
    super(dispatch, AuthMethod.OIDC);
  }

  override async bootstrap(): Promise<void> {
    jimmListeners.addWhoamiListener(listenerMiddleware.startListening);

    try {
      // Try and connect automatically.
      unwrapResult(await this.dispatch(appThunks.connectAndStartPolling()));
    } catch (error) {
      logger.error(Label.POLLING_ERROR, error);
    }
  }

  override async logout(): Promise<void> {
    this.dispatch(jimmListeners.pollWhoamiStop());
    await this.dispatch(jimmThunks.logout());
  }

  override async beforeControllerConnect({
    wsControllerURL,
  }: ControllerData): Promise<boolean> {
    try {
      // TODO: Hoist loading state into model-poller
      this.dispatch(generalActions.updateLoginLoading(true));
      const whoamiResponse = await this.dispatch(jimmThunks.whoami());
      const user = unwrapResult(whoamiResponse);
      if (user) {
        // Start polling the whoami endpoint to handle refresh tokens
        // and revoked sessions.
        this.dispatch(jimmListeners.pollWhoamiStart());
      } else {
        // If there's no response that means the user is not
        // authenticated, so halt the connection attempt.
        // TODO: Hoist loading state into model-poller
        this.dispatch(generalActions.updateLoginLoading(false));
        return false;
      }
    } catch (error) {
      this.dispatch(
        generalActions.storeLoginError({
          wsControllerURL,
          error: Label.WHOAMI,
        }),
      );
      // Halt the connection attempt.
      return false;
    }

    return true;
  }

  override jujulibConnectOptions(): Partial<ConnectOptions> {
    return {
      // TODO: Replace with libjuju@8.0.1
      oidcEnabled: true,
    };
  }
}
