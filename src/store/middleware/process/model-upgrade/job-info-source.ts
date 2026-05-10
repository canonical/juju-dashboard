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
 * Fetches job info from JIMM.
 */
export function getJobInfo(
  controllerConnection: ManagedConnection,
  jobId: string,
) {
  return async (): Promise<JobInfoResponse> =>
    jobInfo(controllerConnection, jobId);
}

/**
 * A source which will produce the job info for the provided id.
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
