import type { AppDispatch } from "store/store";
import type { WindowConfig } from "types";

import { CandidAuth, LocalAuth, OIDCAuth } from ".";

/**
 * From the provided config, initialise the `Auth` singleton instance with the correct auth
 * implementation.
 */
export function initialiseAuthFromConfig(
  config: WindowConfig,
  dispatch: AppDispatch,
) {
  if (!config.isJuju) {
    new OIDCAuth(dispatch);
    return;
  }
  if (config.identityProviderURL) {
    new CandidAuth(dispatch);
    return;
  }
  new LocalAuth(dispatch);
}
