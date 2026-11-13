import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { toSerializableSourceError } from "store/util";

import { hasConnections } from "../connection/util";
import { createSourceInstance } from "../source-middleware";

export const NOT_AUTHENTICATED_ERROR = "not authenticated with controller";
export const NO_CLOUD_FACADE =
  "Cloud facade is not available on the connection";

export async function getUserCredentials(
  connection: ConnectionWithFacades,
  cloudTags: string[],
): Promise<Record<string, string[]>> {
  const userTag = connection.info.user?.identity;
  if (!userTag) {
    throw new Error(NOT_AUTHENTICATED_ERROR);
  }
  if (!connection.facades.cloud) {
    throw new Error(NO_CLOUD_FACADE);
  }
  if (!cloudTags.length) {
    return {};
  }

  const response = await connection.facades.cloud.userCredentials({
    "user-clouds": cloudTags.map((cloudTag) => ({
      "cloud-tag": cloudTag,
      "user-tag": userTag,
    })),
  });

  // The facade returns one result for each requested cloud, in the same order.
  // A cloud whose lookup failed (or has no result) is left out, instead of being
  // reported as having no credentials, so that it is looked up again.
  const credentials: Record<string, string[]> = {};
  cloudTags.forEach((tag, i) => {
    const cloudResult = response?.results[i];
    if (cloudResult && !cloudResult.error) {
      credentials[tag] = cloudResult.result ?? [];
    }
  });
  return credentials;
}

export default createSourceInstance<
  { wsControllerURL: string; cloudTags: string[] },
  Record<string, string[]>
>(
  "user-credentials",
  ({ wsControllerURL: _, cloudTags, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(
      async () => getUserCredentials(connection, cloudTags),
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: (_args, data) =>
      jujuActions.updateUserCredentials({ update: { data } }),
    setError: (_args, error) =>
      jujuActions.updateUserCredentials({
        update: { error: toSerializableSourceError(error) },
      }),
    setLoading: (_args, loading) =>
      jujuActions.updateUserCredentials({ update: { loading } }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
