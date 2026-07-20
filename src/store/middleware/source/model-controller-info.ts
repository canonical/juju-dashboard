import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { ModelControllerInfo } from "juju/jimm/JIMMV4";
import { modelControllerInfo } from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

/**
 * Timeout in seconds to poll the model controller info.
 */
const MODEL_CONTROLLER_INFO_POLL_S = 5;

/**
 * Internal logic for `createModelControllerInfoSource`.
 *
 * Fetches model controller info (including upgrade-to job status) from JIMM.
 */
export function getModelControllerInfo(
  controllerConnection: ManagedConnection,
  modelUUID: string,
) {
  return async (): Promise<ModelControllerInfo> =>
    modelControllerInfo(controllerConnection, modelUUID);
}

/**
 * A source which will produce the controller info for the provided model UUID.
 */
export default function createModelControllerInfoSource(
  controllerConnection: ManagedConnection,
  modelUUID: string,
): Source<ModelControllerInfo> {
  return createPollingSource(
    getModelControllerInfo(controllerConnection, modelUUID),
    { interval: { seconds: MODEL_CONTROLLER_INFO_POLL_S } },
  );
}
