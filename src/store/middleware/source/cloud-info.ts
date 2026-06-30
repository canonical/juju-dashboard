import type { CloudsResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";

import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { toSerializableSourceError } from "store/util";

import { hasConnections } from "../connection/util";
import { createSourceInstance } from "../source-middleware";

export const NO_CLOUD_FACADE =
  "Cloud facade is not available on the connection";

export async function getCloudInfo(
  connection: ConnectionWithFacades,
): Promise<CloudsResult["clouds"]> {
  if (!connection.facades.cloud) {
    throw new Error(NO_CLOUD_FACADE);
  }

  const response = (await connection.facades.cloud?.clouds({})) ?? {};
  return response.clouds;
}

export default createSourceInstance<
  { wsControllerURL: string },
  CloudsResult["clouds"]
>(
  "cloud-info",
  ({ wsControllerURL: _, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    if (!connection?.info.user?.identity) {
      throw new Error("not authenticated with controller");
    }

    return createPollingSource(async () => getCloudInfo(connection), {
      interval: { seconds: 30 },
    });
  },
  {
    setData: (_, data) =>
      jujuActions.updateCloudInfo({
        update: { data },
      }),
    setError: (_, error) =>
      jujuActions.updateCloudInfo({
        update: { error: toSerializableSourceError(error) },
      }),
    setLoading: (_, loading) =>
      jujuActions.updateCloudInfo({
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
