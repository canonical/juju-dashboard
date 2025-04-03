import type { ConnectOptions } from "@canonical/jujulib";
import { unwrapResult } from "@reduxjs/toolkit";

import * as jimmListeners from "juju/jimm/listeners";
import * as jimmThunks from "juju/jimm/thunks";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
import { listenerMiddleware } from "store/listenerMiddleware";
import type { AppDispatch } from "store/store";

import { Auth, type ControllerData } from "./Auth";
import { pollingMixin } from "./mixins";

export enum Label {
  WHOAMI = "Unable to check authentication status. You can attempt to log in anyway.",
}

export class OIDCAuth extends pollingMixin(Auth) {
  constructor(dispatch: AppDispatch) {
    super(dispatch, AuthMethod.OIDC);
  }

  override async bootstrap(): Promise<void> {
    jimmListeners.addWhoamiListener(listenerMiddleware.startListening);
    await super.bootstrap();
  }

  override async logout(): Promise<void> {
    this.dispatch(jimmListeners.pollWhoamiStop());
    await this.dispatch(jimmThunks.logout());
  }

  override async beforeControllerConnect({
    wsControllerURL,
  }: ControllerData): Promise<boolean> {
    try {
      const whoamiResponse = await this.dispatch(jimmThunks.whoami());
      const user = unwrapResult(whoamiResponse);
      if (user) {
        // Start polling the whoami endpoint to handle refresh tokens
        // and revoked sessions.
        this.dispatch(jimmListeners.pollWhoamiStart());
      } else {
        // If there's no response that means the user is not
        // authenticated, so halt the connection attempt.
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
      loginWithSessionCookie: true,
    };
  }
}
