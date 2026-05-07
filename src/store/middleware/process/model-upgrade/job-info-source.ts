import type { Source } from "data";
import { createPollingSource } from "data/pollingSource";
import type { JobInfoResponse } from "juju/jimm/JIMMV4";
import { jobInfo } from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

/**
 * Timeout in seconds to poll the job info.
 */
const JOB_INFO_POLL_S = 5;

/**
 * Internal logic for `createJobInfoSource`.
 *
 * Saves a connection, and whenever the returned function is called, it will try to call the
 * `fullStatus` facade method. If the call fails, it will clear the connection, and attempt to
 * reconnect on the next call.
 */
export function getJobInfo(
  controllerConnection: ManagedConnection,
  jobId: string,
) {
  return async (): Promise<JobInfoResponse> =>
    jobInfo(controllerConnection, jobId);
}

/**
 * A source which will produce the version of a model, or an indication that it's being reconnected
 * to.
 */
export default function createJobInfoSource(
  controllerConnection: ManagedConnection,
  jobId: string,
): Source<JobInfoResponse> {
  return createPollingSource(getJobInfo(controllerConnection, jobId), {
    interval: { seconds: JOB_INFO_POLL_S },
  });
}
