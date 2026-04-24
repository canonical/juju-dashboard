import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";

import { hasConnections } from "../connection/util";
import { createSourceMiddleware } from "../source-middleware";

export const NOT_AUTHENTICATED_ERROR = "not authenticated with controller";
export const NO_CLOUD_FACADE =
  "Cloud facade is not available on the connection";

export async function getUserCredentials(
  connection: ConnectionWithFacades,
  cloudTag: string,
): Promise<string[]> {
  if (!connection.info.user?.identity) {
    throw new Error(NOT_AUTHENTICATED_ERROR);
  }
  if (!connection.facades.cloud) {
    throw new Error(NO_CLOUD_FACADE);
  }

  const response = await connection.facades.cloud?.userCredentials({
    "user-clouds": [
      {
        "cloud-tag": cloudTag,
        "user-tag": connection.info.user.identity,
      },
    ],
  });
  return response?.results[0]?.result ?? [];
}

export default createSourceMiddleware<
  string[],
  { wsControllerURL: string; cloudTag: string }
>(
  "user-credentials",
  ({ wsControllerURL: _, cloudTag, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(
      async () => getUserCredentials(connection, cloudTag),
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: ({ cloudTag }, data) =>
      jujuActions.updateUserCredentials({
        cloudTag,
        update: { data: { [cloudTag]: data } },
      }),
    setError: ({ cloudTag }, error) =>
      jujuActions.updateUserCredentials({ cloudTag, update: { error } }),
    setLoading: ({ cloudTag }, loading) =>
      jujuActions.updateUserCredentials({
        cloudTag,
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
