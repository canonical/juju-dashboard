import { unwrapResult } from "@reduxjs/toolkit";

import { thunks as appThunks } from "store/app";
import { logger } from "utils/logger";

import type { Auth } from "../Auth";

export enum Label {
  POLLING_ERROR = "Error while trying to connect and start polling.",
}

/**
 * Class mixin which will override the `bootstrap` method so that it begins polling the controller.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends#mix-ins}
 */
export function pollingMixin(Base: typeof Auth) {
  return class extends Base {
    override async bootstrap(): Promise<void> {
      try {
        // Try and connect automatically.
        unwrapResult(await this.dispatch(appThunks.connectAndStartPolling()));
      } catch (error) {
        logger.error(Label.POLLING_ERROR, error);
      }
    }
  };
}
